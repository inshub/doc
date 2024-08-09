# k8s存储

集群中使用存储、如何管理集群资源的使用以及集群资源的调度原理等

### 存储与配置

存储卷（Volume）
k8s 定义了下面几类存储卷（volume）抽象来实现相应功能：
- 本地存储卷：用于 Pod 内多个容器间的存储共享，或这 Pod 与节点之间的存储共享；
- 网络存储卷：用于多个 Pod 之间甚至是跨节点的存储共享；
- 持久存储卷：基于网络存储卷，用户无须关心存储卷的创建所使用的存储系统，只需要自定义具体消费的资源额度（将 Pod 与具体存储系统解耦）；
所有的卷映射到容器都是以目录或文件的形式存在。

不管是那种存储，在yaml中需要先定义volumes，然后在volumeMounts中指定挂载点和volumes进行关联。

### 本地存储卷

本地存储卷（LocalVolume）是 Pod 内多个容器间的共享存储，Pod 与节点之间的共享存储。它主要包括emptyDir和hostPath两种方式， 这两种方式都会直接使用节点上的存储资源，区别在于emptyDir的存储卷在 Pod 的生命周期内存在，而hostPath的存储卷由节点进行管理。

** emptyDir **
emptyDir 是一个纯净的空目录，它占用节点的一个临时目录，在 Pod 重启或重新调度时，这个目录的数据会丢失。Pod 内的容器都可以读写这个目录（也可以对容器设置只读）。 一般用于短暂的临时数据存储，如缓存或临时文件。


pod_volume_emptydir.yaml
```
apiVersion: v1
kind: Pod
metadata:
  name: busybox-emptydir
  labels:
    app: busybox
spec:
  containers:
    - name: write # 负责写
      image: busybox
      command: [ "sh", "-c" ]
      args: [ "echo 'hello_volume!' > /write_dir/data; sleep infinity" ]
      volumeMounts:
        - mountPath: /write_dir
          name: temp-dir
    - name: read # 负责读
      image: busybox
      command: [ "sh", "-c" ]
      args: [ "cat /read_dir/data; sleep infinity" ]
      volumeMounts:
      - mountPath: /read_dir
        name: temp-dir
        readOnly: true # 可选
  volumes:
    - name: temp-dir
      emptyDir: {}

```

cat /var/lib/kubelet/pods/8cc50c3f-f0ad-4ac4-99ae-fa4d09266866/volumes/kubernetes.io~empty-dir/temp-dir/data
hello_volume!

** hostPath **
hostPath 是节点上的一个文件或目录，Pod 内的容器都可以读写这个卷，这个目录的生命周期与节点相同。需要注意的是， Pod 调度到其他节点就无法读取到之前它自己写入的数据。

hostPath 卷比较适用于 DaemonSet 控制器，运行在 DaemonSet 控制器中的 Pod 会常驻在各个节点上，一般是日志或监控类应用。

k8s 官方建议避免使用 HostPath，当必须使用 HostPath 卷时，它的范围应仅限于所需的文件或目录，最好以只读方式挂载。

** 网络存储卷 **

```
      volumeMounts:
        - mountPath: /write_dir
          name: nfs-dir
  volumes:
    - name: nfs-dir
      nfs:
        path: /data/k8s-nfs
        server: my-nfs-server.example.com # 或者一个IP地址
```

**  持久存储卷 **

k8s 提供三种基于存储的抽象概念：
- PV（Persistent Volume）
- StorageClass
- PVC（Persistent Volume Claim）

这三者用于支持基础设施和应用程序之间的分离，以便于开发人员和存储管理人员各司其职，
由存储管理人员设置 PV 或 StorageClass， 并在里面配置存储系统和参数，
然后开发人员只需要创建 PVC 来申请指定空间的资源以存储和共享数据即可，无需关心底层存储系统细节。
当删除 PVC 时，它写入具体存储资源的数据可以根据回收策略自动清理。


### pv与pvc
- PV 表示持久存储卷，定义了集群中可使用的存储资源，其中包含存储资源的类型、回收策略、存储容量等参数。
- PVC 表示持久存储卷声明，是用户发起对存储资源的申请，用户可以设置申请的存储空间大小、访问模式。

