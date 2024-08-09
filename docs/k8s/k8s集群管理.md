# k8s集群管理

### 集群资源管理
在 k8s 集群中，资源分为以下几种：
- 计算资源：如 CPU、内存、存储、网络等物理资源，也包含节点本身；
- 资源对象：如 Pod、Service、Deployment 等抽象资源；
- 外部引用资源：如在使用 PV/PVC 时，实际上使用的是第三方存储资源，它们归类为外部引用资源。


k8s 提供了多种资源管理方式，如：
- 资源配额（ResourceQuota）：对集群中所有资源进行统一管理，如 CPU、内存、存储等；
- 命名空间（Namespace）：将集群中的资源进行逻辑隔离，如不同团队使用不同的命名空间。然后就可以管理整个命名空间的整体资源使用和单个资源使用规则；
- 标签、选择器和注解：在命名空间下，使用标签、选择器和注解，可以进一步对资源进行管理
**标签（labels）**：可以用来标识资源身份，如标识 Pod 的镜像、环境、应用分类等
**选择器（selector）**：高层资源（如 Deployment）可以通过选择器关联低层资源（如 Pod）
**注解（annotations）**：类似标签，但它更灵活，可以存储结构化数据。一般用于向对象添加元数据，实现对对象行为的进一步控制。

集群管理员可以为每个命名空间创建一个或多个 ResourceQuota 对象。


k8s 通过LimitRange来实现对单个资源对象的配额限制。具体支持以下功能：
- 设置单个 Pod 或容器的最小和最大计算资源用量
- 设置单个 PVC 的最小和最大存储用量
- 设置请求资源和上限资源的用量比例
- 设置命名空间下默认的计算资源请求和上线，并在运行时自动注入容器

### 标签、选择器和注解

命名空间是用来实现多租户的资源隔离的。在同一个命名空间下，进一步实现资源的划分，对各个资源的身份进行标识。
这里主要用到的是下面三种方法：
- 标签：是用于标识和组织资源的键值对。它们可以附加到各种 Kubernetes 对象（如 Pod、Service、Node 等），用于对它们进行分类和过滤；
- 选择器：是用于按照标签进行筛选和选择资源的机制。在 Pod 或其他对象的定义中指定标签选择器，可以将特定标签的资源组合在一起；
- 注解： 注解是 Kubernetes对象上的键值对，用于存储与对象相关的任意非标识性信息。
相对于标签，注解更适合存储元数据信息、文档、或其他与对象关联的描述性信息。

**标签**
标签（Labels） 在 Kubernetes 中是一种关键的元数据，用于标识和组织各种资源。与名称和 UID 不同， 标签没有唯一性限制，允许多个资源携带相同的标签键值对。

标签为 Kubernetes 提供了一种强大的机制，用于组织、分类和选择资源。通过充分利用标签，用户可以更灵活地管理其容器化应用程序和整个集群。

```
# 添加
kubectl label <资源类型> <资源名称> <key>=<value>

# 删除
kubectl label <资源类型> <资源名称> <key>-
```

**选择器**
选择器是 Kubernetes 中的一种机制，用于在集群中查找资源。选择器允许用户根据标签的键值对选择一组符合条件的资源。
在查询时可以使用=,==,!=操作符进行基于等值的查询，以及逗号（相当于逻辑与&&）分割多个表达式以进行匹配。

```
先过滤再标记
kubectl label pods -l app=nginx tier=fe

```

**注解**
注解也是一种类似标签的机制。但它比标签更自由，可以包含少量结构化数据，主要用来给资源对象添加非标识的元数据。


注解和标签一样的是，它也是键值对形式，但它的键和值都只能是字符串。对于注解键的要求和限制和标签键一致。对于每一种资源对象，都可以设置标签。
方法是在模板的metadata.annotations 字段下进行设置，例如：
```
metadata:
  annotations:
    key1: "value1_string"
    # 允许跨行，实际内容不含换行符，可不加双引号
    key2: Annotations is a set of key value pairs that
      give extra information about the rule
    # yaml允许使用管道符，它会忽略开头结尾的换行符，但保留内容中的换行符，实际内容是 "123\n456"
    key3: |-
      123
      456
```

下面是一些可能使用注解来说明的场景：

