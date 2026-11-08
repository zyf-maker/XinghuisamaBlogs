---
title: 网关四类故障的排查顺序
summary: 端口占用、证书、跨域、502 的固定排查顺序，先分层再动手改配置
order: 3
level: 深入
tags: [排障, Nginx, TLS]
updated: 2026-11-08
readingTime: 7
---

网关出问题的时候，最容易发生的动作是同时改三处配置。改完好了，你不知道是哪一处起的作用；没改好，你不知道该回退哪一个。所以排查原则只有一条：一次只动一层，每动一次留一条可复现的证据。

下面四类故障按「从下往上」的顺序排。真实的排查方向也是这样，先确认端口上有人，再确认 TLS 能握手，再确认浏览器愿意发请求，最后才查上游。

## 第一层：端口占用

症状很明确，容器起不来或者进程秒退，日志里是：

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

或者 compose 报 `driver failed programming external connectivity ... bind: address already in use`。

先找出是谁占着。Linux 上：

```bash
ss -lntp | grep ':3000'
LISTEN 0 511 0.0.0.0:3000 users:(("node",pid=1421,fd=21))
```

拿到 pid 之后先别急着 `kill -9`。看一眼它是什么：`ps -fp 1421`。如果是上次没停干净的同名容器，`docker compose down` 更干净；如果是别的服务，改端口比杀进程安全。

Windows 上对应的是 `netstat -ano | findstr :3000`，然后 `tasklist /FI "PID eq 1421"`。

有两个隐蔽的情况。

第一种，端口被占但 `ss` 看不到进程。常见于进程属于另一个用户，需要 `sudo` 才显示。加上 `sudo` 再看。

第二种，`TIME_WAIT` 导致端口不可立即复用。现象是刚停服务马上重启就报占用。这不是真占用，是内核还在等连接关闭。配置里加 `SO_REUSEADDR` 可以缓解，但更实际的做法是重启前等 30 秒，或者换端口。

做健康检查的时候别只看端口在不在听。端口通了但进程卡死的情况很常见，`curl -f http://127.0.0.1:3000/healthz` 带 `-f` 才会在 4xx/5xx 时返回非零退出码。只用 `nc -z` 测端口，会把「进程活着但不干活」判断成「服务正常」。

## 第二层：证书

证书问题的排查分三段，不要跳步。

第一段，证书本身对不对。

```bash
openssl s_client -connect gw.example.com:443 -servername gw.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

输出里看 `notAfter`。过期是最常见的一种，`certbot renew` 之后 Nginx 没 reload，新证书在磁盘上但没生效，`s_client` 看到的还是旧的。这条我踩过两次，后来在续期钩子里固定加 `systemctl reload nginx`。

看 `subject` 里的域名是否包含你访问的域名。通配符 `*.example.com` 只覆盖一级子域，`a.b.example.com` 不在其中。

第二段，链是否完整。`s_client` 输出里如果有 `verify error:num=21:unable to verify the first certificate`，说明服务器只发了叶子证书，没发中间证书。浏览器有时能靠 AIA 自动补齐，但 curl、Python 的 requests、Java 客户端通常不行，表现就是「浏览器能开，程序报错」。

修法是把 `fullchain.pem` 而不是 `cert.pem` 配进 `ssl_certificate`。这两个文件在 Let's Encrypt 目录里挨着放，名字很像，配错的人很多。

第三段，协议与套件。客户端报 `handshake failure` 而不是证书错误时，问题在协议版本。老客户端只支持 TLS 1.0/1.1，而现在的 Nginx 默认配置经常只留 1.2 和 1.3。要么让客户端升级，要么临时放开，别长期留着 1.0。

一条命令快速分辨三类问题：

```bash
curl -vI https://gw.example.com 2>&1 | grep -Ei 'SSL|certificate|subject|expire|handshake'
```

`certificate has expired` 是过期，`unable to get local issuer` 是链不全，`sslv3 alert handshake failure` 是协议不通。三句话对应三种修法，不要混着改。

## 第三层：跨域

跨域报错在浏览器控制台里几乎是同一句话，`has been blocked by CORS policy`，但底下真正的原因有四五种。

先分清是简单请求还是预检。带自定义头（比如 `Authorization`）、或者 `Content-Type: application/json` 的请求，浏览器会先发一个 `OPTIONS`。这个预检如果 4xx，正式请求根本不会发出去，你在 Network 面板里只能看到一个红色的 `OPTIONS`。

排查顺序：

第一步，手工发一次预检，看服务端到底回了什么。

```bash
curl -i -X OPTIONS https://gw.example.com/v1/chat/completions \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

