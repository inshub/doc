# Docker Hub加速镜像
`hub.docker.com`和国内几家Docker Hub镜像服务平台陆续下架，停止服务。
给使用的同学造成非常大的困扰。
DockerHub镜像无法下载的多种解决方案，汇总了几种目前有效的解决方案，希望能帮助到大家。
因为有些链接有时效性，可以关注文中链接的issue。

### 加速镜像列表【2024年11月28日亲测有效】

|DockerHub镜像仓库  |镜像加速器地址|
| ---- | ---- |
|Docker Proxy 镜像加速|https://dockerpull.org|
|毫秒镜像|docker.1ms.run|
|镜像加速说明|https://docker.1panel.dev|
|镜像加速说明|https://docker.foreverlink.love|
|Docker Hub Container Image Library|https://docker.fxxk.dedyn.io|
|Dockerhub 镜像加速说明|https://docker.xn--6oq72ry9d5zx.cn|
|Dockerhub 镜像加速说明|https://docker.zhai.cm|
|Dockerhub 镜像加速说明|https://docker.5z5f.com|
|Dockerhub 镜像加速说明|https://a.ussh.net|
|Docker Layer ICU 镜像加速|https://docker.cloudlayer.icu|
|链氪镜像-链氪网公益 Docker 镜像站-Docker-DockerHub 国内镜像源加速｜链氪巴士|https://docker.linkedbus.com|
|AtomHub 可信镜像仓库平台（只包含基础镜像，共 336 个）|https://atomhub.openatom.cn|
|DaoCloud 镜像站|https://docker.m.daocloud.io|


### Docker镜像加速站
为了加速镜像拉取，使用以下命令设置registry mirror
支持系统：Ubuntu 16.04+、Debian 8+、CentOS 7+
```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
    "registry-mirrors": [
        "https://docker.anyhub.us.kg",
        "https://dockerhub.icu",
        "https://docker.awsl9527.cn"
    ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

```

### DockerHub Proxy站点
```
https://registry.devops-engineer.com.cn/ 【推荐】
https://docker.cloudlayer.icu 【可用】
https://docker.1panel.live/ 【可用】

https://docker.awsl9527.cn/ 【失效】
https://dockerhub.icu/ 【失效】
https://docker.ckyl.me 【失效】
https://hub.uuuadc.top 【失效】
https://dockerhub.jobcher.com【失效】
https://docker.anyhub.us.kg/ 【失效】
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