描述性信息： 提供有关资源的详细描述，帮助用户理解资源的用途、配置和其他关键方面。例如：
```
annotations:
description: "Web server serving the main application."
```
版本控制： 标记资源的版本信息，特别是对于应用程序和服务的不同版本。
监控和度量： 添加与监控系统集成所需的信息，例如 Prometheus 或 Grafana 所需的标签。例如:
```
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"
```
自动化工具信息： 由自动化工具（如 CI/CD 系统）添加的信息，以便跟踪部署历史和构建信息。例如：
```
annotations:
  pipeline/build-number: "123"
  pipeline/deployed-by: "jenkins"
```
构建、发布或镜像信息。例如：
```
annotations:
  build-timestamp: "2023-11-10T14:30:00Z"
  git-branch: "main"
  image-hash: "sha256:abcdef123456"
```
负责人员联系信息。例如：
```
annotations:
  contact-person: "John Doe (john@example.com)"
```

集群中的每一个对象都有一个名称（由用户提供）来标识在同类资源中的唯一性。

UID
Kubernetes 系统生成的字符串，唯一标识对象。


### HPA 水平扩缩 Pod
HPA（HorizontalPodAutoscaler）中文名叫做水平 Pod 自动扩缩器
是 API Server 中的一种控制器，由 K8s API 进行控制，用于根据定义的指标在超出/低于预期值时对 Pod 的副本数进行自动扩缩。
使用 HPA 可以帮助我们减少集群资源浪费、提高资源利用率以及保证系统的稳定性。

使用 HPA 需要注意以下几点：
- HPA 仅适用于 Deployment、StatefulSet 或其他类似资源，不适用于 DaemonSet；
- HPA 本身有一个运行间隔，并不是实时监控的，所以当指标变化时，需要过一段时间才会生效；
**这个间隔由 kube-controller-manager 的 --horizontal-pod-autoscaler-sync-period 参数设置（默认间隔为 15 秒）**
- 可以指定监控 Pod 中的某个容器的指标（而不是整个 Pod），这在使用 Sidecar 模式部署应用时非常有用
- 可以同时指定多个指标作为扩缩 Pod 副本数量的参考，HPA 会针对每个指标分别计算扩缩副本数，并取最大值进行扩缩，但最大值不应超过设定的最大副本数（注：缩容时获取应该取最小值）
**若此时有任何一个指标获取失败，且其他指标的计算结果是缩容时，则本次缩容跳过；若其他指标的计算结果是扩容时，则继续扩容。**
- 使用 HPA 时必须为 Pod 设置 CPU 或内存资源的请求属性（resources.request），以便于 HPA 计算资源利用量
- HPA 允许设定稳定窗口来避免在指标波动时频繁扩缩 Pod，提供系统稳定性
- 支持自定义指标以及外部指标（比如 Ingress 收到的 QPS）

### 安装 Metrics Server 插件
Metrics Server 插件为 HPA 和VPA （垂直 Pod 自动扩缩器）提供运行状态的 Pod 的基本指标（CPU 和内存），当 HPA 和 VPA 需要这些指标时，
就必须安装 Metrics Server，否则它们无法正常运作。
安装 Metrics Server 后，Kubernetes API 的客户端就可以使用kubectl top命令查询这些信息。

**Metrics Server 原理**
K8s 的 API Server 定义了一套Metrics API ，用以上报和查询关于节点和 Pod 的资源使用情况的信息。
查询是简单，使用 kubectl 命令（或调用 Rest API）就行，但问题是默认安装的集群并没有组件来上报这些信息。
K8s 官方提供了一个名为Metrics Server 的插件，它将定期从每个节点上运行的 kubelet 获取有关节点和 Pod 的指标信息通过调用 Metrics API 上报给 K8s API Server。


