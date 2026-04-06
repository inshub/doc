# Mac使用Colima运行Docker


### Colima介绍

Colima是一个免费的开源容器运行时，它使用QEMU在虚拟机中运行Docker容器。
它是由Lima Project创建的，Lima项目是一群致力于创建工具以方便在 macOS上运行容器化应用程序的开发人员。


Colima由以下组件组成：

Colima ：主要的Colima组件负责启动和管理QEMU虚拟机。

Lima：Lima是一个允许您从命令行管理 QEMU 虚拟机的工具。

Docker：Colima使用Docker来运行容器化应用程序。

Kubernetes：Colima 支持Kubernetes，因此可以使用它来运行由Kubernetes管理的容器化应用程序。


### 安装

```
# Homebrew
brew install colima


# Install Docker
brew install docker

```

### 常用命令

```
# 启动/停止colima服务
colima start
colima stop

# 启动时指定参数
create VM with 1CPU, 2GiB memory and 10GiB storage.
colima start --cpu 1 --memory 2 --disk 10


# 查看容器
docker ps


# starts and setup Kubernetes
brew install kubectl
colima start --kubernetes




```



