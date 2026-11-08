---
title: 自托管一套模型网关
summary: 用 Docker 起网关、配数据库与密钥、再挂 Nginx 反代，把流式输出跑通
order: 1
level: 进阶
tags: [Docker, Nginx, 网关]
updated: 2026-11-08
readingTime: 6
---

多个模型厂商的 key 散在十几台机器上，谁在用、用了多少、什么时候欠费，全靠翻账单反推。这是我搭第一套模型网关的直接原因。网关做的事不复杂：对外给一个 OpenAI 兼容的地址，对内把请求按渠道分发给不同厂商，中间记账、限流、留日志。

下面这套是我现在在用的最小可用版本，一台 2 核 4 G 的机器足够跑，日请求量在十万以内不用扩。

## 环境与依赖

系统用 Debian 12，Docker 26 加 compose 插件。三样东西必须落盘持久化：数据库、Redis、网关自己的配置。装之前先确认内核版本，低于 5.10 的机器跑 overlay2 会有 inode 问题，`uname -r` 看一眼。

```bash
apt install -y docker.io docker-compose-plugin
systemctl enable --now docker
mkdir -p /srv/gw/{data,logs,conf}
chmod 750 /srv/gw
cd /srv/gw
```

数据库选 PostgreSQL 16 而不是 SQLite。SQLite 在单机小流量下完全够用，但网关的用量统计是高频写入，并发一上来就 `database is locked`，而且备份要停写。Postgres 用 `pg_dump` 可以在线备。

Redis 只做两件事：限流计数和响应缓存。不给它存业务数据，所以不开持久化，启动参数里关掉 RDB，重启丢干净也无所谓。内存上限给 256 MB，淘汰策略用 `allkeys-lru`，限流计数被淘汰只会导致短暂放宽，不会出错。

资源占用实测：空载时 Postgres 约 40 MB 常驻，Redis 不到 10 MB，网关进程 120 MB 上下。压到 50 并发时网关吃满一个核，内存峰值 400 MB。所以 2 核 4 G 里给 Docker 留 3 G 就够，剩下留给系统和 Nginx。

