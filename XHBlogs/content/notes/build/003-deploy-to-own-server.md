---
title: 部署到自己的服务器
summary: standalone 产物、systemd 托管、反代与子路径的坑
order: 3
level: 深入
tags: [部署, nginx, systemd]
updated: 2026-11-08
readingTime: 6
---

站要放问答接口，静态导出就不够了，得回到 `standalone`，服务器上常驻一个 Node 进程。从 `node server.js` 能跑，到 nginx 后面稳定跑，中间隔着进程管理、端口、子路径、静态资源四道关，每一道都能让页面正常而接口 404。

## standalone 产物缺两个目录

`output: "standalone"` 只 trace 真正被 import 到的依赖，`node_modules` 从几百兆降到几十兆，这一点很实在。但它复制的是代码，不是资源：`public` 和 `.next/static` 不在里面。

```bash
next build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

漏掉第一步，图片和 favicon 全 404；漏掉第二步，页面能出现但没有任何样式和交互，浏览器控制台一串 `GET /_next/static/chunks/main-app-xxx.js 404`。这两个目录是手工补的，构建不会提醒，`server.js` 也不会报错，它只是老老实实返回 404。

产物可以直接打包上传，服务器上不需要 `npm install`：

```bash
tar -czf blog.tar.gz -C .next/standalone .
scp blog.tar.gz root@HOST:/srv/blog/
ssh root@HOST 'tar -xzf /srv/blog/blog.tar.gz -C /srv/blog/current'
```

保留上一版目录做回滚。`current` 用软链接指向带时间戳的目录，回滚就是把链接换回去，比重新构建快得多。

## systemd 只有六行有用的

```ini
[Unit]
Description=yiquen blog
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/blog/current
Environment=NODE_ENV=production
Environment=PORT=3100
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
User=www-data

