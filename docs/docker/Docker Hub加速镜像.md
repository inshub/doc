# DockerHub镜像无法下载的多种解决方案
`hub.docker.com`和国内几家Docker Hub镜像服务平台陆续下架，停止服务。
给使用的同学造成非常大的困扰。
汇总了几种目前有效的解决方案，希望能帮助到大家。
因为有些链接有时效性，可以关注文中链接的issue。(2024年6月18日测试可用)

### Docker镜像加速站
为了加速镜像拉取，使用以下命令设置registry mirror
支持系统：Ubuntu 16.04+、Debian 8+、CentOS 7+
```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
    "registry-mirrors": [
        "https://docker.anyhub.us.kg",
        "https://dockerhub.jobcher.com",
        "https://dockerhub.icu",
        "https://docker.ckyl.me",
        "https://docker.awsl9527.cn"
    ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

```

### DockerHub Proxy站点
```
https://registry.devops-engineer.com.cn/

https://docker.1panel.live/
https://docker.anyhub.us.kg/
https://docker.awsl9527.cn/
https://dockerhub.icu/
https://hub.uuuadc.top[失效]
```

### AtomHub
可信镜像中心，由开放原子开源基金会牵头，联合多家行业伙伴发起，遵循OCI（Open Container Initiative，以下简称“OCI”）容器镜像标准，
旨在为开发者提供开放中立、安全可信、高效便捷的新一代开源容器镜像中心.

目前只有336个镜像，一些基础的镜像可以从这个平台获取。

```
https://atomhub.openatom.cn/
```

### 参考地址
[Docker Hub 镜像加速器](https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6)
[AtomHub开源容器镜像中心](https://atomhub.openatom.cn/)
