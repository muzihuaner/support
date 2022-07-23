---
sidebar_position: 3
slug: /azure/advanced
---

# 进阶

## 核心原理

### API/CLI

Azure 提供了原生 API/CLI 。

## 问题解答

#### 虚拟机的登录账号是什么？

虚拟机账号和密码是用户在创建虚拟机的时候，自行设置的。  

#### 如何给存储配置CDN？

创建CDN，然后再CDN中绑定存储账号即可

#### 如何启用Linux系统的root账号？

Azure默认情况下，root账号是没有启用的，实际上我们参考：[启用root账号](../azure#enableroot)

#### 服务器的IP地址重启后发生变化怎么办？

建议更改为静态IP或为服务器设置一个由Azure提供的DNS

#### 查看 Websoft9 在 Azure 上的所有产品？

通过 [Websoft9镜像库](https://azuremarketplace.microsoft.com/en-us/marketplace/apps?page=1&search=websoft9) 查看我们在Azure上的所有镜像，也可以通过搜索关键字“websoft9”列出

#### 虚拟机上的镜像是否可以更换？

不可以

#### 可否使用临时磁盘 (/dev/sdb1) 存储数据？

不要使用临时磁盘 (/dev/sdb1) 存储数据。 它只是用于临时存储。 有丢失无法恢复的数据的风险。

#### 托管磁盘与非托管磁盘有什么区别？

托管磁盘即用户的磁盘属于Azure磁盘集群中的一部分，非托管磁盘是用户存储账号下的磁盘。

#### 创建 VM 时，用户名和密码有格式要求吗？

Azure有较为明确的要求，具体参考[Azure用户名和密码要求](https://docs.microsoft.com/zh-cn/azure/virtual-machines/linux/faq#what-are-the-username-requirements-when-creating-a-vm)

#### 如何批量恢复误删的 blob?

下载[Microsoft Azure Storage Explorer](https://azure.microsoft.com/zh-cn/features/storage-explorer/)，安装连接登录后，参考下图恢复已删除的文件

![Azure 批量恢复文件](https://libs.websoft9.com/Websoft9/DocsPicture/zh/azure/azure-storageexplorer-canceldel-websoft9.png)

> 恢复过程中可能会报错，需反复重试多次

#### 如何基于云市场来源的VHD磁盘创建VM？

问题描述：基于云市场的 VHD 创建 VM 时，会出现报错。错误信息大意是没有包含云市场的plan。  

解决方案：需要在编排模板的虚拟机属性中加入云市场镜像的计划，例如：

```
"plan": {
                "name": "wordpress52-lemp72-centos76",
                "publisher": "websoft9inc",
                "product": "w9wordpress2"}
```

设置 Plan 之前，需通过 PowerShell 命令获取 plan

```
PS Azure:\> az vm image list --offer w9wordpress2 --all --output table
Offer         Publisher    Sku                          Urn                                                             Version
------------  -----------  ---------------------------  --------------------------------------------------------------  ---------
w9wordpress2  websoft9inc  wordpress52-lemp72-centos76  websoft9inc:w9wordpress2:wordpress52-lemp72-centos76:5.2.20000  5.2.20000
```
