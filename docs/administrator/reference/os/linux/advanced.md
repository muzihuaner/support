---
sidebar_position: 2
slug: /linux/advanced
---

# 进阶

Linux系统博大精深，学习Linux的资料浩瀚如大海。本文档不打算再做重复造轮子的事情，我们尽量根据实践中很常见的**技术要点**进行讲解，同时列出一些操作范例：

## 核心要点

### 启动过程分析

Linux系统的启动过程分为如下几个阶段：

1. 开机自检：打开电源，BIOS进行硬件自检
2. 引导加载：自检通过后，进入MBR引导加载程序（MBR是硬盘中第一个扇区的前512个字节, 称为 main boot record）
3. 内核初始化：加载内核（Kernel）代码，即读入 /boot 目录下的内核文件，监测设备并加载设备驱动程序
4. Systemd初始化（替代init），获取系统控制权

   * 执行Systemd程序，Systemd是一个管理进程的进程程序，也是操作系统的第一个进程，其PID=1
   * 读取 /etc/systemd 下的配置文件
   * 读取 /etc/systemd/system/default.target 下的运行级别文件
   * 执行 */etc/rc.d/rc.local* 文件中的程序

2-4 是由GRUB（Grand Unified Bootloader）负责的。其中GRUB boot loader 代码的一小部分（子集）被写入MBR，其余部分存储在/boot分区中

5. Systemd 执行系统初始化
  
   * 设置主机名
   * 初始化网络
   * 基于配置初始化 SElinux
   * 显示欢迎标语
   * 基于内核参数初始化硬件
   * 加载文件系统
   * 清除 /var 中的目录
   * 启动交换分区

6. 建立终端：系统打开6个终端，以便用户登录系统。

7. 用户登录系统：用户登录使用Linux

### 文件目录结构

通过下面的一张图（右键在新窗口中打开，图片效果更好），我们了解Linux系统的目录结构

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-folders-websoft9.jpg)

### 编码与字体

一个字符（不管是中文还是英文，或是其它文字）在计算机里都是以0101这样数字存放的，编码就是某个字符是以一个什么数字存放在计算机里的。  

字符编码有名为字符集。其原理一句话解释：不同语言对应的机器编码。目前最常用的是**UTF-8**编码方式，下面就是通一个字符在不同字符编码下的机器代码：

| 语言 | 示例               | UTF-8编码  |
| -------- | ------------------------------ | ------------------ |
| 中文    | 你好                    | \xE4\xBD\xA0\xE5\xA5\xBD |
| 英文    | Hello                    | \x68\x65\x6C\x6C\x6F |

编码决定字符的存放，字体决定字符的显示。

字体决定一个字符在界面上显示出来的形状，比如同样是'A'用不同的字体显示出来的形状是不一样的。

同样的文件内容，在屏幕上的输出同时取决于用什么编码和字体。


##### 查看编码

我们在Linux中输入 `locale` 命令，会得到如下的结果：

```
[root@test ~]# locale
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```

en_US.UTF-8 是 UTF-8 的子集，也就是说en_US.UTF-8也是支持中文字符的。区别在于zh_US.UTF-8能够支持更多的汉语特殊字符。

##### 修改编码

如果想切换操作系统的默认显示的语言，就必须修改默认的编码。  

登录 Zabbix 所在的服务器，运行下面的命令之一
```
##方案一
locale-gen zh_CN.UTF-8

##方案二
dpkg-reconfigure locales
```

如果运行**方案二**，请参考下图选择 **zh_CN.UTF-8 UTF-8** 编码规则（键盘空格键选定，Tab键切换位置）

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-localescn-websoft9.png)
![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-localescndef-websoft9.png)

##### 字体管理

我们在实际操作中发现即使当前是en_US.UTF-8编码，如果安装下面的命令后，操作系统便可以正常显示中文。

```
yum groupinstall "fonts"
```
这是为什么呢？ 这个要从计算图形学的角度去分析。编码解决了字符是否可以被计算的问题，而字体解决的是字符渲染成图像，被人识别的问题。

即，如果你希望可以显示中文，你的服务器就必须有中文字体。

> 最后我们来总结：字符编码就是把二进制字节码文件转成计算机能够懂的文字；字体就是把计算机中的文字转换成人能够看懂的图像

### 磁盘管理

#### 存储类型

Linux 支持多种接口类型的存储设备：

- hd：IDE 设备，实际名称为 hda, hdb，即第一个 IDE 设备，第二个 IDE设备，以此类推
- sd：SATA, USB, SCSI 设备，实际名称为 sda, sdb，同上

每个设备又可以被分区，例如第一个 IDE 设备的第一个分区，就被命名为 hda1，以此类推...  

以上就是关于设备、分区在 Linux 系统中的命名。  

命令 `lsblk` 可以非常清晰的展示上面描述的信息和规则

```
$ lsblk
NAME               MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
vda                251:0    0   40G  0 disk
├─vda1             251:1    0  800M  0 part /boot
├─vda2             251:2    0 28.7G  0 part
│ ├─rootvg-rootlv  252:0    0 18.7G  0 lvm  /
│ └─rootvg-crashlv 252:1    0   10G  0 lvm  /var/crash
├─vda14            251:14   0    4M  0 part
└─vda15            251:15   0  495M  0 part /boot/efi


$ lsblk
NAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
vda    253:0    0  40G  0 disk
└─vda1 253:1    0  40G  0 part /
```

TYPE 项中的：disk 表示磁盘， part 表示分区， lvm 

#### 分区

磁盘分区可用区域，例如将一块SSD磁盘划分：sda1、sda2、sda3、sda4等4个分区。  

##### 分区类型

在Linux系统下，磁盘的分区大致可以分为三类，分别为**主分区、扩展分区和逻辑分区**。

传统的 MBR 分区方式一块硬盘最多只能有四个主分区，需要更多分区，就必须引入扩展分区的概念。  

> 弥补 MBR 分区形式的局限性，又诞生了一种逐渐取而代之的格式 GPT

下面这张图就非常清晰的说明了这三种分区之间的关系：  

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-partition001-websoft9.png)

```
#查看磁盘分区
$ fdisk -l
Disk /dev/vda: 42.9 GB, 42949672960 bytes, 83886080 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x000c5246

   Device Boot      Start         End      Blocks   Id  System
/dev/vda4            2048    83886079    41942016    5  Extended
```

其中：Disk label type: dos 表示 MBR 分区，相对应 Disklabel type: gpt 就表示 GPT 分区类型。  

##### 分区扩容

实践中，我们要对云服务器的系统盘进行扩容，除了先通过云控制台购买更大的磁盘空间之外，还需要进行如下的操作：

1. 规划好新增的磁盘应该对应的分区，假设为 /dev/vda1 分区

2. 对分区进行扩容操作
   ```
   #1 安装分区扩容软件 growpart
   yum install -y cloud-utils-growpart

   #2 分区扩容操作
   growpart /dev/vda 1

   #3 增大或收缩 ext2/ext3/ext4 文件系统
   resize2fs /dev/vda1  
   ```

##### LVM

LVM 是一个新的磁盘虚拟化管理技术，将多个**真实的物理分区**虚拟为一个**逻辑上物理分区**，以便更多的对磁盘进行伸缩和备份。  

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-lvm-websoft9.jpg)

下面直接列出 LVM 常见的用法：

```
#1 显示 LV 分区
$ lvdisplay

  --- Logical volume ---
  LV Path                /dev/rootvg/crashlv
  LV Name                crashlv
  VG Name                rootvg
  LV UUID                2MectT-GQ0J-FkVJ-Phue-7X0S-lH0U-2iJclg
  LV Write Access        read/write
  LV Creation host, time localhost, 2021-10-13 16:53:19 +0000
  LV Status              available
  # open                 1
  LV Size                10.00 GiB
  Current LE             2560
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           252:1

  --- Logical volume ---
  LV Path                /dev/rootvg/rootlv
  LV Name                rootlv
  VG Name                rootvg
  LV UUID                bdLRb7-a1WN-DKRR-XNpX-sE5B-1IsA-XtsDfq
  LV Write Access        read/write
  LV Creation host, time localhost, 2021-10-13 16:53:19 +0000
  LV Status              available
  # open                 1
  LV Size                <18.73 GiB
  Current LE             4794
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           252:0

  #2 扩容 PV
  lv
  pvresize
```

