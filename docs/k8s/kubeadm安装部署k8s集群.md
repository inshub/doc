# kubeadm安装部署k8s集群

### 环境准备
```
2c16G200G
192.168.1.100 k8s-test-master
1c2G100G
192.168.1.101 k8s-test-node
```
**修改hostname**
```
hostnamectl set-hostname k8s-test-master
```

**修改hosts**
```
192.168.1.100 k8s-test-master
192.168.1.101 k8s-test-node
```
**同步时间**
```
10 5 * * * ntpdate cn.ntp.org.cn;hwclock -w
```

**关闭swap**
```
swapoff -a  # 临时
sed -ri 's/.swap./#&/' /etc/fstab   # 永久
```

**关闭selinux**
```
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

### 安装容器
K8s通过CRI支持多个容器运行时，包括Docker、containerd、CRI-O、qemu等
之所以K8s要宣称放弃Docker（在K8s v1.20）而选择container作为默认容器运行时，

是因为Docker并不只是一个容器软件，而是一个完整的技术堆栈，它包含了许多除了容器软件基础功能以外的东西，这些东西不是K8s所需要的，
而且增加K8s调度容器的性能开销。 由于Docker本身并不支持CRI（在提出CRI的时候），

所以K8s代码库（自v1.5.0起）中实现了一个叫做docker-shim的CRI兼容层来作为中间垫片连接了Docker与K8s。
K8s官方表示，一直以来，维护docker-shim都是一件非常费力不讨好的事情，它使K8s的维护变得复杂，

所以当CRI稳定之后，K8s立即在代码库中添加了docker-shim即将废弃的提示（v1.20），
如果使用Docker作为运行时，在kubelet启动时打印一个警告日志。最终在K8s v1.24中删除了docker-shim相关的代码。

### 安装Containerd
kubernetes 1.24.x及以后版本默认CRI为containerd。安装containerd时自带的命令行工具是ctr，我们可以使用ctr 来直接管理containerd中的镜像或容器资源（包括由K8s间接管理的）。

而K8s提供的基于CRI的命令行工具则是crictl，会在下一节中安装K8s基础组件时自动安装。例如你可以通过 crictl ps 查看K8s在当前节点调度的容器列表，使用crictl -h查看使用帮助。

在所有机器上运行以下命令
```
# - 安装依赖
yum install -y yum-utils device-mapper-persistent-data lvm2
# - 设置源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install containerd -y

containerd  --version

自动生成配置文件
containerd config default > /etc/containerd/config.toml

# 创建或修改配置，参考下面的文字说明
# vi /etc/containerd/config.toml

systemctl enable containerd # 开机启动

systemctl daemon-reload
systemctl restart containerd
systemctl status containerd

```

crictl 默认是docker.sock 我们需要修改配置文件对接containerd
```
cat /etc/crictl.yaml
runtime-endpoint: "unix:///run/containerd/containerd.sock"
image-endpoint: "unix:///run/containerd/containerd.sock"
timeout: 10
debug: false
```
### 安装kubeadm、kubelet 和 kubectl
```
# 设置阿里云为源
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 列出其支持的所有可安装版本
yum list kubelet --showduplicates | sort -r


# centos 安装各组件
yum install -y wget lsof net-tools jq

yum install -y kubelet kubeadm kubectl
```

### 初始化集群

```
# 提前拉取需要的image
kubeadm config images pull --image-repository registry.aliyuncs.com/google_containers

kubeadm init \
  --apiserver-advertise-address=192.168.1.100 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.28.2 \
  --service-cidr=192.168.0.0/12 \
  --pod-network-cidr=192.200.0.0/16 \
  --token-ttl=0 \
  --ignore-preflight-errors=all

