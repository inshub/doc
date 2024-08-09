# k8s基本概念

### 架构设计
K8s集群节点拥有Master和Node两种角色。
- Master：官方叫做控制平面（Control Plane）。主要负责整个集群的管控，包含监控、编排、调度集群中的各类资源对象（如Pod/Deployment等）。
  通常Master会占用一个单独的集群节点（不会运行应用容器），基于高可用可能会占用多台。
- Node：数据平面。是集群中的承载实际工作任务的节点，直接负责对容器资源的控制，可以无限扩展。

**Master四个组件组成：**
- API Server进程
- etcd
- 调度器（Scheduler）
- 控制器管理器（kube-controller-manager）
  - NodeController
  - ReplicationController
  - EndpointContoller
  - ServiceAccountContoller
  - TokenContoller

**Node三个组件组成：**
- kubelet
- kube-proxy
- docker/containerd


### 名词术语

### Pod
Pod 是 Kubernetes 中最小的可部署和调度单元，通常包含一个或多个容器。
Pod有两种运行方式。一种是单独运行（叫做单例），这种方式运行的Pod没有自愈能力，一旦因为各种原因被删除就不会再重新创建。 另一种则是常见的在控制器管理下运行，控制器会持续监控Pod副本数量是否符合预期，并在Pod异常时重新创建新的Pod进行替换。

Pod 中的容器所看到的系统主机名与为Pod名称相同
```
创建一个pod
kubectl run nginx --image=nginx
创建一个deployment
kubectl create deployment nginx --image=nginx:alpine
kubectl create deployment busybox --images=busybox
```

**Pod的生命周期**
通过kubectl get po看到的STATUS字段存在以下情况：
- Pending（挂起）： Pod 正在调度中（主要是节点选择）。
- ContainerCreating（容器创建中）： Pod 已经被调度，但其中的容器尚未完全创建和启动（包含镜像拉取）。
- Running（运行中）： Pod 中的容器已经在运行。
- Terminating（正在终止）： 删除或重启Pod会使其进入此状态，Pod默认有一个终止宽限时间是30s，可以在模板中修改（Pod可能由于某些原因会一直停留在此状态）。
- Succeeded（已成功终止）： 所有容器都成功终止，任务或工作完成，特指那些一次性或批处理任务而不是常驻容器。
- Failed（已失败）： 至少一个容器以非零退出码终止。
- Unknown（未知）： 无法获取 Pod 的状态，通常是与Pod所在节点通信失败导致。

**CrashLoopBackOff状态表示重启次数过多，过一会儿再试，这表示pod内的容器无法正常启动，或者启动就立即退出了**

**Pod创建过程**

**Pod销毁过程**
当Pod需要销毁时，kubelet会先向API Server发送删除请求，然后等待Pod中所有容器停止，包含以下过程:

用户发送Pod删除命令
API Server更新Pod：开始销毁，并设定宽限时间（默认30s，可通过--grace-period=n指定，为0时需要追加--force），超时强制Kill
同时触发：
Pod 标记为 Terminating
kubelet监听到 Terminating 状态，开始终止Pod
Endpoint控制器监控到Pod即将删除，将移除所有Service对象中与此Pod关联的Endpoint对象
如Pod定义了prepStop回调，则会在Pod中执行，并再次执行步骤2，且增加宽限时间2s
Pod进程收到SIGTERM信号
到达宽限时间还在运行，kubelet发送SIGKILL信号，设置宽限时间0s，直接删除Pod

### Pod与Container的不同
在创建的资源里，在最内层是我们的服务 nginx，运行在 Container 当中， Container (容器) 的本质是进程，而 Pod 是管理这一组进程的资源。

### Sidecar模式
Pod 可以管理多个 Container。例如在某些场景服务之间需要文件交换(日志收集)，本地网络通信需求(使用 localhost 或者 Socket 文件进行本地通信)，
这时候就会部署多容器Pod。 这是一种常见的容器设计模式，它有个名称叫做Sidecar。
Sidecar模式中主要包含两类容器，一类是主应用容器，另一类是辅助容器（称为 sidecar 容器）提供额外的功能，它们共享相同的网络和存储空间。
这个模式的灵感来自于摩托车上的辅助座位，因此得名 "Sidecar"。

