#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd -- "${SCRIPT_DIR}/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-ainews}"
BRANCH="${BRANCH:-main}"
APP_USER="${APP_USER:-$(stat -c '%U' "${APP_DIR}")}"
PORT="${PORT:-3000}"

log() {
  printf '\n[AI 风向标] %s\n' "$*"
}

fail() {
  printf '\n[AI 风向标] 部署失败：%s\n' "$*" >&2
  exit 1
}

[[ "${EUID}" -eq 0 ]] || fail "请使用 sudo 运行，以便安全地重启 systemd 服务。"
[[ "${APP_DIR}" =~ ^/[A-Za-z0-9._/-]+$ && "${APP_DIR}" != "/" ]] ||
  fail "安装目录必须是安全的绝对路径且不能是 /。"
[[ -d "${APP_DIR}/.git" ]] || fail "${APP_DIR} 不是 Git 仓库。"
id "${APP_USER}" >/dev/null 2>&1 || fail "系统用户 ${APP_USER} 不存在。"

run_as_app() {
  runuser -u "${APP_USER}" -- "$@"
}

if [[ -n "$(run_as_app git -C "${APP_DIR}" status --porcelain)" ]]; then
  fail "服务器工作区存在未提交修改，已停止更新。"
fi

backup_dir="$(mktemp -d)"
cleanup() {
  rm -rf -- "${backup_dir}"
}
trap cleanup EXIT

if [[ -d "${APP_DIR}/dist/standalone" ]]; then
  cp -a "${APP_DIR}/dist/standalone" "${backup_dir}/standalone"
fi

rollback() {
  if [[ -d "${backup_dir}/standalone" ]]; then
    log "恢复上一版可运行构建"
    rm -rf -- "${APP_DIR}/dist/standalone"
    install -d -o "${APP_USER}" -g "${APP_USER}" "${APP_DIR}/dist"
    cp -a "${backup_dir}/standalone" "${APP_DIR}/dist/standalone"
    chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/dist/standalone"
    systemctl restart "${SERVICE_NAME}" || true
  fi
}

log "拉取 ${BRANCH} 最新代码"
run_as_app git -C "${APP_DIR}" fetch origin "${BRANCH}"
run_as_app git -C "${APP_DIR}" checkout "${BRANCH}"
run_as_app git -C "${APP_DIR}" merge --ff-only "origin/${BRANCH}"

log "安装锁定依赖并执行测试"
if ! run_as_app npm --prefix "${APP_DIR}" ci ||
  ! run_as_app npm --prefix "${APP_DIR}" test; then
  rollback
  fail "测试未通过，服务仍保留上一版构建。"
fi

log "重启服务"
systemctl restart "${SERVICE_NAME}"

health_url="http://127.0.0.1:${PORT}/"
for _ in {1..20}; do
  if curl -fsS "${health_url}" | grep -q "AI 风向标"; then
    log "部署完成：$(run_as_app git -C "${APP_DIR}" rev-parse --short HEAD)"
    exit 0
  fi
  sleep 1
done

rollback
fail "新版本健康检查失败，已经回滚到上一版构建。"
