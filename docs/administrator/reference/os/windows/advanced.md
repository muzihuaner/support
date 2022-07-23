---
sidebar_position: 2
slug: /windows/advanced
---

# 进阶

## 核心原理

### 容器

Windows 系统可以同时支持 Linux 容器 和 Windows 容器两种方案。  

[Windows 容器](https://docs.microsoft.com/zh-cn/virtualization/windowscontainers/)是微软的专项，镜像非常少。它的用途是处理微软开发生态下的编译构建问题。  

Windows 上的 Dockerfile 语法与 Linux 有一定的区别，所幸微软官方针对这些差异提供了较为详细的[文档](https://docs.microsoft.com/en-us/virtualization/windowscontainers/manage-docker/manage-windows-dockerfile)说明。


### 沙箱 SandBox 

SandBox 是 Windows 下的一种虚拟化技术。但它的用法诸多限制：

- 停止即销毁
- 一台 Windows 主机只能创建一个 SandBox

### Windows Admin Center

Windows Admin Center 是适用于在任何地方（物理环境、虚拟环境、本地环境、Azure 或托管环境）运行的 Windows Server 的远程管理工具。

### MSBuild

[MSBuild](https://docs.microsoft.com/zh-cn/visualstudio/msbuild/msbuild) 又名 Microsoft 编译引擎，是一个用于编译应用程序的平台。 Visual Studio 会使用 MSBuild，但 MSBuild 不依赖于 Visual Studio。 通过在项目或解决方案文件中调用 msbuild.exe，可以在未安装 Visual Studio 的环境中安排和编译产品。  

> MSBuild 在 Windows 系统中的地位等同于 Linux 系统中的 CMake。  

Visual Studio 使用 MSBuild 来加载和编译托管项目。 Visual Studio 中的项目文件（.csproj、.vbproj、vcxproj 等）包含 MSBuild XML 代码，当你使用 IDE 来编译项目时，此代码就会运行。 Visual Studio 项目会导入所有必要的设置和编译过程来执行典型的开发工作，但你可以从 Visual Studio 内或通过使用 XML 编辑器对其进行扩展或修改。

```
MSBuild.exe MyProj.proj -property:Configuration=Debug
```

在 Visual Studio 中编译项目与通过 MSBuild 可执行文件直接调用 MSBuild 或使用 MSBuild 对象模型启动编译之间，有一些显著的区别。

### Visual Studio

[Visual Studio](https://docs.microsoft.com/zh-cn/visualstudio/get-started/visual-studio-ide) 主要提供三种版本：

* 社区版
* 企业版
* 专业版

#### 安装

它的安装方式采用的是：通过**安装管理器**进行个性化安装的模式。  

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/windows/vs-installergui-websoft9.png)

下面简要的对它的安装本质进行说明：  

1. 下载**安装管理器**

2. 选择一种安装方式：图形化方式安装 或 [命令行安装](https://docs.microsoft.com/zh-cn/visualstudio/install/use-command-line-parameters-to-install-visual-studio?view=vs-2019) 或 [命令行+响应文件安装](https://docs.microsoft.com/zh-cn/visualstudio/install/automated-installation-with-response-file?view=vs-2019)
   
   - 图形化安装：双击安装管理器，再根据安装向导安装

   - 命令行安装：进入 PowerShell 或 Shell 窗口，运行下面的安装命令即可

    ```
    # Powershell 命令
    .\vs_Community.exe --installPath C:\minVS --add Microsoft.VisualStudio.Workload.CoreEditor --quiet --norestart

    # Shell 命令
    start /w vs_Community.exe --installPath C:\minVS --add Microsoft.VisualStudio.Workload.CoreEditor --quiet --norestart

    # Shell 命令 + Jason 响应文件
    vs_Community.exe --in customInstall.json
    ```

3. 完成 VS IDE 安装后，并不代表安装了各种不同开发语言所需的组件。因此，VS 在打开项目工程的时候，会检查工程的类型，推荐开发者安装工程所需的引用环境。

如果想下载 VS 的安装包，也需要通过 **安装管理器** 去实现。

如果多个版本，请参考官方的[并排安装方案](https://docs.microsoft.com/zh-cn/visualstudio/install/install-visual-studio-versions-side-by-side)


#### 开发

VS 开发上主要就是设计对象、编辑和检查代码，以及提供一些插件与外部应用相连。  

有几个重要的概念在此列出：

* 在 Visual Studio 中创建应用或网站时，最小单位是**项目**，它包含所有编译为可执行文件、库或网站的文件，项目还包含编译器设置以及程序将与之通信的各种服务或组件需要的其他配置文件。
* 比项目更为宏观的是**解决方案**， 解决方案只是一个“容器”，用于包含一个或多个相关项目，以及生成信息、Visual Studio 窗口设置和不与特定项目关联的任何杂项文件。
* 解决方案中的项目之间不需要有耦合关系

#### 编译

编译是将开发者的代码转变成可允许的软件的过程。通俗的说，编译就是将代码变成软件。  

编译常被称之为：构建、生成的词语。  

编译的过程主要有：

1. 项目代码完整性（自编写代码完整化 + 第三方代码本地化）
2. 编译环境准备
3. 工程中的编译配置文件准备（告诉编译环境你的编译目标）
3. 编译过程（加工）

Visual Studio IDE 自带 C# 和 C++ 等语言的编译环境，故它可以直接编译。它也支持集成：MSBuild, Cmake, DevOps 流水线等第三方编译工具。  

> 从分工的角度，编译环境需从 IDE 中解耦，这样更有利于自动化。

#### 部署

Visual Studio IDE 为了满足开发者一站式的体验，也集成了部署工具。但从分工的角度，部署需从 IDE 中解耦，这样更有利于自动化。  

所以，此处我们不再细说。  


## 常见问题{#faq}

#### Windows 容器是图形化的吗？

Windows 容器并不支持以 RDP 模式的图形化远程桌面操作，Windows 容器是为持续集成而生。  

#### VS 是否可以被安装到容器？

虽然微软官方没有提供 VS 如何在容器中的部署，但经过试验，证明 VS 也可以被安装到容器。  

VS 中如何在容器中使用，请参考[官方文档](https://docs.microsoft.com/zh-cn/visualstudio/install/build-tools-container?view=vs-2019) 或我们的开源项目 [docker-visualstudio](https://github.com/Websoft9/docker-visualstudio)