### Init容器
Init 容器是一种特殊容器，在 Pod 内的应用容器启动之前运行。Init 容器可以包括一些应用镜像中不存在的实用工具和安装脚本。



### Pod控制器
在生产环境中，我们很少会直接部署一个单实例Pod。因为Pod被设计为一种临时性的一次性实体，当因为人为或资源不足等情况被删除时，Pod不会自动恢复。 但是当我们使用控制器来创建Pod时，Pod的生命周期就会受到控制器管理。这种管理具体表现为Pod将拥有横向扩展以及故障自愈的能力。

常见的控制器类型如下：
- Deployment
- StatefulSet
- DaemonSet
- Job/CronJob

** Deployment **
通常，Pod不会被直接创建和管理，而是由更高级别的控制器，例如Deployment来创建和管理。 这是因为控制器提供了更强大的应用程序管理功能。

- 应用管理：Deployment是Kubernetes中的一个控制器，用于管理应用程序的部署和更新。它允许你定义应用程序的期望状态，然后确保集群中的副本数符合这个状态。
- 自愈能力：Deployment可以自动修复故障，如果Pod失败，它将启动新的Pod来替代。这有助于确保应用程序的高可用性。
- 滚动更新：Deployment支持滚动更新，允许你逐步将新版本的应用程序部署到集群中，而不会导致中断。
- 副本管理：Deployment负责管理Pod的副本，可以指定应用程序需要的副本数量，Deployment将根据需求来自动调整。
- 声明性配置：Deployment的配置是声明性的，你只需定义所需的状态，而不是详细指定如何实现它。Kubernetes会根据你的声明来管理应用程序的状态。

示例查看
```
kubectl create deployment busybox --images=busybox  -r 2
-r, --replicas=2

kubectl get pods
NAME                      READY   STATUS    RESTARTS          AGE
busybox-5dbdcbb68-dqglq   1/1     Running   176 (4m12s ago)   20h
busybox-5dbdcbb68-mcz6c   1/1     Running   167 (3m3s ago)    20h
```

hello_deployment.yaml
管理template下所有 app=hello_k8s的pod，（要求和template.metadata.labels完全一致！！！否则无法部署deployment）
```
spec:
  replicas: 2 # 副本数量
  selector:
    matchLabels:
      app: hello_k8s # 管理template下所有 app=hello_k8s的pod，（要求和template.metadata.labels完全一致！！！否则无法部署deployment）
  template: # template 定义一组容器
    metadata:
      labels:
        app: hello_k8s

```

**滚动更新（Rolling Update）**
k8s 1.15版本起支持滚动更新，即先创建新的pod，创建成功后再删除旧的pod，确保更新过程无感知，大大降低对业务影响。
在 deployment 的资源定义中, spec.strategy.type 有两种选择:
- RollingUpdate: 逐渐增加新版本的 pod，逐渐减少旧版本的 pod。（常用）
- Recreate: 在新版本的 pod 增加前，先将所有旧版本 pod 删除（针对那些不能多进程部署的服务）

还可以通过以下字段来控制升级 pod 的速率：
- maxSurge: 最大峰值，用来指定可以创建的超出期望 Pod 个数的 Pod 数量。期望Pod数量的百分比(向上取整)。125%
- maxUnavailable: 最大不可用，用来指定更新过程中不可用的 Pod 的个数上限。期望Pod数量的百分比(向下取整)。75%
```
kubectl describe deployments.apps nginx
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
```


### 存活探针 (livenessProb)
存活探测器来确定什么时候要重启容器。 例如，存活探测器可以探测到应用死锁（应用程序在运行，但是无法继续执行后面的步骤）情况。 重启这种状态下的容器有助于提高应用的可用性，即使其中存在缺陷。

```
          # 存活探针
          livenessProbe:
            # http get 探测指定pod提供HTTP服务的路径和端口
            httpGet:
              path: /healthz
              port: 3000
            # 3s后开始探测
            initialDelaySeconds: 3
            # 每3s探测一次
            periodSeconds: 3

```