## compose 文件

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: gateway
      POSTGRES_USER: gw
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gw -d gateway"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--save", "", "--maxmemory", "256mb",
              "--maxmemory-policy", "allkeys-lru"]

  gateway:
    image: ghcr.io/example/gateway:latest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SQL_DSN: postgres://gw:${DB_PASSWORD}@db:5432/gateway
      REDIS_CONN_STRING: redis://redis:6379
      SESSION_SECRET: ${SESSION_SECRET}
      TZ: Asia/Shanghai
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - ./logs:/app/logs
```

`ports` 那行绑 `127.0.0.1` 而不是 `0.0.0.0`，是为了让网关只能通过反代访问。直接暴露 3000 到公网，等于把管理后台也一起交了。

`TZ` 必须显式设。不设的时候容器里是 UTC，日志时间戳比本地早八小时，出问题按本地时间 grep 永远找不到。这个坑我踩过一次，之后所有容器的 compose 里都写死时区。

密码和密钥放 `.env`，权限 600，不进 git。生成用 `openssl rand -hex 32`，别自己敲键盘凑。

```bash
cat > .env <<'EOF'
DB_PASSWORD=替换成32位随机十六进制
SESSION_SECRET=替换成64位随机十六进制
EOF
chmod 600 .env
```

起服务：`docker compose up -d`，然后 `docker compose logs -f gateway` 看初始化。首次启动会建表，日志里出现监听 3000 的提示就算起来了。如果卡在等数据库，看 `docker compose ps` 里 db 的 health 状态，`starting` 超过 30 秒基本是初始化失败，`docker compose logs db` 里会有具体原因。

## 反代：流式输出必须改的三个参数

Nginx 默认配置会把流式响应毁掉。表现是接口能通，但前端一直转圈，最后一次性吐出全部内容，或者干脆超时断掉。

问题出在缓冲。`proxy_buffering on` 时 Nginx 会攒够一个缓冲区才往下发，SSE 的 `data:` 帧全被压在里面。必须关掉。

```nginx
server {
    listen 443 ssl http2;
    server_name gw.example.com;

    ssl_certificate     /etc/letsencrypt/live/gw.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gw.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 32m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 300s;
        proxy_set_header Connection "";
    }
}
```

四个设置分开说。`proxy_buffering off` 让字节到达即转发。`proxy_cache off` 防止上游的流式响应被缓存成半截。`proxy_read_timeout 300s` 是因为长上下文生成可能超过默认 60 秒，超了 Nginx 会主动断开，前端看到的是半截响应加一个 502。`proxy_set_header Connection ""` 配合 `http_version 1.1` 保持长连接，否则每帧都可能新建连接。

`add_header` 的坑另算：加 CORS 头的时候必须带 `always`，否则 4xx 和 5xx 响应不带这些头，浏览器会把后端的错误报成跨域失败。

证书用 certbot 签，`certbot --nginx -d gw.example.com`，续期由 systemd timer 自动跑。手动续期的项目最后一定会忘，我吃过这个亏，证书过期那天所有客户端同时报 `certificate has expired`。

## 初始化配置

起来之后第一件事是改管理员密码，第二件事是关掉注册。网关默认开放注册，被人扫到就是白送额度。

首次登录后建一个渠道，指向你实际用的厂商，填 `base_url`、`api_key`、支持的模型列表。然后把渠道的模型和你对外暴露的模型名对上，这层映射别嫌麻烦：对外统一叫 `chat-large`、`chat-fast`，换厂商时只改映射，客户端一行都不用动。

映射还有一层好处是灰度。新渠道上线时，把 `chat-fast` 的权重先给 10%，观察一天错误率，没问题再全量切。没有这层抽象，换模型就得改所有调用方的代码。

## 几个关键参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 请求超时 | 300s | 低于生成耗时会截断长回答 |
| 连接池 | 每渠道 20 | 太小会排队，太大压垮上游 |
| 重试次数 | 2 | 只对 429 和 5xx 重试 |
| 日志保留 | 30 天 | 按天分区，超期删表 |
| 限流粒度 | 用户 + 模型 | 只按用户会漏掉单模型打爆 |

重试次数这一项要谨慎。有些网关默认对失败请求重试三次，遇到上游超时的时候，一个用户请求会变成四个上游请求，账单直接四倍。只对 429 和 5xx 重试，4xx 一律不重试。

连接池的数值也别盲目调大。上游厂商对单 IP 的并发连接数有隐性限制，超过之后表现不是报错，而是建连变慢，首字节时间从 300 毫秒涨到 3 秒。这个现象很容易被误判成「模型变慢了」。

## 部署完该验的四件事

先用 `curl` 打一次非流式请求，确认 `usage` 字段回来了：

```bash
curl -s https://gw.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-你的令牌" \
  -H "Content-Type: application/json" \
  -d '{"model":"chat-fast","messages":[{"role":"user","content":"ping"}],"max_tokens":20}'
```

再打一次流式，确认首字节时间在 1 秒内：

```bash
curl -N https://gw.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-你的令牌" \
  -H "Content-Type: application/json" \
  -d '{"model":"chat-fast","stream":true,"messages":[{"role":"user","content":"数到十"}]}'
```

`-N` 关掉 curl 自己的缓冲，能直接看到逐帧到达。首字节超过 3 秒，回头查反代和上游，别在客户端上找原因。

最后两件：把 `docker compose` 加进 systemd 或设置 `restart: unless-stopped` 保证开机自启，以及给数据库加一条每日 `pg_dump` 到另一块盘。网关容器本身可以随时重建，用量数据丢了就补不回来。

升级路径也定死：拉新镜像前先 `pg_dump`，然后再 `docker compose pull && up -d`。跳过备份直接升级，遇到表结构变更失败的时候，回滚旧镜像会因为 schema 已改而启动不起来。
