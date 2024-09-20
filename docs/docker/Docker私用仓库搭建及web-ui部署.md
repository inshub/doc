# Docker私用仓库搭建及web-ui部署

使用**docker** 和 **docker-compose** 两种方式部署私有仓库和registry-web

两种方式各有利弊，docker方式部署方便，维护起来相对麻烦点，docker-compose反之。

同时可以通过这个例子，了解和学习怎么将多容器用docker-compose的方式部署管理。

### docker部署私有仓库
registry-srv
```
docker run -d \
    --name registry-srv  \
    -p 5001:5000 \
    -v ./registry:/var/lib/registry \
    registry
```

registry-web

```
docker run -d \
    -it -p 8080:8080 --name registry-web \
    --link registry-srv \
    -e REGISTRY_URL=http://registry-srv:5001/v2 \
    -e REGISTRY_NAME=ip:5001 hyper/docker-registry-web

```

### docker-compose部署私有仓库
docker-compose.yml
registry/registry/srv-config.yml
registry-web/web-config.yml



docker-compose.yml
```
version: '3.1'
services:
  registry-srv:
    image: registry
    ports:
      - 5000:5000
    volumes:
      - ./registry:/var/lib/registry
      - ./registry/srv-config.yml:/etc/docker/registry/config.yml

  registry-web:
    image: hyper/docker-registry-web
    ports:
      - 8000:8080
    volumes:
      - ./registry-web/web-config.yml:/conf/config.yml
    environment:
      - REGISTRY_URL=http://registry-srv:5000/v2
      - REGISTRY_NAME=192.168.11.107:5000

```


srv-config.yml
```
version: 0.1
log:
  fields:
    service: registry
storage:
  delete:
    enabled: true
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
```

web-config.yml
```
registry:
  # Docker registry url
  url: http://192.168.11.107:5000/v2
  # Docker registry fqdn
  name: localhost:5000
  # To allow image delete, should be false
  readonly: false
  auth:
    # Disable authentication
    enabled: false

```



### 上传与下载镜像

- 上传镜像
```
查看本地镜像
docker images |grep nginx

修改镜像地址为本地的私有仓库地址
格式为 docker tag IMAGE[:TAG] [REGISTRY_HOST[:REGISTRY_PORT]/]REPOSITORY[:TAG]。
docker tag nginx:1.19.0-alpine 192.168.2.107:5000/nginx:1.19.0-alpine

docker push 192.168.2.107:5000/nginx:1.19.0-alpine

```

- 下载镜像
```
修改daemon.json
"insecure-registries":["192.168.2.107:5000"]

systemctl daemon-reload

docker pull 192.168.2.107:5000/nginx:1.19.0-alpine

```

### 使用私用仓库

/etc/docker/daemon.json
```
#配置代理地址和私用仓库地址
{
"registry-mirrors": ["https://docker.anyhub.us.kg"],
"insecure-registries":["192.168.2.107:5000"]
}
```

### 参考地址
https://hub.docker.com/r/hyper/docker-registry-web/