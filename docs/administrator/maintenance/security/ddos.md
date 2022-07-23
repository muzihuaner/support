---
sidebar_position: 2
slug: /administrator/security_ddos
---

# DDOS 防御

分布式拒绝服务攻击(DDoS)是目前黑客经常采用的攻击手段，它的原理是：利用合理的服务请求来占用过多的服务资源，从而导致流量消耗或服务器无法正常对外提供服务。  

使用云服务器会针对 DDoS 提供一定的防护措施，但用户也可以在 Web Server 上针对 DDoS 作出一定的设置：  

## Apache

使用 Apache 的 **mod_evasive** 模块，防止对 Apache 服务器的暴力攻击。它的工作原理是创建对异常的访问给与 403 响应。  

典型的异常访问：  

- 每秒请求同一页多次
- 每秒对同一个孩子发出 50 多个并发请求
- 暂时列入黑名单时提出任何要求

具体实施方案：在 Apache 的 conf.d 目录下找到 mod_evasive.conf 文件，进行配置（根据网站安全实际需求来）

![](https://libs.websoft9.com/Websoft9/blog/zh/2020/12/Apache-403-mod_evasive-conf-websoft9.png)

## Nginx

参阅：[Mitigating DDoS Attacks with NGINX and NGINX Plus](https://www.nginx.com/blog/mitigating-ddos-attacks-with-nginx-and-nginx-plus)
