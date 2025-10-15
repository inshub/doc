# KubeKey 部署 K8s(v1.33.4)集群

### 环境信息
ip  主机名 系统版本
192.168.1.100 k8s-test-master centos8/rhel8
192.168.1.101 k8s-test-node1  centos8/rhel8
192.168.1.102 k8s-test-node2  centos8/rhel8


### 基础配置

1.1 配置主机名
```
hostnamectl set-hostname k8s-test-master
```

1.2 时间同步
```
# 修改同步时钟
sed -i 's/^pool pool.*/pool cn.pool.ntp.org iburst/g' /etc/chrony.conf

# 重启并设置 chrony 服务开机自启动
systemctl enable chronyd --now


# 执行查看命令
chronyc sourcestats -v

```

1.3 禁用 swap
```
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

v1.8 - v1.21：必须禁用 Swap（默认强制）。
v1.22+：可选支持（Alpha/Beta），但需手动启用。
Kubernetes v1.33 仍推荐禁用 Swap 以确保稳定性，完整支持仍在开发中。
```

1.4 禁用 SELinux
```
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

1.5 安装依赖
```
# 安装 Kubernetes 系统依赖包
yum install curl socat conntrack ebtables ipset ipvsadm
```


1.6 创建数据目录软连接

```
mkdir /data/containerd /data/etcd

ln -s /data/containerd /var/lib/containerd
ln -s /data/etcd /var/lib/etcd
```

### 安装部署 K8s

2.1 下载 KubeKey
```
在192.168.1.100
cd /data/apps/kubekey
wget https://github.com/kubesphere/kubekey/releases/download/v3.1.11/kubekey-v3.1.11-linux-amd64.tar.gz


查看 KubeKey 支持的 Kubernetes 版本列表
./kk version --show-supported-k8s
```


2.2 创建 K8s 集群部署配置文件

```
 ./kk create config -f k8s-v1334.yaml --with-kubernetes v1.33.4


192.168.1.100 k8s-test-master centos8/rhel8
192.168.1.101 k8s-test-node1  centos8/rhel8
192.168.1.102 k8s-test-node2  centos8/rhel8

spec:
  hosts:
  - {name: k8s-test-master, address: 192.168.1.100, internalAddress: 192.168.1.100, user: root, password: "test"}
  - {name: k8s-test-node1, address: 192.168.1.101, internalAddress: 192.168.1.101, user: root, password: "test"}
  - {name: k8s-test-node2, address: 192.168.1.102, internalAddress: 192.168.1.102, user: root, password: "test"}
roleGroups:
  etcd:
  - k8s-test-master
  - k8s-test-node1
  - k8s-test-node2
```

2.3  部署 K8s
```
export KKZONE=cn
./kk create cluster -f k8s-v1334.yaml



...

查看下面提示，查看是否安装成功

Please check the result using the command:

        kubectl get pod -A
```


2.4 kubectl命令验证集群
```
kubectl get cs

kubectl get nodes -o wide


kubectl get pods -o wide -A


crictl images ls

```


### 部署服务验证

创建Nginx部署并验证
```
kubectl create deployment nginx --image=docker.1ms.run/nginx:alpine --replicas=2

kubectl create service nodeport nginx --tcp=80:80

kubectl get deployment -o wide
kubectl get pods -o wide

#pod ip
curl 10.233.127.5

#svc ip
curl  10.233.10.138

#node+port ip
curl 192.168.1.100:31440

```

### 问题汇总

问题描述：
安装k8s v1.32/33.x版本，提示内核版本不支持，kubekey安装一直不成功。
    [WARNING SystemVerification]: cgroups v1 support is in maintenance mode, please migrate to cgroups v2
error execution phase preflight: [preflight] Some fatal errors occurred:
    [ERROR SystemVerification]: kernel release 4.18.0-553.el8_10.x86_64 is unsupported. Recommended LTS version from the 4.x series is 4.19.
    Any 5.x or 6.x versions are also supported. For cgroups v2 support, the minimal version is 4.15 and the recommended version is 5.8+
[preflight] If you know what you are doing, you can make a check non-fatal with `--ignore-preflight-errors=...`
To see the stack trace of this error execute with --v=5 or higher: Process exited with status 1

问题解决：
升级内核版本到5.8+，内核升级参照centos8/rhel8


### 参考地址
https://github.com/kubesphere/kubekey/blob/feature-gitops/README_zh-CN.md
https://kubesphere.io/zh/blogs/using-kubekey-deploy-k8s-v1.28.8/