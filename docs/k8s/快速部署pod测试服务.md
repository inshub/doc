# 快速部署deployment/pod测试服务

常用pod服务，deployment与pod的区别在于，创建pod可以删除，deployment删除pod会自动拉起，需要删除deployment才能彻底删除pod。



### nginx
```
创建一个pod
kubectl run nginx --image=nginx

创建一个deployment
kubectl create deployment nginx --image=nginx:alpine

暴露端口
kubectl expose deployment nginx --type=NodePort --port=80

扩容副本
kubectl scale deployment nginx --replicas 2
```


### busybox
BusyBox 是一个集成了三百多个最常用Linux命令和工具的软件。
```
kubectl create deployment busybox --images=busybox
```