--apiserver-advertise-address 集群通告地址
--image-repository 由于默认拉取镜像地址k8s.gcr.io国内无法访问
--kubernetes-version K8s版本，与上面安装的一致
--service-cidr 集群内部虚拟网络，Pod统一访问入口
--pod-network-cidr Pod网络，与下面部署的CNI网络组件yaml中保持一致
初始化之后，会输出一个join命令，先复制出来，node节点加入master会使用。
```

master初始化过程中日志
```
[init] Using Kubernetes version: v1.28.2
[preflight] Running pre-flight checks
    [WARNING Hostname]: hostname "k8s-test-master" could not be reached
    [WARNING Hostname]: hostname "k8s-test-master": lookup k8s-test-master on 192.169.2.1:53: no such host
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [k8s-test-master kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [192.160.0.1 192.168.1.100]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [k8s-test-master localhost] and IPs [192.168.1.100 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [k8s-test-master localhost] and IPs [192.168.1.100 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 9.003321 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node k8s-test-master as control-plane by adding the labels: [node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node k8s-test-master as control-plane by adding the taints [node-role.kubernetes.io/control-plane:NoSchedule]
[bootstrap-token] Using token: xkamuq.ytkcdn1l84eci12k
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.1.100:6443 --token xkamuq.ytkcdn1l84eci12k \
    --discovery-token-ca-cert-hash sha256:e97e25a3ef37eb2f13115cf6ff65112951b734c45c540e2c85a844ad4ffa81eb
```

**增加node节点**
```
kubeadm join 192.168.1.100:6443 --token xkamuq.ytkcdn1l84eci12k \
    --discovery-token-ca-cert-hash sha256:e97e25a3ef37eb2f13115cf6ff65112951b734c45c540e2c85a844ad4ffa81eb

```
增加node节点日志
```
[preflight] Running pre-flight checks
    [WARNING Hostname]: hostname "k8s-test-node" could not be reached
    [WARNING Hostname]: hostname "k8s-test-node": lookup k8s-test-node on 192.189.2.1:53: no such host
    [WARNING Service-Kubelet]: kubelet service is not enabled, please run 'systemctl enable kubelet.service'
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

**token查看**
```
1. 查看token
kubeadm token list
2. 查看cert-hash
openssl x509 -in /etc/kubernetes/pki/ca.crt -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256

token默认有效期24h,cert-hash一般不会改变
kubeadm token create --print-join-command
```

**查看集群状态**
```
kubectl cluster-info
kubectl get nodes
```

### 安装网络插件
由于还未安装pod网络插件，所以是NotReady

**安装calico插件**
```
mkdir -p ~/k8s/calico && cd ~/k8s/calico
# 注意calico版本需要匹配k8s版本，否则无法应用
wget --no-check-certificate  https://raw.gitmirror.com/projectcalico/calico/v3.26.1/manifests/calico.yaml

# 修改calico.yaml，在 CALICO_IPV4POOL_CIDR 的位置，修改value为pod网段：192.200.0.0/16  (与前面的--pod-network-cidr参数一致)
# 应用配置文件
# - 这将自动在Kubernetes集群中创建所有必需的资源，包括DaemonSet、Deployment和Service等
kubectl apply -f calico.yaml
```

**calicoctl工具安装**
```
curl -o /usr/local/bin/calicoctl -O -L  "https://hub.gitmirror.com/https://github.com/projectcalico/calico/releases/download/v3.26.4/calicoctl-linux-amd64"
chmod +x /usr/local/bin/calicoctl

calicoctl 常用命令
calicoctl node status
calicoctl get nodes
```

**安装flannel插件**

calico或者flannel安装一个插件就行。测试环境验证一下flannel插件安装
```
wget --no-check-certificate https://hub.gitmirror.com/https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# 修改Pod网段：搜索文件内：net-conf.json
#  net-conf.json: |
#    {
#      "Network": "10.244.0.0/16",  => 192.200.0.0/16
#      "Backend": {
#        "Type": "vxlan"
#      }
#    }
kubectl apply -f kube-flannel.yml


cat kube-flannel.yml|grep image:
        image: docker.io/flannel/flannel:v0.23.0
        image: docker.io/flannel/flannel-cni-plugin:v1.2.0
        image: docker.io/flannel/flannel:v0.23.0

images=$(grep 'image:' kube-flannel.yml | awk '{print $2}')
for image in $images; do
    ctr image pull $image
done

```
⚠️注意
> 如果替换网络差距，记得重启coredns组件，有可能遇到导致pod解析失败。
  所以网络插件选项在集群安装时就确认，确认后不要在变更。

### 其他节点配置kubelet
在实际环境中，我们通常不需要在node节点上操作kubectl命令
```
scp /etc/kubernetes/admin.conf root@k8s-node1:/etc/kubernetes/
echo 'export KUBECONFIG=/etc/kubernetes/admin.conf' >> /etc/profile
source /etc/profile
kubectl get nodes
```

### 卸载集群
如果想要彻底删除集群，在所有节点执行
```
#重置集群  -f 强制执行
kubeadm reset -f
```

删除node节点日志
```
[preflight] Running pre-flight checks
[removeetcdmember.go:106] [reset] No kubeadm config, using etcd pod spec to get data directory
[reset] Deleted contents of the etcd data directory: /var/lib/etcd
[reset] Stopping the kubelet service
[reset] Unmounting mounted directories in "/var/lib/kubelet"
[reset] Deleting contents of directories: [/etc/kubernetes/manifests /var/lib/kubelet /etc/kubernetes/pki]
[reset] Deleting files: [/etc/kubernetes/admin.conf /etc/kubernetes/kubelet.conf /etc/kubernetes/bootstrap-kubelet.conf /etc/kubernetes/controller-manager.conf /etc/kubernetes/scheduler.conf]

The reset process does not clean CNI configuration. To do so, you must remove /etc/cni/net.d

The reset process does not reset or clean up iptables rules or IPVS tables.
If you wish to reset iptables, you must do so manually by using the "iptables" command.

If your cluster was setup to utilize IPVS, run ipvsadm --clear (or similar)
to reset your system's IPVS tables.

The reset process does not clean your kubeconfig files and you must remove them manually.
Please, check the contents of the $HOME/.kube/config file.
```
reset过程不会清理CNI配置，也不会清理iptables/IPVS规则，两者需要手工处理
- `rm -rf net.d`
- `iptables -F /ipvsadm --clear`

```
rm -rf /var/lib/kubelet # 删除核心组件目录
rm -rf /etc/kubernetes # 删除集群配置
rm -rf /etc/cni/net.d/ # 删除容器网络配置
rm -rf /var/log/pods && rm -rf /var/log/containers # 删除pod和容器日志
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X # 删除 iptables 规则
```

在控制节点执行类似操作日志
```
[reset] Reading configuration from the cluster...
[reset] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[preflight] Running pre-flight checks
[reset] Deleted contents of the etcd data directory: /var/lib/etcd
[reset] Stopping the kubelet service
[reset] Unmounting mounted directories in "/var/lib/kubelet"
[reset] Deleting contents of directories: [/etc/kubernetes/manifests /var/lib/kubelet /etc/kubernetes/pki]
[reset] Deleting files: [/etc/kubernetes/admin.conf /etc/kubernetes/kubelet.conf /etc/kubernetes/bootstrap-kubelet.conf /etc/kubernetes/controller-manager.conf /etc/kubernetes/scheduler.conf]

The reset process does not clean CNI configuration. To do so, you must remove /etc/cni/net.d

The reset process does not reset or clean up iptables rules or IPVS tables.
If you wish to reset iptables, you must do so manually by using the "iptables" command.

If your cluster was setup to utilize IPVS, run ipvsadm --clear (or similar)
to reset your system's IPVS tables.

The reset process does not clean your kubeconfig files and you must remove them manually.
Please, check the contents of the $HOME/.kube/config file.
```

### 集群验证
```
# 创建pod
kubectl create deployment nginx --image=nginx

docker.io/library/nginx:latest

#  添加nginx service，设置映射端口。 3000:80  3000宿主上端口，80服务端口。
# 如果是临时测试：kubectl port-forward deployments/nginx --address 0.0.0.0 3000:80
kubectl expose deployment nginx --port=80 --type=NodePort
```

### 问题汇总
**calico镜像拉取问题**

问题描述：
镜像下载慢会导致节点一直停留在NotReady状态。
k8s默认使用`crictl pull image_name`命令拉取镜像，但crictl读取不到containerd设置的国内源。
解决方法：可以使用ctr手动拉取位于docker.io的镜像。或者使用镜像代理。
```
一次性手动拉取上面的三个镜像（需要在所有节点执行）
grep -oP 'image:\s*\K[^[:space:]]+' calico.yaml |awk '!seen[$0]++' | xargs -n 1 ctr image pull

查看下载的镜像
ctr -n k8s.io i ls |grep metrics
crictl images |grep metrics
```
镜像代理
```
https://docker.anyhub.us.kg/
https://docker.awsl9527.cn
```

**k8s.gcr.io被墙问题**
```
获取镜像列表
kubeadm config images list
提前拉取镜像
kubeadm config images pull --image-repository="registry.aliyuncs.com/google_containers" --kubernetes-version=v1.28.2
```

**设置master可以部署pod**

```
kubectl describe node jsy19-32-107  |grep -i taints

将master也当作Node节点使用
kubectl taint nodes jsy19-32-107 node-role.kubernetes.io/master-

恢复master Only状态,执行如下命令:
kubectl taint node k8s-master node-role.kubernetes.io/master=:NoSchedule
```

**calico密钥过期问题**

问题描述：calico使用的token存储在/etc/cni/net.d/calico-kubeconfig，通过cat可以查看。这个token的有效期只有24h， 但不知为何calico没有自动续期导致Pod无法正常创建和删除（对应分配和释放IP操作）。
解决方法：删除calico-nodePod，这样它在重建calico-nodePod后会生成新的token。
```
kubectl get pods -l k8s-app=calico-node -A
kubectl delete pods -l k8s-app=calico-node -A
```
**k8s证书过期问题**

默认情况下kubernetes集群各个组件的证书有效期是一年，这可以通过以下命令查看：
```
kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Jul 31, 2025 08:55 UTC   364d            ca                      no
apiserver                  Jul 31, 2025 08:55 UTC   364d            ca                      no
apiserver-etcd-client      Jul 31, 2025 08:55 UTC   364d            etcd-ca                 no
apiserver-kubelet-client   Jul 31, 2025 08:55 UTC   364d            ca                      no
controller-manager.conf    Jul 31, 2025 08:55 UTC   364d            ca                      no
etcd-healthcheck-client    Jul 31, 2025 08:55 UTC   364d            etcd-ca                 no
etcd-peer                  Jul 31, 2025 08:55 UTC   364d            etcd-ca                 no
etcd-server                Jul 31, 2025 08:55 UTC   364d            etcd-ca                 no
front-proxy-client         Jul 31, 2025 08:55 UTC   364d            front-proxy-ca          no
scheduler.conf             Jul 31, 2025 08:55 UTC   364d            ca                      no

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Jul 29, 2034 08:55 UTC   9y              no
etcd-ca                 Jul 29, 2034 08:55 UTC   9y              no
front-proxy-ca          Jul 29, 2034 08:55 UTC   9y              no
```

当证书过期后，执行kubectl命令会得到证书过期的提示，导致无法管理集群。通过以下命令进行证书更新：
```
# 首先备份旧证书
cd /etc/kubernetes
rsync -av * bak

#查看过期
kubeadm certs check-expiration  |grep apiserver
apiserver                  Jul 31, 2025 08:55 UTC   363d            ca                      no
apiserver-etcd-client      Jul 31, 2025 08:55 UTC   363d            etcd-ca                 no
apiserver-kubelet-client   Jul 31, 2025 08:55 UTC   363d            ca                      no

#对单个组件证书续期（一年）
kubeadm certs renew apiserver
[renew] Reading configuration from the cluster...
[renew] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'

certificate for serving the Kubernetes API renewed

kubeadm certs check-expiration  |grep apiserver
apiserver                  Aug 01, 2025 08:58 UTC   364d            ca                      no
apiserver-etcd-client      Jul 31, 2025 08:55 UTC   363d            etcd-ca                 no
apiserver-kubelet-client   Jul 31, 2025 08:55 UTC   363d            ca                      no

#对全部组件证书续期
kubeadm certs renew all
[renew] Reading configuration from the cluster...
[renew] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'

certificate embedded in the kubeconfig file for the admin to use and for kubeadm itself renewed
certificate for serving the Kubernetes API renewed
certificate the apiserver uses to access etcd renewed
certificate for the API server to connect to kubelet renewed
certificate embedded in the kubeconfig file for the controller manager to use renewed
certificate for liveness probes to healthcheck etcd renewed
certificate for etcd nodes to communicate with each other renewed
certificate for serving etcd renewed
certificate for the front proxy client renewed
certificate embedded in the kubeconfig file for the scheduler manager to use renewed

Done renewing certificates. You must restart the kube-apiserver, kube-controller-manager, kube-scheduler and etcd, so that they can use the new certificates.

#重启kubelet
systemctl restart kubelet

#如果不是root用户
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config

```