测试hpa
定义一个 Deployment 和Svc
一个 HPA 对象
```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa-test
spec:
  # 绑定需要自动扩缩的资源对象，如deployment/statefulset等
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-hpa-test
  # 设置扩缩时的最大最小副本数
  minReplicas: 1
  maxReplicas: 5
  # 设置扩缩参考的指标（可设置多个指标）
  # 这里的指标表示期望的Pod总负载的平均CPU利用率为50%左右，若超出则考虑增加Pod数量，若不足则考虑减少Pod数量
  metrics:
    - type: Resource
      resource:
        name: cpu # 或 memory（注意需要为管理的Deployment对象下的Pod设置requests.cpu或memory限制，否则hpa会报错）
        target:
          type: Utilization # 另一个可用值是AverageValue，表示一个具体值
          averageUtilization: 50
    #      averageValue: 200m # 当 target.type=AverageValue时 需要使用此字段，值形式为 带m后缀或单纯的数字，前者是千分单位，比如1m=1000。
    #      当资源类型为memory时，这里一般显示纯数字，单位是byte
    #    - type: ContainerResource # K8s 1.27 版本支持对容器级别对象的监控策略
    #      containerResource:
    #        name: cpu
    #        container: application
    #        target:
    #          type: Utilization
    #          averageUtilization: 60

```

创建 HPA 的快捷命令
你可以使用kubectl autoscale deployment <deployment名称> --cpu-percent=50 --min=1 --max=10来代替模板创建 HPA。



使用多项指标、自定义指标和外部指标
你可以在 HPA 的模板定义中配置多项指标用于作为扩缩参考。此外， 除了默认支持的 CPU 或内存作为 Pod 副本扩缩的参考指标，还可以使用自定义指标和外部指标。
比如平均每个 Pod 收包数。自定义指标属于定制化方案， 需要部署相应指标方案的适配器才能支持（就像部署 Metrics Server 支持默认的 CPU/内存指标一样）。

目前比较流行的自定义指标和外部指标的适配器是prometheus-adapter，当我们部署好 Prometheus 和 prometheus-adapter 后，
后者从 Prometheus Server 中获取已定义的指标数据，并将其暴露为 Kubernetes 的 Custom Metrics API 和 External Metrics API，
从而支持 HPA 针对自定义指标和外部指标的扩缩策略。

prometheus-adapter 支持将抓取到的指标数据转换为 K8s 需要的三种指标 API 类型：

Resource Metrics API
Custom Metrics API
External Metrics API
所以它是可以替代 Metrics Server 的。


### 资源调度
kube-scheduler
集群资源的调度工作都是由kube-scheduler来完成的，可以称其为调度器。所有 Pod 都要经过调度器才能分配到具体节点上运行。
调度时，kube-scheduler会考虑资源需求、节点负载情况以及用户设定的硬性/软性条件限制来完成调度工作。
kube-scheduler 执行的各项工作都是基于 API Server 进行的，比如它会通过 API Server 的 Watch 接口监听新建的 Pod，再进行合适的节点分配，
调度完成后，再通过 API Server 将调度结果写入 etcd 中。

如果调度成功，Pod 会绑定到目标节点上。如果调度失败，kube-scheduler会重新进行调度，直到成功或超出重试次数，在此期间 Pod 处于 Pending 状态。

### 调度阶段
调度主要分为 3 个阶段，分别如下：

- 预选：调度器会过滤掉任何不满足 Pod 调度需求的节点（比如不满足 Pod 指定的 CPU/内存要求，或者 Pod 指定了节点，或者污点等）；
- 优选：调度器会根据优选策略给预选出的节点打分，并选择分值最高的节点（影响打分的因素可能有节点（反）亲和性、节点负载情况如硬件资源剩余/Pod 运行数量等);
- 绑定：选择分值最高的节点作为 Pod 运行的目标节点进行绑定（如有多个，则随机一个）。

### API Server
https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/

Kubernetes API Server 是 Kubernetes 集群中的核心组件之一，它充当了整个系统的控制面的入口点，负责处理集群内部和外部的 API 请求。
API Server 提供了一组 Restful API，允许用户和其他组件通过 HTTP 请求与 Kubernetes 集群进行交互。

一旦kube-apiserverPod 运行异常，kubectl 命令将无法使用。

**资源管理**
API Server 管理了 Kubernetes 集群中的所有资源对象，如 Pod、Service、Deployment 等。通过 API Server，用户和其他组件可以对这些资源进行增删查改等操作。

**身份认证、授权和准入控制**
API Server 处理用户的身份认证，并默认根据 RBAC（Role-Based Access Control）规则执行授权，以确定用户是否有权限执行特定操作。
这有助于确保对集群的安全访问。