### 就绪探针 (readiness)
就绪探测器可以知道容器何时准备好接受请求流量，当一个 Pod 内的所有容器都就绪时，才能认为该 Pod 就绪。 这种信号的一个用途就是控制哪个 Pod 作为 Service 的后端。若 Pod 尚未就绪，会被从 Service 的负载均衡器中剔除。
```       # 就绪探针
          readinessProbe:
            # http get 探测pod提供HTTP服务的路径和端口
            httpGet:
              path: /healthz
              port: 3000
            initialDelaySeconds: 1 # 1s后开始探测
            periodSeconds: 5 # 每5s探测一次
            timeoutSeconds: 1 # 单次探测超时，默认1
            failureThreshold: 3 # 探测失败时，k8s的重试次数，默认3，达到这个次数后 停止探测，并打上未就绪的标签
```

### DaemonSet
DaemonSet是一种特殊的控制器，它确保会在集群的每个节点（或大部分）上都运行 一个 Pod副本。在节点加入或退出集群时，DaemonSet也会在相应节点增加或删除Pod。 因此常用来部署那些为节点本身提供服务或维护的Pod（如日志收集和转发、监控等）。
```
kind: DaemonSet
...
    spec:
      tolerations:
        # 这些容忍度设置是为了让该守护进程集在控制平面节点上运行
        # 如果你不希望自己的控制平面节点运行 Pod，可以删除它们
        - key: node-role.kubernetes.io/master
          effect: NoSchedule
```

### StatefulSet
StatefulSet 部署的应用。它提供的功能特性如下：
- 有序性：严格按照定义的顺序部署和扩展 Pod，每个 Pod 都有一个唯一的索引，从 0 开始；
- 稳定的网络标识符：Pod 重新调度后其 PodName 和 Hostname 不变，这基于无头 Service 实现；
- 持久性存储：StatefulSet 通常与 PersistentVolumeClaim (PVC) 配合使用，以提供持久性存储。每个 Pod 可以绑定到一个独立的 PVC，以确保数据在 Pod 重新调度或故障恢复时不会丢失；

StatefulSet 控制器由 3 个部分组成：
- 无头 Service：用于为 Pod 资源标识符生成可解析的 DNS 记录；
- volumeClaimTemplate：基于静态或动态 PV 供给方式为 Pod 提供独立的固定存储卷；
- StatefulSet：用于控制 Pod 的创建和销毁。

StatefulSet 执行的是有序伸缩，具体来说是在扩容时从编号较小的开始逐个创建，而缩容时则是倒序进行。
StatefulSet 控制器会从 Pod 序号大到小的顺序进行逐个更新


### Service
Service 为 Pod 提供了网络访问、负载均衡以及服务发现等功能。从网络分层上看，Service 是作为一个四层网络代理。

#### 不同类型的 Service
Kubernetes 提供了多种类型的 Service，包括 ClusterIP、NodePort、LoadBalancer、Headless 和 ExternalName，每种类型服务不同的需求和用例。 Service 类型的选择取决于你的应用程序的具体要求以及你希望如何将其暴露到网络中。
- ClusterIP:
原理：使用这种方式发布时，会为 Service 提供一个固定的集群内部虚拟 IP，供集群内（包含节点）访问。
场景：内部数据库服务、内部 API 服务等。
- NodePort:
原理：通过每个节点上的 IP 和静态端口发布服务。 这是一种基于 ClusterIP 的发布方式，因为它应用后首先会生成一个集群内部 IP， 然后再将其绑定到节点的 IP 和端口，这样就可以在集群外通过 nodeIp:port 的方式访问服务。
场景：Web 应用程序、REST API 等。
- LoadBalancer:
原理：这种方式又基于 NodePort，另外还会使用到外部由云厂商提供的负载均衡器。由后者向外发布 Service。 一般在使用云平台提供的 Kubernetes 集群时，会用到这种方式。
场景：Web 应用程序、公开的 API 服务等。
- Headless:
原理：这种方式不会分配任何集群 IP，也不会通过 Kube-proxy 进行反向代理和负载均衡，而是通过 DNS 提供稳定的网络 ID 来访问， 并且 DNS 会将无头 Service 的后端解析为 Pod 的后端 IP 列表，以供集群内访问（不含节点），属于向内发布。
场景：一般提供给 StatefulSet 使用。
- ExternalName:
原理：与上面提到的发布方式不太相同，这种方式是通过 CNAME 机制将外部服务引入集群内部，为集群内提供服务，属于**向内发布 **。
场景：连接到外部数据库服务、外部认证服务等。



