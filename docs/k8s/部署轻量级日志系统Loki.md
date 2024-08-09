# 部署轻量级日志系统Loki

loki包含三个组件：
- Promtail:日志收集工具
- Loki:日志聚合系统
- Grafana:可视化工具

### helm安装
[官网地址](https://helm.sh/zh/docs/intro/install/)
```
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```
[国内旧helm版本](https://mirrors.huaweicloud.com/helm/)

### 添加 Loki 的 Chart 仓库
https://helm-charts.itboon.top/docs/grafana/loki-distributed/
```
helm repo add grafana "https://helm-charts.itboon.top/grafana" --force-update
helm repo update grafana
```
下载解压仓库
```
helm pull grafana/loki-stack
tar -zxvf loki-stack-2.10.2.tgz

指定版本
helm pull grafana/loki-stack --untar  --version 2.10.0
```

此Chart不止包含了Loki 、promtail、grafana，还包括其他组件，但是默认未开启，只开启了Loki 、promtail。
通过grafana.enabled=true指定开启grafana配置。

修改配置
```
修改values.yaml
grafana:
  enabled: true

修改charts/grafana/values.yaml
grafana密码
# adminPassword: strongpassword

```

安装Loki
```
helm upgrade --install loki --create-namespace -n logging -f values.yaml .
```

### 卸载loki
```
helm list -n logging

helm uninstall  -n logging loki
```


### loki查询
修改nodeport访问方式
```
kubectl edit svc -n logging loki-grafana

- name: service
    nodePort: 32323

 type: ClusterIP->NodePort
```

http://NodeIP:32323/

`{pod="nginx-75446c786c-j7s57"} |= "error"`


### 日志收集
一般推荐使用两种格式: logfmt 和 json 格式, 并且要有 level 和 timestamp 字段.
loki日志收集
- 日志格式官方推荐logfmt
- 应用日志需要输出到 stdout 中

例如应用需要设置
默认情况下如果访问日志没有输出到 stdout，可以通过在命令行参数中设置 --accesslog=true 来开启，
此外还可以设置访问日志格式为 json，这样更方便在 Loki 中查询使用。


### 参考地址

[使用 loki 作为 k8s 应用日志收集器(下篇)](https://blog.cong.moe/post/2020-08-08-use_loki_as_k8s_log_collector_2/) <br/>
https://github.com/rancher/local-path-provisioner <br/>
https://blog.frognew.com/2023/05/loki-02-install.html <br/>
[轻量级 k8s 应用日志收集方案 loki](https://cloud.tencent.com/developer/article/2090570) <br/>
[Loki](https://www.qikqiak.com/k3s/logging/loki/overview/)

### 问题排查
`failed to create memberlist: Failed to get final advertise address: no private IP address found, and explicit IP not provided`

问题解决：
https://github.com/grafana/loki/issues/6370#issuecomment-1176502466
https://community.grafana.com/t/gossip-ring-memberlist-no-private-ip-address-found/52209/8