准入控制是 Kubernetes 中的一个强大的安全层，它允许管理员定义一组规则，以确保在资源创建或修改之前执行特定的操作。这可以包括验证、修改或拒绝请求。

**API组**
在 Kubernetes 中，API 组（API Groups）是一种用于组织和版本化 API 资源的机制。Kubernetes API 可以被组织成多个 API 组，
每个组包含一组相关的 API 资源。API 组的引入有助于避免命名冲突，提供更好的组织结构， 并允许 Kubernetes API 的扩展和演进。

API 组通常会出现在 Restful API 路径中，还有资源模板的apiVersion字段中。下面是一些常见的 API 组:
- app/v1（模板中简写为v1，为大部分内置资源对象使用，如 Pod/ConfigMap/Secret/Service/Stateful/LimitRange/PV/PVC...）
- apps/v1 （ReplicaSet/Deployment/DaemonSet）
- networking.k8s.io/v1 (对应 Kind 为 Ingress)

```
# 在master节点执行
$ kubectl proxy --port 8080
Starting to serve on 127.0.0.1:8080

使用 cURL 访问 API

官方文档中获知 Pod 的几个常用 API 如下：

Create：POST /api/v1/namespaces/{namespace}/pods
Read：GET /api/v1/namespaces/{namespace}/pods/{name}
Replace：PUT /api/v1/namespaces/{namespace}/pods/{name}
Patch：PATCH /api/v1/namespaces/{namespace}/pods/{name}
Delete：DELETE /api/v1/namespaces/{namespace}/pods/{name}

```

### 身份认证
API Server 的每一次访问在kube-apiserver内部按顺序都要通过三个关卡：身份认证、鉴权和准入控制。它们分别具有以下作用：
- 身份认证：是谁在请求（确定用户身份有效）
- 鉴权：发起的操作有无授权过（确定用户+操作+资源已被授权）
- 准入控制器： 这个操作是否符合当前集群设定的规则（操作是否合规）

**kubeconfig常用命令：**
```
kubectl config view：打印 kubeconfig 文件内容。
kubectl config set-cluster：设置 kubeconfig 的 clusters 配置段。
kubectl config set-credentials: 设置 kubeconfig 的 users 配置段。
kubectl config set-context: 设置 kubeconfig 的 contexts 配置段。
kubectl config use-context: 设置 kubeconfig 的 current-context 配置段。
```

要访问 API Server，需要先进行身份认证。而 k8s 中的身份认证主要分为以下两大类：
- 用户账号认证：供普通真人用户或集群外的应用访问集群使用
HTTPS 客户端证书认证
HTTP Token 认证
HTTP Basic 认证（不再支持，--basic_auth_file在 v1.19 中删除，使用--token-auth-file实现类似的功能）
- ServiceAccount 认证：供集群内的 Pod 使用（用于给 Pod 中的进程提供访问 API Server 的身份标识）

用户账号—x509 证书
```
# 1. 生成根证书私钥
#openssl genrsa -out ca.key 2048
# 2. 基于根证书私钥生成证书文件 （-days 设置证书有效期）
#openssl req -x509 -new -nodes -key ca.key -subj "/CN=<master-ip>" -days 1000 -out ca.crt

-- 前两步可省略，因为安装集群时已经提供了默认的ca证书以及key文件在 /etc/kubernetes/pki/ 下面

# 3. 生成client证书私钥
openssl genrsa -out client.key 2048

# 4. 基于client证书私钥生成client证书的csr文件（证书签名请求），CN是用户名，O是组名
openssl req -new -key client.key -out client.csr -subj "/CN=user2/O=app1/O=app2"

# 5. 基于client两个文件和k8s的ca私钥生成client证书
openssl x509 -req -in client.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out client.crt -days 365

# 检查client证书
openssl x509 -in client.crt -text -noout
```

服务账号（ServiceAccount，简称 SA）认证主要是提供给 Pod 中的进程使用，以便 Pod 可以从内部访问 API Server。用户账号认证不限制命名空间，
但服务账号认证局限于它所在的命名空间。

K8s 中支持以两种方式使用 RBAC:
- 基于单一命名空间的 RBAC（关键字为 Role、RoleBinding）
- 基于全局的 RBAC，功能兼容第一种（关键字为 ClusterRole、ClusterRoleBinding）