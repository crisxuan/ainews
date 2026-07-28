#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="https://github.com/crisxuan/ainews.git"
BRANCH="main"
APP_DIR="/opt/ainews"
APP_USER="ainews"
PORT="3000"
DOMAIN="_"
WITH_NGINX="true"

log() {
  printf '\n[AI 风向标] %s\n' "$*"
}

fail() {
  printf '\n[AI 风向标] 安装失败：%s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
AI 风向标服务器一键安装

用法：
  sudo bash scripts/install.sh [选项]

选项：
  --domain <域名>       Nginx 域名，默认 _
  --port <端口>         应用监听端口，默认 3000
  --app-dir <目录>      安装目录，默认 /opt/ainews
  --app-user <用户>     系统用户，默认 ainews
  --repo <Git URL>      仓库地址
  --branch <分支>       部署分支，默认 main
  --skip-nginx          不安装和配置 Nginx，直接监听 0.0.0.0
  -h, --help            显示帮助
EOF
}

while (($#)); do
  case "$1" in
    --domain)
      DOMAIN="${2:?--domain 缺少值}"
      shift 2
      ;;
    --port)
      PORT="${2:?--port 缺少值}"
      shift 2
      ;;
    --app-dir)
      APP_DIR="${2:?--app-dir 缺少值}"
      shift 2
      ;;
    --app-user)
      APP_USER="${2:?--app-user 缺少值}"
      shift 2
      ;;
    --repo)
      REPO_URL="${2:?--repo 缺少值}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:?--branch 缺少值}"
      shift 2
      ;;
    --skip-nginx)
      WITH_NGINX="false"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "未知选项：$1"
      ;;
  esac
done

[[ "${EUID}" -eq 0 ]] || fail "请使用 root 或 sudo 运行。"
[[ -r /etc/os-release ]] || fail "仅支持带有 /etc/os-release 的 Linux 服务器。"

# shellcheck disable=SC1091
source /etc/os-release
case "${ID:-}" in
  ubuntu|debian) ;;
  *) fail "当前一键脚本支持 Ubuntu/Debian；其他系统请使用 Docker Compose。" ;;
esac

[[ "${PORT}" =~ ^[0-9]+$ ]] || fail "端口必须是数字。"
((PORT >= 1 && PORT <= 65535)) || fail "端口范围必须是 1-65535。"
[[ "${APP_DIR}" =~ ^/[A-Za-z0-9._/-]+$ && "${APP_DIR}" != "/" ]] ||
  fail "安装目录必须是安全的绝对路径且不能是 /。"
[[ "${APP_USER}" =~ ^[a-z_][a-z0-9_-]*$ ]] || fail "系统用户名格式不合法。"
[[ "${DOMAIN}" == "_" || "${DOMAIN}" =~ ^[A-Za-z0-9.-]+$ ]] ||
  fail "域名格式不合法。"

export DEBIAN_FRONTEND=noninteractive

log "安装系统依赖"
apt-get update
packages=(ca-certificates curl git)
if [[ "${WITH_NGINX}" == "true" ]]; then
  packages+=(nginx)
fi
apt-get install -y "${packages[@]}"

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
fi
if ((node_major < 22)); then
  log "安装 Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

node_path="$(command -v node)"
[[ -n "${node_path}" ]] || fail "Node.js 安装失败。"

if ! id "${APP_USER}" >/dev/null 2>&1; then
  log "创建系统用户 ${APP_USER}"
  useradd --system --create-home --home-dir "/var/lib/${APP_USER}" \
    --shell /usr/sbin/nologin "${APP_USER}"
fi

if [[ -e "${APP_DIR}" ]]; then
  if [[ -d "${APP_DIR}/.git" ]]; then
    fail "${APP_DIR} 已经是 Git 仓库；请运行 ${APP_DIR}/scripts/deploy.sh 更新。"
  fi
  if [[ -n "$(find "${APP_DIR}" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    fail "${APP_DIR} 已存在且不为空，请换一个 --app-dir。"
  fi
else
  install -d -o "${APP_USER}" -g "${APP_USER}" "${APP_DIR}"
fi
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"

log "克隆 ${REPO_URL} (${BRANCH})"
runuser -u "${APP_USER}" -- git clone --branch "${BRANCH}" --single-branch \
  "${REPO_URL}" "${APP_DIR}"

log "安装依赖并执行完整测试"
runuser -u "${APP_USER}" -- npm --prefix "${APP_DIR}" ci
runuser -u "${APP_USER}" -- npm --prefix "${APP_DIR}" test

install -d -m 0755 /etc/ainews
host="127.0.0.1"
if [[ "${WITH_NGINX}" == "false" ]]; then
  host="0.0.0.0"
fi
cat >/etc/ainews/ainews.env <<EOF
NODE_ENV=production
HOST=${host}
PORT=${PORT}
EOF
chmod 0644 /etc/ainews/ainews.env

service_tmp="$(mktemp)"
sed \
  -e "s|__APP_USER__|${APP_USER}|g" \
  -e "s|__APP_DIR__|${APP_DIR}|g" \
  -e "s|__NODE_PATH__|${node_path}|g" \
  "${APP_DIR}/deploy/ainews.service.template" >"${service_tmp}"
install -m 0644 "${service_tmp}" /etc/systemd/system/ainews.service
rm -f "${service_tmp}"

if [[ "${WITH_NGINX}" == "true" ]]; then
  log "配置 Nginx"
  default_server=""
  if [[ "${DOMAIN}" == "_" ]]; then
    default_server=" default_server"
    if [[ -L /etc/nginx/sites-enabled/default ]]; then
      unlink /etc/nginx/sites-enabled/default
    fi
  fi
  nginx_tmp="$(mktemp)"
  sed \
    -e "s|__DOMAIN__|${DOMAIN}|g" \
    -e "s|__PORT__|${PORT}|g" \
    -e "s|__DEFAULT_SERVER__|${default_server}|g" \
    "${APP_DIR}/deploy/nginx.conf.template" >"${nginx_tmp}"
  install -m 0644 "${nginx_tmp}" /etc/nginx/sites-available/ainews
  rm -f "${nginx_tmp}"
  ln -sfn /etc/nginx/sites-available/ainews /etc/nginx/sites-enabled/ainews
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx
fi

log "启动 AI 风向标"
systemctl daemon-reload
systemctl enable --now ainews

health_url="http://127.0.0.1:${PORT}/"
for _ in {1..20}; do
  if curl -fsS "${health_url}" | grep -q "AI 风向标"; then
    log "安装完成"
    if [[ "${WITH_NGINX}" == "true" ]]; then
      printf '访问地址：http://%s\n' "${DOMAIN}"
    else
      printf '访问地址：http://<服务器 IP>:%s\n' "${PORT}"
    fi
    printf '查看日志：journalctl -u ainews -f\n'
    printf '后续更新：sudo %s/scripts/deploy.sh\n' "${APP_DIR}"
    exit 0
  fi
  sleep 1
done

systemctl status ainews --no-pager || true
fail "服务已启动，但健康检查未通过。"