要看四个响应头是否齐全：`Access-Control-Allow-Origin`、`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`、`Access-Control-Max-Age`。少任何一个，预检都算失败。

第二步，看 `Allow-Origin` 的值。写 `*` 的时候，浏览器不允许同时带凭证（cookie、`Authorization` 在 `credentials: include` 模式下）。用了凭证就必须回具体的源，不能通配。

第三步，看 `Vary: Origin`。反代或者 CDN 缓存了 `*` 的响应，后续带具体源的请求拿到缓存，浏览器判定不匹配。这个错误极难查，因为服务端日志里一切正常。加 `Vary: Origin` 能让缓存按源分开。

第四步，最容易被忽略的一点：错误响应也得带 CORS 头。上游 500 的时候，如果 Nginx 的 `error_page` 直接返回静态错误页，那个响应没有 CORS 头，浏览器就把它报成跨域错误，而真实原因是 500。我在这上面浪费过一整个下午，最后是在 Nginx 的 `add_header ... always` 里加 `always` 才看到真相。

```nginx
add_header Access-Control-Allow-Origin  $http_origin always;
add_header Access-Control-Allow-Headers "authorization,content-type" always;
add_header Access-Control-Allow-Methods "GET,POST,OPTIONS" always;
add_header Access-Control-Max-Age       "86400" always;
add_header Vary Origin always;
```

`always` 是关键，不加它，4xx 和 5xx 响应不会带这些头。

## 第四层：502 与 504

502 是反代连上了后端但后端给了无效响应，或者根本连不上。504 是连上了但等太久。

Nginx 的 `error.log` 里区分得很清楚：

```
connect() failed (111: Connection refused) while connecting to upstream
upstream prematurely closed connection while reading response header
upstream timed out (110: Connection timed out) while reading response header
```

第一句是后端没起来或者端口错。第二句是后端崩了，常见于流式输出时上游断开而你没处理异常。第三句是超时。

流式场景下的 502 有个专属原因：`proxy_buffering on`。Nginx 攒缓冲的时候上游把连接关了，或者你关了 buffering 但没设 `proxy_http_version 1.1`，上游用 HTTP/1.0 的短连接，一帧之后就断。表现是每次生成到一半就 502，重试又能出几行。

超时参数要分层设。`proxy_connect_timeout` 管建连，5 秒够了；`proxy_send_timeout` 管发请求体，30 秒；`proxy_read_timeout` 管等响应，这个要按最长生成时间给，长上下文生成给到 300 秒不夸张。

还有一个 502 的来源不在 Nginx：`client_max_body_size`。请求体超过限制，Nginx 直接返回 413，但如果客户端在流式上传中途被截断，有时会表现成 502。排查时先看请求体大小，别一上来就怀疑上游。

## 四类故障的定位路径

| 层级 | 首个命令 | 判据 | 不要先做 |
| --- | --- | --- | --- |
| 端口 | `ss -lntp \| grep :PORT` | 有进程监听且 `/healthz` 返回 200 | 直接 `kill -9` |
| 证书 | `openssl s_client -connect` | `notAfter` 未过期且链完整 | 重签证书 |
| 跨域 | `curl -X OPTIONS` 手工预检 | 四个响应头齐全且带 `always` | 改前端代理 |
| 502/504 | `tail error.log` | 区分 refused / premature / timeout | 调大所有超时 |

## 排查时我固定做的三件事

留证据。每次改动之前把当前配置复制一份到 `/srv/gw/conf/$(date +%s).bak`，改坏了 `cp` 回去就行。配置文件的回滚比 git 快，因为不用等 CI。

记时间点。出问题先看 `date`，把时间记下来。日志里 grep 这个时间前后两分钟，比 grep 关键词准。时区不一致是另一个坑，容器里 `TZ` 没设，日志是 UTC，你按本地时间找，永远找不到。

一次只改一处。这条听起来像废话，但真正慌的时候最难守住。上面四层之所以按顺序排，就是为了让你有一个默认的行走方向，而不是同时怀疑所有东西。

四次里我有三次的结论是配置里一个字符的问题，一次是磁盘满了导致日志写不进去进而让进程卡住。后者花了最久，因为所有配置看起来都对。所以排查清单最后再加一条：`df -h` 和 `dmesg -T | tail`。这两个命令三十秒，能排掉一整类莫名其妙的问题。