[Install]
WantedBy=multi-user.target
```

`HOSTNAME=127.0.0.1` 是关键。不设的话 `server.js` 默认监听 `0.0.0.0`，3100 端口直接暴露在公网，别人绕过 nginx 就能打你的接口，限流和日志全部失效。我第一次部署时就是这样，扫描器十分钟内就摸到了。

`Restart=always` 配 `RestartSec=3`，进程被 OOM 杀掉后三秒拉起。日志用 `journalctl -u blog -f` 看，别自己往文件里写，轮转会把磁盘吃满。

环境变量在 `Environment=` 里写明文不理想，密钥放 `/etc/blog.env`，用 `EnvironmentFile=` 引入，文件权限 600、属主 root。`NEXT_PUBLIC_` 前缀的变量是构建期内联的，改了必须重新构建，这一点和普通运行时变量完全不同，混在一起排查会浪费很久。

## 反代要改三处默认值

```nginx
location /blog/ {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 300s;
}
```

`proxy_pass` 末尾那个斜杠决定路径怎么拼。带斜杠，`/blog/ai` 到后端变成 `/ai`；不带，后端收到的是完整路径 `/blog/ai`。这两种写法各自对应一种 `basePath` 配置，混搭就是全站 404。我的项目走的是后者，`basePath` 设成 `/blog`，所以 `proxy_pass` 不带斜杠，`NEXT_PUBLIC_BASE_PATH=/blog` 在构建时就被内联进产物。

`proxy_buffering off` 只对流式接口有意义。默认开着时，nginx 会把上游输出攒到 4KB 或 8KB 再转发，表现为「等了五秒突然一次性出现一大段」，很像模型很慢。只给 `/blog/api/` 关掉更好，全站关掉会损失普通页面的压缩收益。

`proxy_read_timeout` 默认 60 秒，一个长回答跑过 60 秒连接就被切，前端收到的是不完整的流。

## 子路径会漏掉的四类资源

`basePath` 管住了 `next/link` 和 Next 自己注入的带哈希资源，管不住手写路径。上线后逐项检查：

| 资源类型 | 是否会带 basePath | 修法 |
| --- | --- | --- |
| `next/link` 跳转 | 会 | 不用管 |
| `/_next/static/*` | 会 | 不用管 |
| 手写 `<img src="/imgs/a.png">` | 不会 | 过一层 `asset()` 拼前缀 |
| 接口 `fetch("/api/ask")` | 不会 | 用 `process.env.NEXT_PUBLIC_BASE_PATH` 拼 |
| `robots.txt`、`sitemap.xml` 里的绝对地址 | 不会 | 构建时按站点根域名生成 |

封装一个函数就能覆盖大半：

```ts
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
```

这个坑的恶劣之处在于本地开发时 `BASE_PATH` 为空，`asset()` 等于原样返回，一切正常；只有部署到子路径才会暴露。所以 `basePath` 一旦启用，本地 `.env.local` 里也要设成同一个值跑一遍，否则等于没测。

## 静态资源交给 nginx 更划算

Next 的 `server.js` 能自己服务 `public` 和 `.next/static`，但让 nginx 直接读磁盘更快，也少一层 Node 进程的 CPU 占用：

```nginx
location /blog/_next/static/ {
    alias /srv/blog/current/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /blog/imgs/ {
    alias /srv/blog/current/public/imgs/;
    expires 30d;
}
```

`alias` 和 `root` 的区别必须分清：`alias` 是把 location 前缀整个替换成目标路径，`root` 是拼在后面。写成 `root /srv/blog/current/.next/static/`，nginx 会去找 `/srv/blog/current/.next/static/blog/_next/static/xxx.js`，结果是全站样式 404 而 html 正常，很容易误判成构建坏了。

带哈希的资源设一年缓存是安全的，`public/imgs` 不带哈希，只能设 30 天。

有一处容易忽略的冲突：Next 的静态资源自己已经带了 `Cache-Control: public, max-age=31536000, immutable`，nginx 加上 `expires` 后会出现两个同名头，浏览器按第一个生效还是最后一个，不同版本行为不一致。要么让 nginx 接管（走 alias 就自然接管了），要么完全交给 Node，别两边都设。

## 上传与切换写成一条命令

手工 scp 加解压，做三次就会漏一步。写成脚本，顺序固定：构建、打包、上传、解压到新目录、切软链接、重启、探活，失败则切回。

```bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%Y%m%d%H%M)
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
tar -czf "/tmp/blog-$STAMP.tar.gz" -C .next/standalone .

scp "/tmp/blog-$STAMP.tar.gz" "root@HOST:/srv/blog/releases/"
ssh root@HOST bash -s <<EOF
set -euo pipefail
cd /srv/blog/releases
mkdir -p "$STAMP" && tar -xzf "blog-$STAMP.tar.gz" -C "$STAMP"
ln -sfn "/srv/blog/releases/$STAMP" /srv/blog/current
systemctl restart blog
sleep 2
curl -fsS http://127.0.0.1:3100/ > /dev/null || {
  echo "health check failed, rolling back"; exit 1;
}
EOF
```

`set -euo pipefail` 必须写在最前面。少了它，`tar` 解压失败但 `systemctl restart` 照样执行，线上跑的还是旧目录里的旧代码，而你会以为发版成功了。

`ln -sfn` 的 `-n` 不能省。`current` 是软链接时，不带 `-n` 会把新链接塞进旧链接指向的目录里，生成 `/srv/blog/releases/<旧版本>/<新版本>`，然后 `current` 还指向旧版本。这个错误没有任何报错，只有「改了代码没生效」这一个症状。

探活用 `curl -fsS`，`-f` 让非 2xx 返回非零退出码，`-sS` 静默但保留错误信息。只看端口有没有监听是不够的，进程活着但渲染抛异常时端口照样在。

## 上线后按顺序查四件事

```bash
curl -sI http://127.0.0.1:3100/ | head -3          # 进程本身活着
curl -sI https://SITE/blog/ | head -3              # 反代通
curl -s https://SITE/blog/api/ask | head -c 120    # 接口通且有模型名
journalctl -u blog -n 30 --no-pager                # 有没有反复重启
```

四条里前三条分别对应进程、反代、basePath 三层故障，第四条看 `Restart` 的次数。`systemctl status` 显示 `active (running)` 但有几十次重启记录时，问题通常是端口被占或者环境变量缺失，而不是代码错。

最后一条经验：部署脚本里加 `nginx -t`。改完配置忘了 reload，或者括号少一个，`nginx -t` 会当场拦住，比线上 502 之后再回头翻配置省事得多。
