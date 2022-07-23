---
slug: /java/advanced
---

# 进阶

## 安装

### 安装 JDK

使用 Ansible 可以很方便安装由 多版本 JDK 安装：  

```
git clone https://github.com/websoft9/role_jdk
ansible-playbook role_jdk/tests/test.yml
```

### 安装 Tomcat

使用 Ansible 可以很方便安装由 多版本 Tomcat 安装：  

```
git clone https://github.com/websoft9/role_tomcat
ansible-playbook role_tomcat/tests/test.yml
```

### 安装 Jetty

### 升级

### 扩展

## 概念与原理

### Java Web

![](https://libs.websoft9.com/Websoft9/DocsPicture/zh/java/java-jvmweb-websoft9.png)

### Maven

Maven 是一个项目管理工具，可以对 Java 项目进行构建、依赖管理。

### Tomcat

Tomcat 是一个应用服务器中间件系统，用于运行基于 Java 的 Web 应用程序。

### Jetty 

Tomcat 是一个应用服务器中间件系统，用于运行基于 Java 的 Web 应用程序。

## 问题解答

#### JDK 与 JRE 有什么区别？

JRE 是 JAVA 程序运行时，JDK 是 Java 开发者套件。JDK 包含了 JRE。

#### 如何找到 Java 资源？

参考：[Awesome Java](https://github.com/akullpp/awesome-java)
