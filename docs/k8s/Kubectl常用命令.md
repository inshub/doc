# Kubectl常用命令


### 常用命令
```
创建一个pod
kubectl run nginx --image=nginx
创建一个deployment
kubectl create deployment nginx --image=nginx:alpine
创建或更新资源
kubectl apply -f nginx.yaml
修改Pod
kubect patch pod nginx-pod -p '{"spec":{"containers":[{"name":"nginx","image":"nginx:latest"}]}}'
临时访问pod，宿主端口转发
kubectl port-forward --address 0.0.0.0 pod_name 3200:80
指定查看某个容器的日志
kubectl logs -f pod_name -c container-2
修改Deployment
kubectl patch deployments.apps nginx -p '{"spec":{"replicas": 2}}'
查看pod变化,--watch可简写为-w
kubectl get pods -w

查看deployment更新历史
kubectl rollout history deployment/busybox
回滚到历史版本
kubectl rollout history deployment/busybox --revision=1
暂停和恢复deployment
kubectl rollout pause deploy {deploy-name}
kubectl rollout resume deploy {deploy-name}

服务的svc并指定service类型和端口
kubectl expose deployment nginx --type=NodePort --port=80

获取svc selector关联的endpoints
kubectl get endpoints

创建新的命名空间
kubectl create namespace test-ns
```


### 如何获取kubelet当前配置
```
先启动代理
kubectl proxy

在另外终端请求接口，注意替换节点名字。
curl -sSL http://127.0.0.1:8001/api/v1/nodes/{node_name}/proxy/configz |jq

        ...
        "evictionHard": {
            "imagefs.available": "15%",
            "memory.available": "100Mi",
            "nodefs.available": "10%",
            "nodefs.inodesFree": "5%"
        },
```
- 参数详解
nodefs就是指kubernetes node节点的根目录吧，即文件系统的/目录。
而imagefs的值其实是kubelet向docker询问的结果，在docker中可以通过docker info查看Docker Root Dir。

- 参数默认值
```
--eviction-hard strings     默认值：imagefs.available<15%,memory.available<100Mi,nodefs.available<10%
触发 Pod 驱逐操作的一组硬性门限（例如：memory.available<1Gi （内存可用值小于 1G）设置。在 Linux 节点上，默认值还包括 nodefs.inodesFree<5%。 （已弃用：应在 --config 所给的配置文件中进行设置。 请参阅 kubelet-config-file 了解更多信息。）

```

### 参考地址
https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kubelet/ <br/>
https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubelet-config-file/