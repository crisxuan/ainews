# AI 风向标

一个动漫风格的 AI 热点雷达：每小时扫描准实时信号，在每天 08:00 和
20:00 生成深度简报，并保留历史热点。

![AI 风向标首页](public/og.png)

## 它如何工作

网站本身负责热点数据的校验、归档和展示：

- `data/breaking.json`：48 小时内达到阈值的突发热点。
- `data/briefings.json`：08:00、20:00 生成的早晚深度简报及历史归档。
- `scripts/update-breaking.mjs`：校验来源数、去重、冷却和写入突发热点。
- `scripts/archive-briefing.mjs`：校验并归档完整简报。

当前生产环境的热点发现由外部自动任务完成多来源扫描与深度核验。
部署本仓库可以得到完整网站；如果需要自动生成内容，还需要在自己的
自动化环境中调用上述两个数据写入脚本。

## 环境要求

- Node.js `>=22.13.0`
- npm

## 本地运行

```bash
git clone https://github.com/crisxuan/ainews.git
cd ainews
npm ci
npm run dev
```

打开 <http://localhost:3000>。

生产构建与测试：

```bash
npm test
HOST=0.0.0.0 PORT=3000 npm start
```

## Ubuntu / Debian 一键安装

在一台全新的 Ubuntu 或 Debian 服务器上运行：

```bash
curl -fsSL https://raw.githubusercontent.com/crisxuan/ainews/main/scripts/install.sh \
  | sudo bash
```

指定域名：

```bash
curl -fsSL https://raw.githubusercontent.com/crisxuan/ainews/main/scripts/install.sh \
  | sudo bash -s -- --domain ai.example.com
```

安装脚本会：

1. 安装 Node.js 22、Git、Nginx；
2. 创建无登录权限的 `ainews` 系统用户；
3. 克隆仓库、按 lockfile 安装依赖并运行完整测试；
4. 配置 systemd 开机启动和 Nginx 反向代理；
5. 启动服务并执行首页健康检查。

默认安装目录为 `/opt/ainews`，应用只监听
`127.0.0.1:3000`，由 Nginx 对外提供 HTTP 服务。

其他安装选项：

```bash
sudo bash scripts/install.sh --help
```

域名解析生效后，可以使用 Certbot 给 Nginx 配置 HTTPS：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ai.example.com
```

## 服务器更新

一键安装完成后，执行：

```bash
sudo /opt/ainews/scripts/deploy.sh
```

更新脚本只接受 fast-forward 更新，并会依次执行 `npm ci`、`npm test`、
重启和健康检查。如果测试或健康检查失败，会继续使用上一版可运行构建。

常用运维命令：

```bash
systemctl status ainews
journalctl -u ainews -f
systemctl restart ainews
```

## Docker Compose

已经安装 Docker 的服务器可以直接运行：

```bash
git clone https://github.com/crisxuan/ainews.git
cd ainews
docker compose up -d --build
```

默认暴露 `3000` 端口。修改宿主机端口：

```bash
AINEWS_PORT=8080 docker compose up -d --build
```

查看状态和日志：

```bash
docker compose ps
docker compose logs -f ainews
```

## 写入突发热点

输入 JSON 必须包含至少两个独立来源：

```bash
node scripts/update-breaking.mjs ./breaking-item.json
```

清理超过 48 小时的突发热点：

```bash
node scripts/update-breaking.mjs --prune
```

归档早晚简报：

```bash
node scripts/archive-briefing.mjs ./briefing.json
```

写入数据后执行 `npm test`，再使用对应平台重新部署。

## 其他部署方式

- Vercel：仓库内的 `vercel.json` 使用 `next build`。
- Cloudflare Workers：执行 `npx vinext deploy`。
- 普通 Linux：使用本仓库的 systemd + Nginx 一键脚本。
- 任意容器平台：使用 `Dockerfile` 或 `compose.yaml`。

## 项目结构

```text
app/                 页面与样式
data/                突发热点和历史简报
deploy/              systemd、Nginx 配置模板
public/              静态资源
scripts/             数据写入、安装和更新脚本
tests/               生产构建渲染测试
worker/              Vinext / Cloudflare Worker 入口
```