实战案例学习：[《阿里云系统盘LVM扩容》](https://help.aliyun.com/document_detail/131143.htm)。  

下面是对案例的简述：

1. 云控制台通过购买，新增20G系统盘空间
2. 对根目录所在分区进行扩容操作
   ```
   #1 安装分区扩容软件 growpart
   yum install -y cloud-utils-growpart

   #2 分区扩容操作
   growpart /dev/vda 2

   #3 增大或收缩 ext2/ext3/ext4 文件系统
   resize2fs /dev/vda2 
   ```
3. 运行 `lvdisplay` 查看是否存在 LVM 的分区
   ```
      --- Logical volume ---
   LV Path                /dev/rootvg/crashlv
   LV Name                crashlv
   VG Name                rootvg
   LV UUID                2MectT-GQ0J-FkVJ-Phue-7X0S-lH0U-2iJclg
   LV Write Access        read/write
   LV Creation host, time localhost, 2021-10-13 16:53:19 +0000
   LV Status              available
   # open                 1
   LV Size                10.00 GiB
   Current LE             2560
   Segments               1
   Allocation             inherit
   Read ahead sectors     auto
   - currently set to     8192
   Block device           252:1
   ```
4. 先扩容 PV
   ```
   pvdisplay
   pvresize <pvname>
   pvs
   ```

5. 扩容 LV （最终所需的分区）
   ```
   lvextend -l +100%FREE <LV's Path>
   lvdisplay
   lvs
   ```

6. 修正文件系统
   ```
   # ext4 文件系统
   resize2fs <LV's Path>

   # xfs文件系统
   xfs_growfs  <LV's Path>
   ```

#### 格式化

格式化指将磁盘分区格式化成不同的文件系统，以方便操作系统集中组织和管理文件。

```
#将/dev下的 sda5 磁盘格式化为 ext2 的格式类型
mkfs.ext2 /dev/sda5
```
#### 挂载

对于Linux系统来说，挂载是将格式化后的分区与系统中的目录匹配起来，使得访问这个目录就相当于访问这个分区。

```
#将 /dev/sda5 挂载到 test 中
mount /dev/sda5/test
```
#### 文件系统

Linux除支持Ext4文件系统外，还支持其他各种不同的文件系统，例如集群文件系统以及加密文件系统等。Linux将各种不同文件系统的操作和管理纳入到一个统一的框架中，使得用户程序可以通过同一个文件系统界面，也就是同一组系统调用，能够对各种不同的文件系统以及文件进行操作。这样，用户程序就可以不关心各种不同文件系统的实现细节，而使用系统提供的统一、抽象、虚拟的文件系统界面。这种统一的框架就是所谓的虚拟文件系统转换（Virtual Filesystem Switch），一般简称虚拟文件系统 (VFS)。虚拟文件系统描述如下所示：

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/vfs-websoft9.png)

Linux系统核心可以支持十多种文件系统类型，比如Btrfs、JFS、ReiserFS、ext、ext2、ext3、ext4、ISO9660、XFS、Minx、MSDOS、UMSDOS、VFAT、NTFS、HPFS、NFS、SMB、SysV、PROC等。

```
#将系统内所有的文件系统列出来
df -T
Filesystem     Type     1K-blocks     Used Available Use% Mounted on
udev           devtmpfs   4047124        0   4047124   0% /dev
tmpfs          tmpfs       815312     8252    807060   2% /run
/dev/vda1      ext4      61795304 49591808   9461040  84% /
tmpfs          tmpfs      4076556        0   4076556   0% /dev/shm
tmpfs          tmpfs         5120        0      5120   0% /run/lock
tmpfs          tmpfs      4076556        0   4076556   0% /sys/fs/cgroup

#将系统内的所有特殊文件格式及名称都列出来

df -aT
Filesystem    Type 1K-blocks    Used Available Use% Mounted on
/dev/hdc2     ext3   9920624 3823112   5585444  41% /
proc          proc         0       0         0   -  /proc
sysfs        sysfs         0       0         0   -  /sys
devpts      devpts         0       0         0   -  /dev/pts
/dev/hdc3     ext3   4956316  141376   4559108   4% /home
/dev/hdc1     ext3    101086   11126     84741  12% /boot
tmpfs        tmpfs    371332       0    371332   0% /dev/shm
none   binfmt_misc         0       0         0   -  /proc/sys/fs/binfmt_misc
sunrpc  rpc_pipefs         0       0         0   -  /var/lib/nfs/rpc_pipefs
```

### 用户管理

Linux系统是一种典型的多用户系统，不同的用户处于不同的地位，拥有不同的权限。

##### 账号

任何一个要使用系统的用户，都必须首先向系统管理员申请一个账号，然后以这个账号的身份进入系统。

对于Linux系统来说，名称为root的用户具有最高权限，且权威建议我们应该少用root用户。

用户在登录时键入正确的用户名和口令后，就能够进入系统和自己的主目录。实现用户账号的管理，要完成的工作主要有如下几个方面：

* 用户账号的添加、删除与修改。
* 用户口令的管理。
* 用户组的管理。

每个用户都有一个用户组，系统可以对一个用户组中的所有用户进行集中管理。不同Linux 系统对用户组的规定有所不同，如Linux下的用户属于与它同名的用户组，这个用户组在创建用户时同时创建。  

用户组的管理涉及用户组的添加、删除和修改。组的增加、删除和修改实际上就是对/etc/group文件的更新。

##### 权限

划分用户最主要的目录就是为了分配权限，让具有不同权限的用户做不同的事情。  

运行 `ls -l` 命令，可以查询文件的权限分配情况：

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/ls-s-websoft9.png)

##### 密码与秘钥对

密码是用户登录Linux系统的凭证，一个用户名对应有配套的密码，这个密码由服务器掌管。

密码使用非常广泛，理解上没有困难。而秘钥对相对密码来说，不是特别好理解，这里做出通俗的解释：

我们知道在军事通讯上，有一种工具叫密码本，是通讯双方都持有的一种加密方案。其实秘钥对原理与密码本是非常类似的。

秘钥对分为：私钥和公钥，互成为一对。独立存在没有意义，只有双方同时使用才有用。

服务器上存储的是公钥，本地电脑存储的是私钥，当本地电脑连接服务器的时候，私钥和公钥做一个匹配，匹对通过，双方才能建立连接，允许通讯，否则拒绝连接。

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/keypairs-websoft9.png)



### 软件包

Linux生态中的软件包资源非常丰富，从某种程度上看，用户是否熟练的下载安装以及更新这些包，决定了能够为所在的企业创作的价值的大小。

除了传统的下载源码在编译的软件包安装方案之外，Linux 操作系统都提供了一个集中的软件包管理机制，即搜索、安装和管理软件包。 Linux 软件包的基本组成部分通常有：共享库、应用程序（二进制）、服务和文档。从另外一个角度看，包文件通常包含编译好的二进制文件和其它资源组成的：软件、安装脚本、元数据及其所需的依赖列表。

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-rpms-websoft9.png)

包管理通常不仅限于软件的一次性安装，还包括了对已安装软件包进行升级的工具。

* 包：被安装到本地服务器的软件安装包，例如Apache安装包
* 包缓存：安装软件时在本地保存的临时文件，通常存储在 */var/cache/yum* 目录下
* 仓库：存放多个软件包的一个远端服务器
* 仓库地址：用于访问仓库的网址
* 本地安装包缓存：本地已经下载的软件缓存，通常存储在 */var/lib/rpm* 目录下，可以通过 `rpm -`
* 本地存储的软件清单：从仓库下载所有的软件清单并存在在本地，可以通过`yum list`检索

本章主要讨论和研究Linux系统的包管理机制、实践方案。

#### 仓库

多个软件包存储在一个集中位置，就称之为仓库「repository」，这种以仓库方式集中存放，有利于软件开发者或包维护者进行管理。

仓库的网址，称之为仓库地址，专业术语叫”源”。

互联网上有大量的源，比如 Redhat 官方的源，也有云厂家提供的源。在配置 Linux 服务器或开发环境时，通常都不仅限于使用官方源。相较于现如今软件版本快速更新迭代而言，系统管理员和开发人员掌握常见 Linux 包管理基本操作还是一项必备的常用技能。

每个操作系统发行版厂家从商业战略的角度，会直接维护或间接维护多个仓库，以实现其分级服务和规避责任的目的。

例如：CentOS 可用的几个仓库有：