按顺序定义了 PV 和 PVC 以及使用 PVC 的 Pod

pod_use_pvc.yaml  测试pvc，所以给的存储很小。真正使用注意修改。
```
apiVersion: v1
kind: Namespace
metadata:
  name: test

---
# 按顺序定义 pv，pvc，pod
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-hostpath
  namespace: test # pv允许被跨namespace使用
spec:
  capacity:
    storage: 100Mi # 此卷容量，单位支持 Ti T Gi G Mi M Ki K，可以改小，但强烈不建议
  accessModes:
    - ReadWriteMany # 允许多个客户端读写，还有ReadWriteOnce（允许单个节点读写），ReadOnlyMany（允许多个节点只读）,单个节点可以包含多个Pod
  persistentVolumeReclaimPolicy: Retain # 删除pvc时，pv的回收策略，这里为保留。还有 Delete（删除）
  storageClassName: node-local # 存储分类定义，会被pvc引用
  hostPath: # 可换为 nfs 等其他存储
    path: /home/host-pv-dir

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-hostpath
spec:
  accessModes:
    - ReadWriteMany # 必须和PV一致才能匹配
  storageClassName: node-local # 存储分类定义，对应pv定义
  resources:
    requests:
      storage: 10Mi # pvc一旦创建，若要修改申请的空间大小，只能增加不能减少!

---
apiVersion: v1
kind: Pod
metadata:
  name: busybox-use-pvc
  labels:
    app: busybox
spec:
  containers:
    - name: write
      image: busybox
      command: [ "sh", "-c" ]
      args: [ "echo 'hello pvc!' > /write_dir/data; sleep infinity" ]
      volumeMounts:
        - mountPath: /write_dir
          name: pvc-dir
  volumes:
    - name: pvc-dir
      persistentVolumeClaim:
        claimName: pvc-hostpath # 对应pvc名称


```

PVC 通过storageClass、accessModes和存储空间这几个属性来为 PVC 匹配符合条件的 PV 资源。
具体来说，若要匹配成功，要求在 PV 和 PVC 中， storageClass和accessModes属性必须一致，而且 PVC 的storage不能超过 PV 的capacity。


PVC 和 PV 是一对一绑定的，pv和pvc设置一样大小，避免造成空间浪费。

** PV 与 PVC **
- PV 与 PVC 的绑定需要匹配多个属性值，即存储类名、存储大小、访问模式。
- PV 允许被不同 namespace 中的 PVC 绑定。
- PV 和 PVC 只能一对一绑定，但一个 PVC 可以被多个 Pod 同时使用。由于这一点，PVC 的storage属性通常设置为和 PV 一致，不然会造成空间浪费。
- PVC 的容量不能缩小，但 PV 可以，虽然不建议这样做。
- hostPath 类型的 PV 资源一般只用于开发和测试环境，其目的是使用节点上的文件或目录来模拟网络附加存储。在生产集群中，你不会使用 hostPath。 集群管理员会提供网络存储资源，比如 Google Compute Engine 持久盘卷、NFS 共享卷或 Amazon Elastic Block Store 卷。
- k8s 通过一个插件层来连接各种第三方存储系统，这个插件层核心是一套接口叫 CSI（Container Storage Interface），存储提供商可以自行实现这个接口来对接 k8s。


###  StorageClass
StorageClass可以通过动态方式创建 PV，然后自动绑定到 PVC 上。

定义 StorageClass
每个 StorageClass 都包含 provisioner、parameters 和 reclaimPolicy 字段， 这些字段会在 StorageClass 需要动态制备 PV 时会使用到。

每个 StorageClass 都有一个制备器（Provisioner），用来决定使用哪个卷插件制备 PV。 该字段必须指定。 不同的存储后端（如 AWS EBS、GCE PD、Azure Disk 等）都有不同的卷插件，因此需要根据所使用的存储后端指定对应的制备器，以及配置相应的参数。 比如使用 NFS 作为的存储后端的存储类定义是：
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: example-nfs
provisioner: example.com/external-nfs
parameters:
  server: nfs-server.example.com
  path: /share
  readOnly: "false"

```

设置默认的 StorageClass
```
storageclass.kubernetes.io/is-default-class: "true"
```
