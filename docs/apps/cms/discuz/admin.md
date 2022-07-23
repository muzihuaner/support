---
sidebar_position: 3
slug: /discuz/admin
tags:
  - Discuz
  - CMS
  - 建站系统
  - 博客系统
---

# 维护指南

本章提供的是本应用自身特殊等维护与配置。而**配置域名、HTTPS设置、数据迁移、应用集成、Web Server 配置、Docker 配置、修改数据库连接、服务器上安装更多应用、操作系统升级、快照备份**等操作通用操作请参考：[管理员指南](../administrator) 和 [安装后配置](../install/setup) 相关章节。

## 场景

### 在线备份与恢复

Discuz 后台提供了非常简单实用的在线备份功能，使用方法如下：

1. 登录 Discuz 后台，打开：【后台】>【站长】>【数据库】，进入备份页面，设置备份策略。
   ![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/discuz/discuz-backup-websoft9.png)

2. 点击备份操作

3. 在线实现的备份可以在线恢复（还原）
   ![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/discuz/discuz-restore-websoft9.png)

### 升级

Discuz 需要手工上传升级包方可升级，这项工作对普通用户来说非常有挑战性。  

Discuz 官方提供了一个：[升级参考](https://gitee.com/Discuz/DiscuzX/wikis/%E5%8D%87%E7%BA%A7%E6%96%B9%E6%B3%95?sort_id=9978)


## 故障排除

除以下列出的 Discuz 故障问题之外， [通用故障处理](../troubleshoot) 专题章节提供了更多的故障方案。 

#### Discuz后台系统首页的文件校验显示大量文件被修改，这是系统风险或网站漏洞吗？

websoft9为了优化用户体验，初始设定了随机密码；同时为了用户安全，修改了网站的访问权限，这样造成安装文件被修改的假象。
例如，discuzX3.4显示318文件被修改，60个文件丢失，这个是正常的，请勿担心。请参照下图
![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/discuz/discuz-risk-websoft9.png)

#### Discuz 重定向错误？

重定向错误比较常见。处理办法：分析网站根目录下的 `.htaccess` 文件，看看有没有死循环规则

#### Discuz 密码被锁，怎么解决？

1. 10分钟后会自动解锁。
2. 管理员登录，组织→用户 操作栏里有解锁按钮。

#### 修改了数据库密码 Discuz 不能访问？

问题： 若已完成 Discuz 安装，后通过 phpMyAdmin 修改数据库密码，Discuz 就会连不上数据库。  
方案： 修改[数据库连接](../discuz#modifydbconn)信息  

#### Discuz 出现“对不起，您的网站已被设置禁止下载此应用”问题

该问题出现的原因：由于 Discuz 官方设置了一个应用中心开发平台[Discuz!扩展中心防骗云平台](http://www.kuozhan.net/blacklist-index.html)专门针对所谓的盗版网站进行屏蔽网站授权，导致众多无辜站长用户无法更新和下载应用中心插件、模板，并且出现”对不起，您的网站已被设置禁止下载此应用“的提示。  

解决方法：

 1. 登录到 phpmyadmin，找到pre_common_setting这个表（默认表前缀pre_，请以你自己的为准。）
 2. 在找到的表里删除掉 siteuniqueid 这个数据（pre_common_setting表中的第10页位置。）
 3. 再重新进入网站后台——应用——获取更多应用，再次下载更新试下吧！

#### Discuz 手机版访问报错“接口错误 err05 微社区域名已更换”

错误原因：Discuz官方提供的接口地址由http://wsq.discuz.qq.com/ 换成了现在 http://wsq.discuz.com/
解决方法：

  1. 登录服务器，找到Discuz根目录下的 */data/wwwroot/discuz/upload/source/class/helper/helper_form.php* 文件
  2. 将 'http://wsq.discuz.qq.com/', 25  改为 'http://wsq.discuz.com/', 22
  3. 清除 data/cache/qrcode 下的所有缓存文件

#### Discuz GBK版本乱码?

Websoft9提供的 Discuz 部署包默认都是UTF-8，一般情况下也可以支持 GBK 版本的Discuz。即当您用Discuz(GBK) 替换 Discuz00(UTF-8) 源码的时候，安装或使用若出现乱码，请参考如下解决办法：

1. 使用SFTP工具（例如“WinSCP”）连接服务器，修改 ect/php.ini 文件，保存
    ```
    默认
    default_charset = "UTF-8"

    修改为
    default_charset = "GBK"
    ```
2. 重启服务或重启服务器后生效
    ```
    systemctl restart httpd
    ```


## 问题解答

#### [DiscuzQ](https://discuz.com/) 与 Discuz 有什么关系和区别？

从品牌上讲，DiscuzQ 是全新架构的 Discuz。但从代码角度看，它们完全不一样。Discuz! Q 的前后端完全分离，后端基于 Laravel，前端基于 Vue.js 和 uni-app，易于二次开发和扩展。

#### Discuz 支持多语言吗？

官方没有提供多语言方案

#### Discuz 是免费的吗？

Discuz 官方说得很模糊，我们也拿不准是不是免费的

#### Dicuz 最新源码在哪了下载？

参考官方：[码云Git地址](https://gitee.com/ComsenzDiscuz/DiscuzX)

#### Discuz 提供客户端吗？

Discuz 官方没有提供，但应用中心有服务商提供了相关的扩展