##### Service 类型之 ClusterIP
ClusterIP 通过分配集群内部 IP 来在集群内（包含节点）暴露服务，这样就可以在集群内通过 clusterIP:port 访问到 pod 服务，集群外则无法访问。 ClusterIP 又可以叫做 Service VIP（虚拟 IP）。

```
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: ClusterIP  # 这行是默认的，可省略
  selector:
    app: nginx  # 通过selector关联pod组
  ports:
    - port: 3000 # service端口
      targetPort: 3000 # 后端pod端口
```

Service 访问及负载均衡原理
svc的网络通过kube-proxy实现，每个节点都运行着一个 kube-proxy 组件。这个组件会跟踪 Service 和 Pod 的动态变化，并且最新 的 Service 和 Pod 的映射关系会被记录到每个节点的 iptables 中，这样每个节点上的 iptables 规则都会随着 Service 和 Pod 资源自动更新。

iptables 使用 NAT 技术将虚拟 IP（也叫做 VIP）的流量转发到 Endpoint。

```
kubectl get svc
nginx        NodePort    192.161.154.204   <none>        80:31364/TCP   6d2h


iptables -nvL -t nat
Chain KUBE-SERVICES (2 references)
 pkts bytes target     prot opt in     out     source               destination
    0     0 KUBE-SVC-2CMXP7HKUVJN7L6M  tcp  --  *      *       0.0.0.0/0            192.161.154.204      /* default/nginx cluster IP */ tcp dpt:80


Chain KUBE-SVC-2CMXP7HKUVJN7L6M (2 references)
 pkts bytes target     prot opt in     out     source               destination
    0     0 KUBE-MARK-MASQ  tcp  --  *      *      !192.200.0.0/16       192.161.154.204      /* default/nginx cluster IP */ tcp dpt:80
    0     0 KUBE-SEP-5T37HVCSKOKNWPMA  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* default/nginx -> 192.200.116.198:80 */ statistic mode random probability 0.33333333349
    0     0 KUBE-SEP-RE4IJLUL6GLXGFNY  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* default/nginx -> 192.200.116.199:80 */ statistic mode random probability 0.50000000000
    0     0 KUBE-SEP-ZD7E7L7TA3YWDRC7  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* default/nginx -> 192.200.170.3:80 */


iptables-save |grep KUBE-SEP-5T37HVCSKOKNWPMA


kubectl get pods -o wide
NAME                      READY   STATUS    RESTARTS        AGE    IP                NODE           NOMINATED NODE   READINESS GATES
nginx-7854ff8877-2j4qw    1/1     Running   0               6d2h   192.200.170.3     jsy19-40-240   <none>           <none>
nginx-7854ff8877-54fc9    1/1     Running   0               21m    192.200.116.199   jsy19-32-107   <none>           <none>
nginx-7854ff8877-gpvhr    1/1     Running   0               5d2h   192.200.116.198   jsy19-32-107   <none>           <none>
```

##### Service 类型之 NodePort
ClusterIP 只能在集群内访问 Pod 服务，而 NodePort 则进一步将服务暴露到集群节点的静态端口上，可以认为 NodePort 是 ClusterIP 的增强模式。

expose会随机分配一个端口，端口范围: 30000-32767
```
kubectl expose deployment nginx --type=NodePort --port=80
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - port: 3000  # pod端口
      nodePort: 30000  # 节点固定端口。在NodePort类型中，k8s要求在 30000-32767 范围内，否则apply报错

```

##### Service 类型之 LoadBalancer

LoadBalancer 正是通过使用云厂商提供的负载均衡器（Service LoadBalancer，一般叫做 SLB）的高可用方式向外暴露服务。 负载均衡器将集群外的流量转发到集群内的 Node，后者再基于 ClusterIP 的方式转发到 Pod。可以说 LoadBalancer 是 NodePort 的进一步增强。

LoadBalancer是基于 NodePort 的一种 Service

```
metadata:
  name: service-hellok8s-loadbalancer
  annotations: # 阿里云私网SLB的配置示例，SLB一般使用注解来控制LB的具体行为
    # 指明SLB实例地址类型为私网类型。
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-address-type: intranet
    # 修改为您的私网SLB实例ID。
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id: <YOUR_INTRANET_SLB_ID>
    # 是否自动创建SLB端口监听（会覆写已有端口监听），也可手动创建端口监听。
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-force-override-listeners: 'true'
spec:
  type: LoadBalancer

```
通过以上注解修改（apply）容器集群kube-system/nginx-ingress-lb服务即可配置使用指定的私网SLB实例。