* 官方仓库：[Ubuntu Packages](https://packages.ubuntu.com/)
* SCL、EPEL、IUS 等第三方仓库  

官方仓库中的软件包理论上最稳定可靠，其他仓库作为辅助。另外，像 Ubuntu 官方仓库网站提供了非常便捷的包检索页面，用户寻找包的效率远超过 apt search 的方式。

与此同时，官方为了吸引用户贡献包，也会提供最简单的工具（[copr 项目](https://copr.fedorainfracloud.org/)），让用户专注于包配置（sepc文件）方面的工作，而构建编译和托管由平台负责，就可以充分利用社区力量，让仓库的软件变得异常丰富。

仓库越来越多，自然就诞生了跨仓库的搜索引擎，类似 [pkgs](https://pkgs.org/) 便可以检索主流的仓库的包，节省了用户寻找的时间。

##### 仓库源

下面我们列出全球比较流行的仓库：

|  名称  | 地址 |             概要              |
| :----: | :--: | :---------------------------: |
| RPM Fusion | https://rpmfusion.org/ | RPM Fusion provides software that the Fedora Project or Red Hat doesn't want to ship. That software is provided as precompiled RPMs for all current Fedora versions and current Red Hat Enterprise Linux or clones versions;  |
| EPEL | https://fedoraproject.org/wiki/EPEL | EPEL (Extra Packages for Enterprise Linux), 是由 Fedora Special Interest Group 维护的 Enterprise Linux（RHEL、CentOS）中经常用到的包。 |
| RepoForge | http://repoforge.org/ |Repoforge 是 RHEL 系统下的软件仓库，拥有 10000 多个软件包，被认为是最安全、最稳定的一个软件仓库。|
| Remi | https://www.remi.com |Remi repository 是包含最新版本 PHP 和 MySQL 包的 Linux 源，由 Remi 提供维护。|
| PackMan | http://packman.links2linux.org/ | Packman 是 OpenSUSE 最大的第三方软件源，主要为 OpenSUSE 提供额外的软件包，包括音视频解码器、多媒体应用、游戏等。 |
| Dotdeb | http://www.debian.org/ | Dotdeb is an extra repository providing up-to-date packages for your Debian 8 “Jessie” servers .|
| Gentoo portage | https://www.gentoo.org | Gentoo Portage 软件源 |
| Fedora altarch | https://archives.fedoraproject.org/pub/ | Fedora altarch 是 Fedora Linux 额外平台的安装镜像和官方软件包仓库。 |
| Ubuntu Ports | http://ports.ubuntu.com | Ubuntu Ports 是 Arm64，Armhf 等平台的 Ubuntu 软件仓库 |
| Centos altarch | http://mirror.centos.org/altarch/ | CentOS 额外平台的安装镜像和官方软件包仓库 |
| IUS | https://ius.io/ | IUS（Inline with Upstream Stable）是一个社区项目，它旨在为 Linux 企业发行版提供可选软件的最新版 RPM 软件包。 |
| ATOMIC | http://www.atomicorp.com/channels/atomic/ | Atomic源支持Fedora，RHEL和CentOS的YUM包管理。 |


##### 仓库搜索引擎

仓库搜索引擎是收录仓库的网站：  

|  名称  | 地址 |             概要              |
| :----: | :--: | :---------------------------: |
| Linux Packages | https://linux-packages.com/ | 轻松找到有关 Linux 上所有软件包的信息，包括 Ubuntu、Centos、Arch、Debian... |



以上是"大卖场"式的仓库源，实际上很多知名的开源软件，例如：MySQL,Apache等还提供自建的仓库，供用户使用。

* [MySQL repo](https://dev.mysql.com/downloads/repo/yum/)
* [Nginx repo](http://nginx.org/en/linux_packages.html#RHEL-CentOS)

下图是MySQL官方的仓库文件下载页面，*mysql80-community-release-el8-1.noarch.rpm*这种文件就是用户安装仓库地址的rpm包。

![repo mysql](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/repo-mysql-websoft9.png)

Linux 提供方便的仓库管理命令：  

```
# 安装仓库管理套件
yum -y install yum-utils

# 范例：启用某个仓库
yum-config-manager --enable remi-php70
```

##### 安装仓库

安装仓库通俗的讲，就是将仓库的网址（地址）信息写入到服务器的指定文件夹（文件）中。类似我们为了方便自己购物，将不同的购物网站的网站收藏到浏览器是一个道理。

* CentOS仓库网址存放地：/etc/yum.repos.d
* Ubuntu仓库网址存放地：/etc/apt/sources.list

以CentOS仓库为例，查看 */etc/yum.repos.d* 目录，我们会发现下面有几个以 repo 结尾的文件

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/repo-list-websoft9.png)

打开每个.repo文件，你会看到其中的主要信息就是网址

那这些.repo文件是如何被安装的呢？主要有如下几种方式：

```
#1 yum 安装
yum install epel-release

#2 下载 RPM包安装

wget -O /etc/yum.repos.d/epel.repo https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -i epel-release-latest-7.noarch.rpm

#3 直接在 /etc/yum.repos.d 新增一个.repo文件，内容如下

[rpmfusion-free]
name=RPM Fusion for Fedora $releasever - Free
baseurl=https://mirrors.tuna.tsinghua.edu.cn/rpmfusion/free/fedora/releases/$releasever/Everything/$basearch/os/
mirrorlist=http://mirrors.rpmfusion.org/mirrorlist?repo=free-fedora-$releasever&arch=$basearch
enabled=1
metadata_expire=7d
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-rpmfusion-free-fedora-$releasever-$basearch

[rpmfusion-free-debuginfo]
name=RPM Fusion for Fedora $releasever - Free - Debug
mirrorlist=http://mirrors.rpmfusion.org/mirrorlist?repo=free-fedora-debug-$releasever&arch=$basearch
enabled=0
metadata_expire=7d
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-rpmfusion-free-fedora-$releasever-$basearch

[rpmfusion-free-source]
name=RPM Fusion for Fedora $releasever - Free - Source
baseurl=https://mirrors.tuna.tsinghua.edu.cn/rpmfusion/free/fedora/releases/$releasever/Everything/source/SRPMS/
mirrorlist=http://mirrors.rpmfusion.org/mirrorlist?repo=free-fedora-source-$releasever&arch=$basearch
enabled=0
metadata_expire=7d
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-rpmfusion-free-fedora-$releasever-$basearch
```

我们知道仓库网址上有一个特殊的**数据库**文件（软件列表），这个文件记录这个网址所提供的所有安装包，有的仓库只有少数几个安装包，有的仓库提供成千上万个安装包。

同时本地也有一个**数据库**文件（RPM 数据库 ），它记录本地已经安装的软件包名称、版本、来源等信息。当用户使用yum安装软件的时候，本地就会到仓库中下载软件列表，通过与本地的RPM数据库做对比，然后决定是否安装或提示已经存在无需安装。

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/installwithyum-websoft9.jpg)


##### 自建仓库

在安装MySQL的时候，我们就发现，MySQL官方提供了自己的仓库以供用户使用。也就意味着，仓库是可以自行建设的。

参考：[《配置本地Yum仓库》](https://www.runoob.com/linux/linux-yum.html)


#### 管理包

虽然大多数流行的 Linux 发行版在包管理工具、方式和形式都大同小异，但却还是有平台差异：

|  系统  | 格式 |             工具              |
| :----: | :--: | :---------------------------: |
| Debian | .deb | apt, apt-cache、apt-get、dpkg |
| Ubuntu | .deb | apt、apt-cache、apt-get、dpkg |
| CentOS | .rpm |              yum              |
| Fedora | .rpm |              dnf              |

下图是典型的deb包组成部分：

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/DEB-Package-Format.png)

Debian 及其衍生产品如：Ubuntu、Linux Mint 和 Raspbian 的包格式为.deb文件，apt 是最常见包操作命令，可：搜索库、安装包及其依赖和管理升级。而要直接安装现成.deb包时需要使用dpkg命令。

CentOS、Fedora 及 Red Hat 系列 Linux 使用RPM包文件，并使用yum命令管理包文件及与软件库交互。

在最新的 Fedora 版本中，yum命令已被dnf取代进行包管理。


##### 更新本地数据库

大多数 Linux 都使用本地数据库来存储远程可用的包仓库列表，所以在安装或升级包之前最好更新（同步）一下这个数据库。

|      系统       |        命令         |
| :-------------: | :-----------------: |
| Debian / Ubuntu | sudo apt-get update |
|     CentOS      |  yum check-update   |
|     Fedora      |  dnf check-update   |

##### 升级已安装的包

在没有包管理方式时，要升级并保持 Linux 已装软件处在最新版本上是一个巨大的工程，管理员和用户不得不手动跟踪上游软件版本变化及安全警告。在有了包管理系统之后，只需几条命令便可保持软件最新。

|      系统       |           命令            |                 备注                 |
| :-------------: | :-----------------------: | :----------------------------------: |
| Debian / Ubuntu |   sudo apt-get upgrade    |         仅升级已安装的软件包         |
|                 | sudo apt-get dist-upgrade | 可添加或删除程序包，以满足新的依赖。 |
|     CentOS      |      sudo yum update      |                                      |
|     Fedora      |     sudo dnf upgrade      |                                      |

##### 查找/搜索软件包

大多数 Linux 桌面版本都提供用户可搜索和安装软包的界面，这是找寻和安装软件的最佳方法。但对于追求效率和服务器管理员来说，使用命令行工具查找/搜索软件包才是正途。

|      系统       |           命令            |            备注            |
| :-------------: | :-----------------------: | :------------------------: |
| Debian / Ubuntu | apt-cache search 搜索内容 |                            |
|     CentOS      |    yum search 搜索内容    |                            |
|                 |  yum search all 搜索内容  yum --showduplicates list gitlab-ee
  | 搜索所有内容，包括包描述。 |
|     Fedora      |    dnf search 搜索内容    |                            |
|                 |  dnf search all 搜索内容  | 搜索所有内容，包括包描述。 |

##### 查看某个软件包信息

在决定安装哪个包之前，我们往往都需要查看该软件包的详细说明。包的说明文件中通常包括：包名、版本号及依赖列表等元数据，可以使用如下命令来查看。

|      系统       |             命令             |             备注             |
| :-------------: | :--------------------------: | :--------------------------: |
| Debian / Ubuntu |     apt-cache show 包名      | 显示有关软件包的本地缓存信息 |
|                 |         dpkg -s 包名         |     显示包的当前安装状态     |
|     CentOS      |        yum info 包名         |                              |
|                 |       yum deplist 包名       |         列出包的以来         |
|     Fedora      |        dnf info 包名         |                              |
|                 | dnf repoquery –requires 包名 |         列出包的以来         |


```
# 通过 rpm 命令查看已安装软件包的信息
$ rpm -qi rabbitmq-server
Name        : rabbitmq-server
Version     : 3.8.3
Release     : 1.el7
Architecture: noarch
Install Date: Sat 11 Apr 2020 03:16:18 PM CST
Group       : Development/Libraries
Size        : 14010653
License     : MPLv1.1 and MIT and ASL 2.0 and BSD
Signature   : RSA/SHA256, Mon 09 Mar 2020 11:24:36 PM CST, Key ID 6b73a36e6026dfca
Source RPM  : rabbitmq-server-3.8.3-1.el7.src.rpm
Build Date  : Mon 09 Mar 2020 11:24:34 PM CST
Build Host  : b0cb34e7-576c-46ec-669f-7b518b2352e1
Relocations : (not relocatable)
URL         : https://www.rabbitmq.com/
Summary     : The RabbitMQ server
Description :
RabbitMQ is an open source multi-protocol messaging broker.

# 通过 rpm 查看未安装的软件包的信息
$ rpm -qpi rabbitmq-server

# 通过 yum 查看软件包信息
$ yum info rabbitmq-server
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
Installed Packages
Name        : rabbitmq-server
Arch        : noarch
Version     : 3.8.3
Release     : 1.el7
Size        : 13 M
Repo        : installed
From repo   : rabbitmq_rabbitmq-server
Summary     : The RabbitMQ server
URL         : https://www.rabbitmq.com/
License     : MPLv1.1 and MIT and ASL 2.0 and BSD
Description : RabbitMQ is an open source multi-protocol messaging broker.
```

##### 从软件仓库安装包

一旦我们知道某个软件包的名称之后，便可以使用如下命令从软件仓库安装包。

|      系统       |              命令              |       备注       |
| :-------------: | :----------------------------: | :--------------: |
| Debian / Ubuntu |   sudo apt-get install 包名    |                  |
|                 | sudo apt-get install 包1 包2 … | 安装所有列出的包 |
|                 |  sudo apt-get install -y 包名  | 无需提示直接安装 |
|     CentOS      |     sudo yum install 包名      |                  |
|                 |   sudo yum install 包1 包2 …   | 安装所有列出的包 |
|                 |    sudo yum install -y 包名    | 无需提示直接安装 |
|                 |    yum install yum-plugin-downloadonly  包名    | 只下载包而不安装 |
|                 |    sudo yumdownloader 包名    | 下载包到当前目录 |
|     Fedora      |     sudo dnf install 包名      |                  |
|                 |   sudo dnf install 包1 包2 …   | 安装所有列出的包 |
|                 |    sudo dnf install -y 包名    | 无需提示直接安装 |

##### 从本地文件系统直接安装包

很多时候，我们在进行测试或从某个地方直接拿到软件包之后需要从本地文件系统直接安装包。Debian 及衍生系统可以使用 **dpkg** 进行安装，CentOS 和 Fedora 系统使用 **yum** 和 **dnf** 命令进行安装。

|      系统       |                        命令                         |            备注             |
| :-------------: | :-------------------------------------------------: | :-------------------------: |
| Debian / Ubuntu |                sudo dpkg -i 包名.deb                |                             |
|                 | sudo apt-get install -y gdebi&& sudo gdebi 包名.deb | 使用gdebi检索缺少的依赖关系 |
|     CentOS      |              sudo yum install 包名.rpm              |                             |
|     Fedora      |              sudo dnf install 包名.rpm              |                             |

##### 移除已安装的包

包管理器知道哪些文件是由哪个包提供的，所以卸载不需要的软件包之后可以获得一个干净的系统。

|      系统       |           命令           |          备注          |
| :-------------: | :----------------------: | :--------------------: |
| Debian / Ubuntu | sudo apt-get remove 包名 |                        |
|                 | sudo apt-get autoremove  | 自动移除已知不需要的包 |
|     CentOS      |   sudo yum remove 包名   |                        |
|     Fedora      |   sudo dnf erase 包名    |                        |

##### 锁定软件包版本

有些时候，我们在对系统进行更新操作时，不需要对某些软件包进行升级操作，要把该包锁定在某个特定版本下。这个时候我们就需要用到相关的插件，以yum为例：

```
yum install yum-plugin-versionlock
```

安装 **yum-plugin-versionlock** 之后，系统新增一个配置文件：*/etc/yum/pluginconf.d/versionlock.list*  

可以直接编辑此文件，往其中添加锁定项，也可以通过下面的命令添加锁定项
```
yum versionlock gcc-*

```
上述配置不允许将gcc软件包升级到大于执行锁定时安装的软件包的版本。

#### 制作包

我们知道 rpm/deb 包都是存储在仓库中的可以运行的包，使得我们安装软件非常的简单和方便。  

如果我们需要安装的软件，在互联网上找不到对应的包，怎么办？通常的做法是下载源码编译安装。

编译安装可以解决我们自身安装软件的问题，但我们无法给他人共享我们的安装成功，因此我们如果可以自己制作 rpm/deb 包，然后发布到互联网上，一定有很多人下载，这样分享自己的创作成果毫无疑问会得到极大的收获和鼓舞。

下面我们以 RPM 包为例，详细介绍制作过程（[参考来源](https://rpm-packaging-guide.github.io/)）。

##### 知识

**安装颗粒度**

与安装相关的技术知识颗粒度由小到大分别为：Make 编译 > RPM 包制作 > 包仓库建设。  
颗粒度越大，受惠的人群越广。  

**spec 文件**

Spec 文件是 RPM 包的编排文件，简单理解为制作脚本，它是制作 RPM 包最核心的内容。  

下面是一个简单的 Spec 文件（假设名称为 hello.spec）：

```
Name:       hello-world
Version:    1
Release:    1
Summary:    Most simple RPM package
License:    FIXME

%description
This is my first RPM package, which does nothing.

%prep
# we have no source, so nothing here

%build
cat > hello-world.sh <<EOF
#!/usr/bin/bash
echo Hello world
EOF

%install
mkdir -p %{buildroot}/usr/bin/
install -m 755 hello-world.sh %{buildroot}/usr/bin/hello-world.sh

%files
/usr/bin/hello-world.sh

%changelog
# let's skip this for now
```

将以上文件的内容保存到 Spec 文件后，运行如下的命令，便完成一个 RPM 包的制作。
```
rpmdev-setuptree
rpmbuild -ba hello.spec
```

通过 `tree` 命令查询安装结果：
```
$ tree rpmbuild
rpmbuild
|-- BUILD
|   `-- hello-world.sh
|-- BUILDROOT
|-- RPMS
|   `-- x86_64
|       `-- hello-world-1-1.x86_64.rpm
|-- SOURCES
|-- SPECS
`-- SRPMS
    `-- hello-world-1-1.src.rpm

7 directories, 3 files

```

从以上的范例，可以直接得出几个坚定的结论：

* RPM 包制作中的 Build 不一定是编译，它也可以是其他动作，例如：拷贝一个文件
* RPM 包名称会根据描述信息自动名词，非常规范，可读性也很好
* 生成 RPM 包的同时，也会生成一个 SRPM 包
* Spec 语法基本就是 Shell 语法
* 依赖组件不是必须的

**Makefile**

Makefile 顾名思义是 `make` 时所需的一个编排文件，如果用不着 `make`，那么 Makefile 也就不需要。

> 关于 Make 命令，参考官方文档：[GNU Make](https://www.gnu.org/software/make/)

**交叉编译**


#### 生态工具

在云计算发展的今天，包管理丰富多彩。在实践中，有一些非常好用好玩的工具：

* packagecloud.io: 提供包管理托管的网站，范例参考：[RabbitMQ on packagecloud](https://packagecloud.io/rabbitmq/rabbitmq-server/)
* 软件分发即服务：https://bintray.com/
* C/C++编译工具: https://conan.io/
* 包检索工具：https://pkgs.org/
* Snap包:https://snapcraft.io/
* Flatpak包：https://www.flatpak.org/

#### 发行版特别说明

下面总结主流 Linux 发行版上的包管理相关的独特性

##### RedHat

RedHat 系统免费，但是仓库需要订阅。  

下面重点介绍 RedHat 如何使用 CentOS-base 仓库的方案

##### CentOS

CentOS 是 RedHat 的同步办法，完全免费。

##### Debian

Debian 官方仓库的软件包非常丰富，版本更新及时。  
Debian 也可以使用 Ubuntu 社区的仓库，例如：[ppa](https://launchpad.net/ubuntu/+ppas)，但是使用 `apt-add-repository --yes --update ppa:ansible/ansible` 增加仓库软件包的时候，默认会增加 Ubuntu 最新版本的地址。  

##### Ubuntu

##### OracleLinux

[OracleLinux](http://yum.oracle.com/) 是 RedHat 家族的分支，与 CentOS 非常类似，但完全基于 RedHat 内核。  

```
[root@iZj6c6izdnwbwt5jb0i2r0Z ~]# cat /proc/version
Linux version 4.14.35-1902.305.4.el7uek.x86_64 (mockbuild@jenkins-10-147-72-125-9cc530f8-159f-444e-98e9-d1e5d2b5e4e2) (gcc version 4.8.5 20150623 (Red Hat 4.8.5-16.0.3) (GCC)) #2 SMP Tue Aug 4 14:17:05 PDT 2020

```

OracleLinux 非常注重打造自己的生态，官方提供了大量在线安装包，并用心维护，基本能够方便用户快速的安装主流软件。

运行命令 `yum list *release-el7` 查看所有可用的源：

```
mysql-release-el7.x86_64                                           1.0-3.el7                          ol7_latest
oracle-ceph-release-el7.x86_64                                     1.0-2.el7                          ol7_latest
oracle-epel-release-el7.x86_64                                     1.0-3.el7                          ol7_latest
oracle-gluster-release-el7.x86_64                                  1.0-6.el7                          ol7_latest
oracle-golang-release-el7.x86_64                                   1.0-6.el7                          ol7_latest
oracle-nodejs-release-el7.x86_64                                   1.0-5.el7                          ol7_latest
oracle-olcne-release-el7.x86_64                                    1.0-5.el7                          ol7_latest
oracle-openstack-release-el7.x86_64                                1.0-2.el7                          ol7_latest
oracle-ovirt-release-el7.x86_64                                    1.0-1.el7                          ol7_latest
oracle-php-release-el7.x86_64                                      1.0-4.el7                          ol7_latest
oracle-release-el7.x86_64                                          1.0-3.el7                          ol7_latest
oracle-softwarecollection-release-el7.x86_64                       1.0-3.el7                          ol7_latest
oracle-spacewalk-client-release-el7.x86_64                         1.0-4.el7                          ol7_latest
oracle-spacewalk-server-release-el7.x86_64                         1.0-4.el7                          ol7_latest
oraclelinux-developer-release-el7.x86_64                           1.0-5.el7                          ol7_latest
oraclelinux-release-el7.x86_64                                     1.0-12.1.el7                       ol7_latest
```

##### AmazonLinux

AmazonLinux 官方对其发行版的性质描述非常少，似乎刻意回避。实际上，AmazonLinux 也是 RedHat 家族的分支，非常类似 CentOS。  

经过实践探索，CentOS 相关的仓库（例如：CentOS-base.repo）也是可以在 AmazonLinux 上使用的。  

值得注意的是，AmazonLinux 默认的源会设置优先级（priority=10），导致 yum 无法自主灵活的选择其他仓库的安装包。  

* amzn2-extras.repo
* amzn2-core.repo

所以，建议删除以上两个官方默认仓库的优先级设置，把安装的自主权交还给 yum。

### 文件管理

##### 拥有者

规定文件只能被指定用户访问访问  

范例：

```
# 修改wwwroot文件夹所属的用户和用户组为nginx
chown -R nginx.nginx /data/wwwroot
```

##### 权限

Linux系统对不同的用户访问同一文件（包括目录文件）的权限做了不同的规定。  



范例：

```
# 分别修改文件和文件夹的读、写、执行权限
find /data/wwwroot/default -type f -exec chmod 640 {} \;
find /data/wwwroot/default -type d -exec chmod 750 {} \;
```

##### 操作

对文件典型操作包括：

cp 拷贝文件和目录  
rm 移除文件或目录  
mv 移动文件与目录，或修改名称  

查看文件有多种命令：

cat  由第一行开始显示文件内容  
tac  从最后一行开始显示  
nl   显示的时候，同时输出行号  
more 一页一页的显示文件内容  
less 一页一页的显示文件内容+往前翻页 
head 只显示头几行  
tail 只显示尾几行  

##### 目录

接下来我们就来看几个常见的处理目录的命令吧：

ls: 列出目录
cd：切换目录
pwd：显示目前的目录
mkdir：创建一个新的目录
rmdir：删除一个空的目录
cp: 复制文件或目录
rm: 移除文件或目录
mv: 移动文件与目录，或修改文件与目录的名称



### 软（硬）连接

Linux中的软连接和硬连接很常用，下面分别介绍。

#### 软连接

软连接是指向另外一个文件的文件，类似Windows中的快捷方式文件。  

如何才能知道哪些文件是软连接文件呢？

##### 查询软连接

我们先进入etc目录，然后列出文件（以re关键词作为结果筛选）

```
root@test:/etc# ls -l | grep re
-rw-r--r-- 1 root root     367 Jan 27  2016 bindresvport.blacklist
drwxr-xr-x 2 root root    4096 Apr  9 06:04 firefox
lrwxrwxrwx 1 root root      33 Dec 25 16:13 localtime -> /usr/share/zoneinfo/Asia/Shanghai
-rw-r--r-- 1 root root     105 Jan 30 20:28 lsb-release
lrwxrwxrwx 1 root root      21 Jan 30 20:28 os-release -> ../usr/lib/os-release
drwxr-xr-x 4 root root    4096 Dec 25 16:13 resolvconf
lrwxrwxrwx 1 root root      29 Dec 25 16:13 resolv.conf -> ../run/resolvconf/resolv.conf
-rw-r--r-- 1 root root    3663 Jun  9  2015 screenrc
-rw-r--r-- 1 root root    4141 Jan 25  2018 securetty
-rw-r--r-- 1 root root    1656 Jul 25  2019 tmpreaper.conf

root@test:/etc# ls -l | grep ^l
lrwxrwxrwx 1 root root      33 Dec 25 16:13 localtime -> /usr/share/zoneinfo/Asia/Shanghai
lrwxrwxrwx 1 root root      19 Dec 26 00:11 mtab -> ../proc/self/mounts
lrwxrwxrwx 1 root root      21 Jan 30 20:28 os-release -> ../usr/lib/os-release
lrwxrwxrwx 1 root root      29 Dec 25 16:13 resolv.conf -> ../run/resolvconf/resolv.conf
lrwxrwxrwx 1 root root      23 Dec 25 16:08 vtrgb -> /etc/alternatives/vtrgb

```

上面的例子中，我们运行了 `ls -l` 命令，显示了几种不同类型的文件：

* lrwxrwxrwx: 这种以l开头的就是软连接文件
* drwxr-xr-x：这种以d开头的就是目录
* -rw-r--r--：这种以-开头的就是文件

了解了什么是软连接之后，我们就可以自己动手进行软连接的相关操作：

##### 创建软连接

```
cd /root
ln -s /usr/share/zoneinfo/Asia/Shanghai2 mysoftlink
file mysoftlink
```

##### 删除软连接

```
rm -rf mysoftlink
```

注意事项：  

1. 被连接的文件名（路径）建议采用绝对路径
2. 错误的软连接（又名断开）使用 `ls -l` 的时候显示的是红色
3. 软连接是一个文件，其在硬盘中是存在数据块的
4. 软连接文件的数据库中存储的是路径信息，而非真正的数据
5. 软连接可能是多级嵌套的，例如：B连接A，C连接B，D连接C

#### 硬连接

硬连接相对于软连接来说，理解会困难一点点。硬连接是把不同的文件名对应到同一个存储块节点上。  

例如：在服务器硬盘中有一个数据块存在的是一段小视频，这个小视频的文件名称为：/data/mymedia.mp4。  

创建一个硬连接，只需使用`ln`命令即可

```
cd /data
ln /data/mymedia.mp4  mymedia2.mp4
```

注意事项：  

1. 被连接的文件名（路径）建议采用绝对路径
2. 如果一个文件增加了对应的硬连接，那么删除文件的时候不会删除数据
3. 硬连接文件存储的是真实数据块位置
4. 只能对文件建立硬连接，而不能对一个目录建立硬连接


> 硬链接与域名管理中的同一个网站，用A记录配置上两个域名是同类原理。  
软连接与域名管理中的cname解析是同类原理。

### 环境变量

环境变量即操作系统的变量。环境变量非常灵活，在实际使用过程中需要深刻理解几个关键要点：环境变量作用域、环境变量存放处以及存储环境变量的文件的开机启动顺序。

```
# 列出所有变量
set

# 列出所有环境变量
env

# 列出和设置环境变量
export 
export varname

# 列出所有别名
alias
```

### 进程

进程是操作系统的资源管理和调度单元。

* 当一个用户通过登录Linux系统，他就启动了一个shell进程
* 当一个进程创建另一个进程，就产生父进程和子进程的关系
* 当子进程运行时，父进程处于等待服务的状态，子进程完成它的工作后就会报告给父进程，再由父进程终止子进程

> 延伸阅读：[Linux 进程的生命周期](https://natanyellin.com/posts/life-and-death-of-a-linux-process/)

运行 `ps -ef` 列出所有进程:

```
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 Apr26 ?        00:00:02 /usr/lib/systemd/systemd --switched-root --system --deserialize 22
root         2     0  0 Apr26 ?        00:00:00 [kthreadd]
root         4     2  0 Apr26 ?        00:00:00 [kworker/0:0H]
root         6     2  0 Apr26 ?        00:00:00 [ksoftirqd/0]
root         7     2  0 Apr26 ?        00:00:00 [migration/0]
root         8     2  0 Apr26 ?        00:00:00 [rcu_bh]
root         9     2  0 Apr26 ?        00:00:00 [rcu_sched]
root        10     2  0 Apr26 ?        00:00:00 [lru-add-drain]
root        11     2  0 Apr26 ?        00:00:00 [watchdog/0]
root        12     2  0 Apr26 ?        00:00:00 [watchdog/1]
```

如果仅ps命令不带参数，其仅列出所在Shell所调度运行的进程（不会列出如何系统的守护进程）  

运行 `ps tree` 命令，列出进程树  
```
systemd─┬─NetworkManager─┬─dhclient
        │                └─2*[{NetworkManager}]
        ├─2*[abrt-watch-log]
        ├─abrtd
        ├─accounts-daemon───2*[{accounts-daemon}]
        ├─at-spi-bus-laun─┬─dbus-daemon
        │                 └─3*[{at-spi-bus-laun}]
        ├─at-spi2-registr───2*[{at-spi2-registr}]
        ├─atd
        ├─auditd─┬─audispd─┬─sedispatch
        │        │         └─{audispd}
        │        └─{auditd}
        ├─boltd───2*[{boltd}]
        ├─chronyd
        ├─colord───2*[{colord}]
        ├─crond
        ├─cupsd
        ├─2*[dbus-daemon]
        ├─dbus-launch
        ├─gdm─┬─X───3*[{X}]
        │     ├─gdm-session-wor─┬─gnome-session-b─┬─gnome-shell─┬─ibus-daemon─┬─ibus-dconf───3*[{ibus-dconf}]
        │     │                 │                 │             │             ├─ibus-engine-sim───2*[{ibus-engine-sim}]
        │     │                 │                 │             │             └─2*[{ibus-daemon}]
        │     │                 │                 │             └─14*[{gnome-shell}]
        │     │                 │                 ├─gsd-a11y-settin───3*[{gsd-a11y-settin}]
        │     │                 │                 ├─gsd-clipboard───2*[{gsd-clipboard}]
        │     │                 │                 ├─gsd-color───3*[{gsd-color}]
        │     │                 │                 ├─gsd-datetime───2*[{gsd-datetime}]
        │     │                 │                 ├─gsd-housekeepin───2*[{gsd-housekeepin}]
        │     │                 │                 ├─gsd-keyboard───3*[{gsd-keyboard}]
        │     │                 │                 ├─gsd-media-keys───3*[{gsd-media-keys}]
        │     │                 │                 ├─gsd-mouse───2*[{gsd-mouse}]
        │     │                 │                 ├─gsd-power───3*[{gsd-power}]
        │     │                 │                 ├─gsd-print-notif───2*[{gsd-print-notif}]
        │     │                 │                 ├─gsd-rfkill───2*[{gsd-rfkill}]
        │     │                 │                 ├─gsd-screensaver───2*[{gsd-screensaver}]
        │     │                 │                 ├─gsd-sharing───3*[{gsd-sharing}]
        │     │                 │                 ├─gsd-smartcard───4*[{gsd-smartcard}]
        │     │                 │                 ├─gsd-sound───3*[{gsd-sound}]
        │     │                 │                 ├─gsd-wacom───2*[{gsd-wacom}]
        │     │                 │                 ├─gsd-xsettings───3*[{gsd-xsettings}]
        │     │                 │                 └─3*[{gnome-session-b}]
        │     │                 └─2*[{gdm-session-wor}]
        │     └─3*[{gdm}]
        ├─ibus-portal───2*[{ibus-portal}]
        ├─ibus-x11───2*[{ibus-x11}]
        ├─irqbalance
        ├─lvmetad
        ├─polkitd───6*[{polkitd}]
        ├─pulseaudio───{pulseaudio}
        ├─python
        ├─rsyslogd───2*[{rsyslogd}]
        ├─rtkit-daemon───2*[{rtkit-daemon}]
        ├─sshd─┬─4*[sshd───bash]
        │      ├─3*[sshd───sftp-server]
        │      └─sshd───bash───pstree
        ├─systemd-journal
        ├─systemd-logind
        ├─systemd-udevd
        ├─tuned───4*[{tuned}]
        ├─udisksd───4*[{udisksd}]
        ├─upowerd───2*[{upowerd}]
        ├─wpa_supplicant
        ├─wrapper─┬─java───14*[{java}]
        │         └─{wrapper}
        └─xdg-permission-───2*[{xdg-permission-}]
```

还有更多与进程有关的命令是需要我们掌握的，包括：

* kill  终止进程，以PID作为标识
* pkill 终止进程，以名称作为标识
* pgrep 查询PID

### 守护进程

什么是守护进程？就是在后台运行的一个程序，主要提供一些系统服务。例如：httpd,nginx 等

守护进程是怎么工作的？它时刻等待事件的发生，当它收到一个请求事件之后，就会为需要处理这个事件创建一个子进程，然后它继续等待后续事件

根据事件的处理方式来看，守护进程分为：

* 独立守护进程
* 临时守护进程

临时守护进程无法直接面对请求事件，只能被 **xinetd** 这个超级守护进程分配任务。

### Systemd

[Systemd](https://www.freedesktop.org/software/systemd/man/systemd.unit.html) 是 Linux 系统中最新的初始化系统（init），它主要的设计目标是克服 sysvinit 固有的缺点，提高系统的启动速度。  

> 学习Systemd，参考阮一峰提供的通俗易懂的教程：[《Systemd 入门教程：实战篇》](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-part-two.html)

根据 Linux 惯例，字母d是守护进程（daemon）的缩写。 Systemd 这个名字的含义，就是它要守护整个系统。

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/systemd-components-websoft9.png)

Systemd 把每一项处理的任务以**单元**形式组织起来，所支持的各种类型的单元包括：  

* Service unit：系统服务
* Target unit：多个 Unit 构成的一个组
* Device Unit：硬件设备
* Mount Unit：文件系统的挂载点
* Automount Unit：自动挂载点
* Path Unit：文件或路径
* Scope Unit：不是由 Systemd 启动的外部进程
* Slice Unit：进程组
* Snapshot Unit：Systemd 快照，可以切回某个快照
* Socket Unit：进程间通信的 socket
* Swap Unit：swap 文件
* Timer Unit：定时器

Target 与 传统 RunLevel 的对应关系如下  

```
Traditional runlevel      New target name     Symbolically linked to...
Runlevel 0           |    runlevel0.target -> poweroff.target
Runlevel 1           |    runlevel1.target -> rescue.target
Runlevel 2           |    runlevel2.target -> multi-user.target
Runlevel 3           |    runlevel3.target -> multi-user.target
Runlevel 4           |    runlevel4.target -> multi-user.target
Runlevel 5           |    runlevel5.target -> graphical.target
Runlevel 6           |    runlevel6.target -> reboot.target
```

有三个目录可以存放目标单元：  

* /etc/systemd/system：系统管理员创建的单元，开机默认启动
* /usr/lib/systemd/system：应用程序安装包所创建的单元，开机不启动
* /run/systemd/system：运行期间创建的单元

下面举例解释 /etc/systemd/system 与 /usr/lib/systemd/system 的区别：

比如：Apache 安装的时候，会自动在/usr/lib/systemd/system 目录添加一个配置文件 httpd.service，如果你希望开机启动httpd，就需要运行如下的命令：

```
sudo systemctl enable httpd

systemctl enable docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.

```

执行命令后，/etc/systemd/system 就多了一个指向  /usr/lib/systemd/system/httpd.service 的软连接。

当然，直接把 httpd.service 文件拷贝到 /etc/systemd/system 也能起到同样的效果。


##### 维护命令

监控和控制 Systemd 主要使用的指令是`systemctl`。主要是从来看系统状态、服务状态，以及管理系统和服务。

```
# 通过ssh连接远程控制其他主机
systemctl -H <username>@<URL>

# 显示系统状态
ystemctl status

# 输出激活的单元列表
systemctl 或 systemctl list-units

# 输出运行失败的单元
systemctl —failed

# 查看所有已安装的服务 
systemctl list-unit-files
```

##### 配置单元

一个单元配置文件可以描述如下内容之一：系统服务（.service）、挂载点（.mount）、sockets（.sockets） 、系统设备（.device）、交换分区（.swap）、文件路径（.path）、启动目标（.target）、由 systemd 管理的计时器（.timer）。

我们通常在用systemctl调用单元的时候一般要单元文件的全名。也就是带上述后缀的那些。
如果不带扩展名的话systemctl会默认成是.service文件，所以为了不发生意外一般还是推荐把名字打全了。
挂载点和设备会自动转化为对应的后缀单元，比如/home就等价于home.mount, /dev/sda等价于dev-sda.device。

systemctl在enable、disable、mask子命令里面增加了--now选项，可以激活同时启动服务，激活同时停止服务等。
```
立刻激活单元：$ systemctl start <unit>
立刻停止单元：$ systemctl stop <unit>
重启单元：$ systemctl restart <unit>
重新加载配置：$ systemctl reload <unit>
输出单元运行的状态：$ systemctl status <unit>
检测单元是否为自动启动：$ systemctl is-enabled <unit>
设置为开机自动激活单元：$ systemctl enable <unit>
设置为开机自动激活单元并现在立刻启动：$ systemctl enable --now <unit>
取消开机自动激活单元：$ systemctl disable <unit>
禁用一个单元：$ systemctl mask <unit>
取消禁用一个单元：$ systemctl unmask <unit>
显示单元的手册页（前提是由unit提供）：$ systemctl help <unit>
重新载入整个systemd的系统配置并扫描unit文件的变动：$ systemctl daemon-reload
```

##### 配置文件

一个服务怎么启动，完全由它的配置文件决定。下面就来看，配置文件有些什么内容。

systemctl cat命令可以用来查看配置文件，下面以sshd.service文件为例，它的作用是启动一个 SSH 服务器，供其他用户以 SSH 方式登录。
```
$ systemctl cat sshd.service

[Unit]
Description=OpenSSH server daemon
Documentation=man:sshd(8) man:sshd_config(5)
After=network.target sshd-keygen.service
Wants=sshd-keygen.service

[Service]
EnvironmentFile=/etc/sysconfig/sshd
ExecStart=/usr/sbin/sshd -D $OPTIONS
ExecReload=/bin/kill -HUP $MAINPID
Type=simple
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```
###### [Unit]区域
###### [Service]区域

Service区块定义如何启动当前服务。

**Type** 字段定义启动类型。它可以设置的值如下。

```
simple（默认值）：ExecStart字段启动的进程为主进程
forking：ExecStart字段将以fork()方式启动，此时父进程将会退出，子进程将成为主进程
oneshot：类似于simple，但只执行一次，Systemd 会等它执行完，才启动其他服务
dbus：类似于simple，但会等待 D-Bus 信号后启动
notify：类似于simple，启动结束后会发出通知信号，然后 Systemd 再启动其他服务
idle：类似于simple，但是要等到其他任务都执行完，才会启动该服务。一种使用场合是为让该服务的输出，不与其他服务的输出相混合
```
**启动命令**字段  

```
ExecStart字段：定义启动进程时执行的命令。
ExecReload字段：重启服务时执行的命令
ExecStop字段：停止服务时执行的命令
ExecStartPre字段：启动服务之前执行的命令
ExecStartPost字段：启动服务之后执行的命令
ExecStopPost字段：停止服务之后执行的命令
```

###### [Install]区域

Install区块，定义如何安装这个配置文件，即怎样做到开机启动。

### 日志

Systemd 统一管理所有 Unit 的启动日志。带来的好处就是，可以只用journalctl一个命令，查看所有日志（内核日志和应用日志）。日志的配置文件是/etc/systemd/journald.conf。

journalctl功能强大，用法非常多。

```
# 查看所有日志（默认情况下 ，只保存本次启动的日志）
$ sudo journalctl

# 查看内核日志（不显示应用日志）
$ sudo journalctl -k

# 查看系统本次启动的日志
$ sudo journalctl -b
$ sudo journalctl -b -0

# 查看上一次启动的日志（需更改设置）
$ sudo journalctl -b -1

# 查看指定时间的日志
$ sudo journalctl --since="2012-10-30 18:17:16"
$ sudo journalctl --since "20 min ago"
$ sudo journalctl --since yesterday
$ sudo journalctl --since "2015-01-10" --until "2015-01-11 03:00"
$ sudo journalctl --since 09:00 --until "1 hour ago"

# 显示尾部的最新10行日志
$ sudo journalctl -n

# 显示尾部指定行数的日志
$ sudo journalctl -n 20

# 实时滚动显示最新日志
$ sudo journalctl -f

# 查看指定服务的日志
$ sudo journalctl /usr/lib/systemd/systemd

# 查看指定进程的日志
$ sudo journalctl _PID=1

# 查看某个路径的脚本的日志
$ sudo journalctl /usr/bin/bash

# 查看指定用户的日志
$ sudo journalctl _UID=33 --since today

# 查看某个 Unit 的日志
$ sudo journalctl -u nginx.service
$ sudo journalctl -u nginx.service --since today

# 实时滚动显示某个 Unit 的最新日志
$ sudo journalctl -u nginx.service -f

# 合并显示多个 Unit 的日志
$ journalctl -u nginx.service -u php-fpm.service --since today

# 查看指定优先级（及其以上级别）的日志，共有8级
# 0: emerg
# 1: alert
# 2: crit
# 3: err
# 4: warning
# 5: notice
# 6: info
# 7: debug
$ sudo journalctl -p err -b

# 日志默认分页输出，--no-pager 改为正常的标准输出
$ sudo journalctl --no-pager

# 以 JSON 格式（单行）输出
$ sudo journalctl -b -u nginx.service -o json

# 以 JSON 格式（多行）输出，可读性更好
$ sudo journalctl -b -u nginx.serviceqq
 -o json-pretty

# 显示日志占据的硬盘空间
$ sudo journalctl --disk-usage

# 指定日志文件占据的最大空间
$ sudo journalctl --vacuum-size=1G

# 指定日志文件保存多久
$ sudo journalctl --vacuum-time=1years
```

### 命令与 Shell 编程

#### 命令

Linux命令是对Linux系统进行管理的命令。对于Linux系统来说，无论是CPU、内存、磁盘驱动器、键盘、鼠标，还是用户等都是文件，Linux系统管理的命令是它正常运行的核心，与之前的DOS命令类似。

更多命令参考：[《Linux命令大全》](https://man.linuxde.net/)


Shell 是一个用 C 语言编写的程序，它是用户使用 Linux 的桥梁。Shell 既是一种命令语言，又是一种程序设计语言。

通俗的说：用户向Linux发送Shell命令（或多个命令组成的程序体）来控制Linux，故 Shell 也是一种应用程序，这个应用程序提供了一个界面，用户通过这个界面访问操作系统内核的服务。

#### 解释器

Shell 编程跟 JavaScript、php 编程一样，只要有一个能编写代码的文本编辑器和一个能解释执行的脚本解释器就可以了。

Linux 的 Shell 种类众多，常见的有：

* Bourne Shell（/usr/bin/sh或/bin/sh）
* Bourne Again Shell（/bin/bash）
* Debian Almquist Shell(dash)
* C Shell（/usr/bin/csh）
* K Shell（/usr/bin/ksh）
* Shell for Root（/sbin/sh）

其中，bash和dash是目前广泛使用的解释器。

#### 语法

Shell有着面向过程的程序设计常见的语法体系，包括：

* 变量
* 函数
* 流程控制
* 输入输出
* 数组
* 运算符

Shell语法并不复杂，边学边用就能掌握。

#### 运行脚本

Shell脚本可以保存为 .sh 文件后运行，也可以直接在Linux交互式命令中运行

加入我们编写了一段Shell程序，内容如下
```
if [ $(ps -ef | grep -c "ssh") -gt 1 ]; then echo "true"; fi
```
将上面的代码保存为 test.sh，并 cd 到相应目录，然后选择如下的一种执行命令的方式：

```
#方式一：./ 执行脚本
chmod +x ./test.sh  #使脚本具有执行权限
./test.sh  #执行脚本

#方式二：直接用解释器执行脚本
/bin/sh test.sh

#方式三：直接用解释器执行脚本
bash test.sh

#方式四：直接在交互式命令上中运行一段Shell程序
if [ $(ps -ef | grep -c "ssh") -gt 1 ]; then echo "true"; fi

```


## 常见问题

#### Linux 有哪些专业认证体系？

Linux认证指获得专业Linux培训后通过考试得到的资格。国际上广泛承认的Linux认证有LinuxProfessionalInstitute（简称为LPI）、SairLinux和GNU、Linux+和RedHatCertifiedEngineer。

以RedHat为例，主要的认证等级包括：

| 认证考试 | 认证培训课程编号               | 认证培训课程名称   |
| -------- | ------------------------------ | ------------------ |
| RHCSA    | RH124,RH135                    | 红帽认证系统管理员 |
| RHCE     | RH254                          | 红帽认证工程师     |
| RHCA     | RH401,RH436,RH423,RH442,RHS333 | 红帽认证架构师     |


#### 字符编码的原理？

Ubuntu参考：https://help.ubuntu.com/community/Locale


#### 如何查询当前服务器的连接数？
```
ps aux | grep httpd | wc -l
```

#### Linux 系统有哪些时间？

```
$ timedatectl status
Local time: Tue 2021-11-23 10:08:06 CST
Universal time: Tue 2021-11-23 02:08:06 UTC
RTC time: Tue 2021-11-23 10:08:04
    Time zone: Asia/Shanghai (CST, +0800)
    NTP enabled: yes
    NTP synchronized: yes
    RTC in local TZ: yes
    DST active: n/a
```

* Local time: 你自己手表上的时间
* Universal time：世界统一时间
* Real Time Clock：RTC, CMOS or BIOS clock
* System clock：系统时间，开机的时候读取 RTC 时间

NTP 是指网络时间服务，用于校对时间。 

#### Linux 有哪些发行版？

Linux 内核最初只是由芬兰人林纳斯·托瓦兹（Linus Torvalds）在赫尔辛基大学上学时出于个人爱好而编写的。后面Linux发展成为一个强大的生态体系，慢慢的就有一些专业公司基于内核再组合了一些应用软件，形成了多种分支，也就是发行版。

目前市面上较知名的发行版有：Ubuntu、RedHat、CentOS、Debian、Fedora、SuSE、OpenSUSE、Arch Linux、SolusOS 等。

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-distro-websoft9.png)

这些版本并非完全独立，它们之前有着共同的家族关系：

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/linux/linux-family-websoft9.jpg)

虽然版本繁多，实际上最流行的是：CentOS和Ubuntu这个两个发行版。

* Redhat, Fedora, CentOS 由 Redhat 驱动
* Debian 是完全社区驱动，Ubuntu 是公司驱动，商业上没有关联关系


#### Linux 系统有哪些特殊字符？

```
#   ;   ;;      .      ,       /       \       'string'|       
!   $   ${}   $?      $$   $*  "string"*     **   ?   :   
^   $#   $@    `command`{}  []   [[]]   ()    (())  ||   
&&       {xx,yy,zz,...}~   ~+   ~-    &   \<...\>   +   
-        %=   ==   != 
```

#### Linux 安装流程？

如果你没有使用云服务器或虚拟机，就需要安装Linux。下面只大体介绍Linux系统的安装流程：

* 下载Linux系统（一般是ISO文件）
* 制作启动盘
* 开机进入图形化的交互式安装界面
* 安装完成

#### .repo 文件是什么？

以 Docker 为例：/etc/yum.repos.d/docker-ce.repo，其内容如下

```
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://download.docker.com/linux/centos/7/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg
```

所以，我们可以把 /etc/yum.repos.d 下所有的文件合并成一个文件

#### yum install 如何排除某个仓库？

运行如下的命令，参数 --disablerepo 的值是 repo 文件中仓库单元的名称，不是 repo 文件的名称。

```
yum install docker --disablerep="docker-ce-stable"
```

#### yum 安装时 priority=* 的逻辑？

优先级设置是双刃剑：

* priority=10 优先级低于 priority=9，即数字越小优先级高
* 依赖会从优先级较高的仓库中寻找：如果找到的版本不匹配，系统就会报错；如果找不到所需的软件，系统会从优先级较低的仓库中继续寻找
* 优先级设置会导致依赖的安装难以匹配最佳

#### rpm -ivh 和 yum install 有什么区别？

rpm 安装只针对单个rpm文件安装，不会安装相关的依赖；yum install 安装会安装rpm包以及所需的依赖

#### .noarch.rpm 和 .x64_64.rpm 区别？

.noarch 是通用的rpm包，其中没有二进制文件和库文件，就是说与服务器硬件和操作系统版没有太大的关系，通常用于安装一个脚本或仓库地址  
.x64_64 是包含二进制等文件的安装包，与服务器CPU类型有关，通常用于安装某个软件  

#### 一个软件包在多个仓库中出现，优先级？

Linux 发行版比较多，同时还有很多个人或组织维护了某些特定用途的安装/升级源。Yum Priorities 插件可以用来强制保护源。它通过给各个源设定不同的优先级，使得系统管理员可以将某些源（比如 Linux 发行版的官方源）设定为最高优先级，从而保证系统的稳定性（同时也可能无法更新到其它源上提供的软件最新版本）。

1. 安装优先级插件
    ```
    rpm -q yum-priorities
    ```
2. 编辑 /etc/yum.repos.d/目录下的*.repo 文件来设置优先级
    ```
    [base]
    name=CentOS-$releasever – Base
    baseurl=http://mirror.centos.org/centos/$releasever/os/$basearch/
    gpgcheck=0
    priority=1
    ```

#### 本地的仓库数据库中是是否包含源地址？

是的

#### 如何查看软件所需的依赖？

以RabbitMQ为例，命令以及结果如下：
```
[root@iZ8vb7it5p19lxxol367u0Z rpm]# yum deplist rabbitmq-server
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
package: rabbitmq-server.noarch 3.8.3-1.el7
  dependency: /bin/sh
   provider: bash.x86_64 4.2.46-33.el7
  dependency: /usr/bin/env
   provider: coreutils.x86_64 8.22-24.el7
  dependency: config(rabbitmq-server) = 3.8.3-1.el7
   provider: rabbitmq-server.noarch 3.8.3-1.el7
  dependency: erlang >= 21.3
   provider: erlang.x86_64 22.3.2-1.el7
  dependency: logrotate
   provider: logrotate.x86_64 3.8.6-17.el7
  dependency: socat
   provider: socat.x86_64 1.7.3.2-2.el7
  dependency: systemd
   provider: systemd.x86_64 219-67.el7_7.4
```

> yum deplist 命令与被查询的软件包是否安装没有关系，即没有被安装的软件包也可以查询其依赖


#### yum list 结果是本地换成吗？

不是

#### 如何解压 rpm 包？

使用 `rpmextract` 这个工具

#### 什么是 SCL 源？

SoftwareCollections.org 是为 Red Hat Enterprise Linux，Fedora，CentOS 和 Scientific Linux 创建软件集合（SCL）的项目的所在地。您可以在此处创建和托管软件集合，以及与管理 SCL 的开发者建立联系。SCL 是在保证不与原有软件冲突的情况下运行的，也就意味着用户默认 Bash 是无法调用 ，如果想开机自动调用 SCL， 需要设置好环境变量。

#### 什么是 IUS 源？

IUS is a community project that provides RPM packages for newer versions of select software for Enterprise Linux distributions.IUS只为RHEL和CentOS这两个发行版提供较新版本的rpm包。如果在os或epel找不到某个软件的新版rpm，软件官方又只提供源代码包的时候，可以来ius源中找，几乎都能找到。

#### buildlogs.centos.org 是什么？

This server contains a mix of raw/unsigned packages and/or build logs
It should be used mainly for testing purposes

#### Linux 与云计算有什么关系？

在当前的云计算领域，毫无疑问Linux系统是最重要的基石。  

掌握了Linux就等于拿到了云计算领域的入场券。

#### Systemd 服务名中的 @ 是什么？

例如：name@.service。 “@”提示符是Systemd的一个高级功能，@可以被实际的参数替换。举一个例子可以更好的说明其作用：

通过 Docker 部署了MySQL和Nginx，假如我们需要为这两个应用增加service文件，正常的处理方式是写两个服务单元，但如果我们学会使用@的话，一个单元就可以搞定

```
#/etc/systemd/system/containers@.service

[Unit]
Description=Service %I in container
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a %i
ExecStop=/usr/bin/docker stop %i
TimeoutStopSec=1m

[Install]
WantedBy=default.target
```

相比其他的.service文件，这个文件赫然有很多“%i” 参数。

下面两条命令就是使用此服务单元以及设置开机启动：

```
systemctl start container@mysql.service
systemctl enable contaner@mysql.service
```

可以，其类似于程序设计里面的类与对象的关系

#### 磁盘满了如何查询哪些文件比较大？

```
# 查看当前目录下各文件、文件夹的大小
du -h –max-depth=1 *

# 查询当前目录总大小
du -sh

# 显示直接子目录文件及文件夹大小统计值
du -h –max-depth=0 *
```

#### 如何查询 Linux 服务器日志？

运行命令`tailf /var/log/messages`

#### 服务启动失败怎么办？

当linux服务启动失败的时候，系统会提示我们使用 `journalctl -xe` 命令来查询详细信息，定位服务不能启动的原因。

#### SSH 密钥登录与密码登录有何区别？

SSH 密钥是一种远程登录 Linux 服务器的方式，其原理是利用密钥生成器制作一对密钥（公钥和私钥）。将公钥添加到服务器，然后在客户端利用私钥即可完成认证并登录，这种方式更加注重数据的安全性，同时区别于传统密码登录方式的手动输入，又具有更高的便捷性。
目前 Linux 实例有密码和 SSH 密钥两种登录方式，Windows 实例目前只有密码登录一种方式。

#### 磁盘、镜像和快照有什么区别？

此处不对快照和镜像进行抽像概念描述，只列出如下几个关键信息点：

* 基于磁盘可以创建一个快照。

  快照是对磁盘进行“拍照”，顾名思义就是备份某个时间点磁盘的数据，是一种备份手段

* 基于快照可以创建一个镜像，而镜像无法直接转换成快照。

* 基于镜像可以直接创建一个虚拟机，基于虚拟机也可以直接创建一个镜像

总结：（磁盘-->快照） --> （镜像<-->虚拟机）

#### useradd 和 adduser 区别？

adduser 用于创建 Linux 系统账号，创建过程中会提示：用户名/密码，同时会创建用户家目录  
useradd 仅创建无法登陆 Linux 系统的应用账号  