[部署Ingress Controller使用私网SLB](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/configure-an-ingress-controller-to-use-an-internal-facing-slb-instance?spm=a2c4g.11186623.0.0.5d1736e0l59zqg
)


##### Service 类型之 Headless
k8s 中一种特殊的 Service 类型，它不为整个服务分配任何集群 IP，而是通过分配的 DNS 域名来访问 Pod 服务。
由于没有 Cluster IP，所以节点和集群外都无法直接访问 Service（但可以在节点直接访问 Pod IP）。
无头 Service 主要提供给 StatefulSet（如数据库集群）使用。

```
  type: ClusterIP  # 这行是默认的，可省略
  clusterIP: None # 留空表示自动分配，或设置为 “None” 以创建无头服务
```
服务组成方式为{ServiceName}.{Namespace}.svc.{ClusterDomain}，
其中 ClusterDomain 表示集群域，默认为cluster.local，
Namespace在 Service 的 yaml 文件中未指定那就是 default。

##### Service 类型之 ExternalName
ExternalName 也是 k8s 中一个特殊的 Service 类型，它不需要设置 selector 去选择为哪些 pod 实例提供服务，
而是使用 DNS CNAME 机制把 svc 指向另外一个域名，这个域名可以是任何能够访问的虚拟地址（不能是 IP），
比如mysql.db.svc这样的建立在 db 命名空间内的 mysql 服务，也可以指定qq.com这样的外部真实域名。

```
spec:
  type: ExternalName
  externalName: qq.com # 只能是一个有效的dns地址，不能包含 /，也不能是IP（可定义但无法正常解析）
```

##### Service 类型之 ExternalIP
ClusterIP（含 Headless）/NodePort/LoadBalancer/ExternalName 五种 Service 都可以搭配 ExternalIP 使用
ExternalIP 是 Service 模板中的一个配置字段，位置是spec.externalIP。配置此字段后，在原模板提供的功能基础上，
还可以将 Service 注册到指定的 ExternalIP（通常是节点网段内的空闲 IP）上，从而增加 Service 的一种暴露方式。

```
spec:
  type: ClusterIP
  selector:
    app: hellok8s
  ports:
    - port: 3000
      targetPort: 3000
  externalIPs:
    - 10.10.10.10 # 任意局域网IP都可
```
spec.externalIP可以配置为任意局域网 IP，而不必是节点网段内的 ip，Service Controller 会自动为每个节点添加路由。
注意：设置spec.externalIP时要选择一个当前网络中没有使用以及以后大概率也不会使用的 IP（例如192.168.255.100）， 避免在访问 Service 时出现乌龙冲突。

###  Ingress
Ingress 可以简单理解为集群服务的网关（Gateway），它是所有流量的入口，经过配置的路由规则，将流量重定向到后端的服务。
从网络分层上看， Ingress 是作为一个七层网络代理。

Ingress 提供以下功能：
路由规则：Ingress 允许你定义路由规则，使请求根据主机名和路径匹配路由到不同的后端服务。这使得可以在同一 IP 地址和端口上公开多个服务。
Rewrite 规则：Ingress 支持 URL 重写，允许你在路由过程中修改请求的 URL 路径；
TLS/SSL 支持：你可以为 Ingress 配置 TLS 证书，以加密传输到后端服务的流量；
负载均衡：Ingress 可以与云提供商的负载均衡器集成，以提供外部负载均衡和高可用性；
虚拟主机：你可以配置多个主机名（虚拟主机）来公开不同的服务。这意味着你可以在同一 IP 地址上托管多个域名；
自定义错误页面：你可以定义自定义错误页面，以提供用户友好的错误信息；
插件和控制器：社区提供了多个 Ingress 控制器，如 Nginx Ingress Controller 和 Traefik，它们为 Ingress 提供了更多功能和灵活性。

### ConfigMap 和 Secret
ConfigMap 和 Secret 都是用来保存配置数据的，在模板定义和使用上没有大太差别。唯一的区别就是 Secret 是用来保存敏感型的配置数据，比如证书密钥、token 之类的。


