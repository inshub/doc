# Docker快速构建测试环境

使用Docker快速构建各种开发测试环境

### MySQL5.7开发环境

```shell
docker run --name=my-db -p3306:3306 -d mysql/mysql-server:5.7
获取临时密码
持久化数据库
-v /opt/mysql/data:/var/lib/mysql
配置文件挂载
-v /opt/data/my.cnf:/etc/my.cnf
docker logs mysql1 2>&1 | grep GENERATED
GENERATED ROOT PASSWORD: Axegh3kAJyDLaRuBemecis&EShOs
docker exec -it my-db mysql -uroot -p
> ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
> create user admin@'%' identified by 'admin';
> grant all privileges on *.* to admin@'%’;
查看创建用户
> select user,host,authentication_string from mysql.user;

重置密码
1.修改mysql skip-grant-tables
2.重启docker restart my-db
3.登陆修改
update mysql.user set authentication_string = password("12121") where user="root";

```

参考地址：

<https://hub.docker.com/r/mysql/mysql-server/>

### PostgreSQL开发环境

```
docker run -d \
--privileged \
--name postgres \
-e POSTGRES_USER='postgres' \
-e POSTGRES_PASSWORD='admin' \
-e PGDATA=/var/lib/postgresql/data/pgdata \
-v /data/apps/postgresql/data:/var/lib/postgresql/data \
-p 5432:5432 \
postgres:14

#登录数据库
psql -U postgres -W
select version();


postgis地理信息空间数据库（镜像里面已经包含了postgresql数据库）

docker run -d \
--privileged \
--name postgis --restart=always \
-e POSTGRES_USER='postgres' \
-e POSTGRES_PASSWORD='passwd' \
-e POSTGRES_DBNAME=gis_db \
-v /data/apps/postgis/data:/var/lib/postgis/data \
-v /data/apps/postgis/postgresql/data:/var/lib/postgresql/data \
-p 5433:5432 \
postgis/postgis:14-3.3

#查看postgis版本
psql -U postgres -W
select version();
#登录数据库

修改配置pg_hba.conf
host    replication     all             192.168.1.110                 trust

select postgis_full_version();

```

参考地址：

https://hub.docker.com/_/postgres

https://registry.hub.docker.com/r/postgis/postgis/

### MongoDB开发环境

```
docker run -itd --name mongo -p 0.0.0.0:27017:27017 mongo --auth


docker run -itd --name mongo3.4 -p 0.0.0.0:27017:27017 mongo:3.4.24 --auth
```

参考地址：

https://www.runoob.com/docker/docker-install-mongodb.html



### RabbitMQ开发环境

```
注意：latest版本没有管理界面，需要管理界面请选择management版本。
docker run -d \
--name=my-rabbitmq \
-p 5672:5672 \
-p 15672:15672  \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=pass  \
-v /data/apps/rabbitmq:/var/lib/rabbitmq \
rabbitmq:3.6.14-management

说明：15672是管理界面端口，5672是服务端口。25672是集群端口

```

参考地址：

https://hub.docker.com/_/rabbitmq

### Redis开发环境

```shell
docker run --name my-redis -p6379:6379 -d redis

--requirepass 'xxx'
```

参考地址：

<https://hub.docker.com/_/redis>

### Nacos开发环境

```shell
docker run -e MODE=standalone -e PREFER_HOST_MODE=hostname --name my-nacos -p 8848:8848 -d nacos/nacos-server:1.2.1

```

参考地址：

<https://github.com/nacos-group/nacos-docker>



### Nginx开发环境

```
docker run --name my-nginx -d -p 9090:80 nginx

nginx映射配置
/etc/nginx/conf.d
docker run --name my-nginx -v /root/confd_nginx:/etc/nginx/conf.d -d -p 9090:80 nginx
#开放映射ip段
-p 8081-8091:8081-8091

```

参考地址：

<https://hub.docker.com/_/nginx>

### OpenResty开发环境

```

docker run -d --name my-openresty -v /root/nginx/openresty:/etc/nginx/conf.d -p 8092-8099:8092-8099 openresty/openresty:1.21.4.1-centos7
#开放映射ip段
-p 8092-8099:8092-8099

```

参考地址：

https://hub.docker.com/r/openresty/openresty

### Grafana开发环境

```shell
docker run -d --name=my-grafana -p 7000:3000 grafana/grafana:7.3.4

```

参考地址：

<https://hub.docker.com/r/grafana/grafana>



### Prometheus开发环境

```
bind-mount the directory containing prometheus.yml onto /etc/prometheus by running:

docker run -d --name=my-prometheus \
    -p 9090:9090 \
    -v /data/apps/opt/prometheus:/etc/prometheus \
    prom/prometheus
```

参考地址：

<https://prometheus.io/docs/prometheus/latest/installation/>



### MinIO 对象存储服务

MinIO 是一个基于Apache License v2.0开源协议的对象存储服务。它兼容亚马逊S3云存储服务接口，非常适合于存储大容量非结构化的数据，例如图片、视频、日志文件、备份数据和容器/虚拟机镜像等，而一个对象文件可以是任意大小，从几kb到最大5T不等。

MinIO是一个非常轻量的服务,可以很简单的和其他应用的结合，类似 NodeJS, Redis 或者 MySQL。

```
docker run --name=my-minio -d -p 9000:9000 \
  -e "MINIO_ACCESS_KEY=admin" \
  -e "MINIO_SECRET_KEY=admin123" \
  -v /data/apps/data/:/data \
  minio/minio server /data
```

参考地址：

<https://docs.min.io/cn/minio-quickstart-guide.html>



### Jenkins开发环境

```
docker run   -u root   --restart=always   --name my-jenkins   -d   -p 8080:8080   -p 50000:50000   -v /data/jenkins:/var/jenkins_home   -v /var/run/docker.sock:/var/run/docker.sock   -v /usr/local/mvn:/usr/local/maven   -v /usr/local/sonar:/usr/local/sonar   -v /data/apps/dependency-check:/data/apps/dependency-check   -v /root/.ssh:/root/.ssh   jenkinsci/blueocean
```

参考地址：

https://hub.docker.com/_/jenkins/


### ELK开发环境

```
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 \
-e "discovery.type=single-node" \
-v ./elastic/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
-d elasticsearch:7.17.5

```
安装ik分词器
cd /usr/share/elasticsearch/plugins/
elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.17.5/elasticsearch-analysis-ik-7.17.5.zip
exit
docker restart elasticsearch

```
docker run --name kibana --link=elasticsearch:elk-1  -p 5601:5601 -d kibana:7.17.5
docker start kibana

```

elasticsearch.yml配置文件
```
cluster.name: es-cluster
node.name: elk-1
node.master: true
node.data: true
#path.data: /data/apps/elasticsearch/data
#path.logs: /data/apps/elasticsearch/logs
bootstrap.memory_lock: true
network.host: 0.0.0.0
http.port: 9200
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"
discovery.seed_hosts: ["localhost"]
#discovery.zen.minimum_master_nodes: 2
#cluster.initial_master_nodes: ["localhost"]
node.attr.rack_id: rack_one
cluster.routing.allocation.awareness.attributes: rack_id
xpack.security.enabled: false

```


###  docker-registry私用仓库

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
参考地址：
https://hub.docker.com/r/hyper/docker-registry-web/



```
docker run -d \
    --name strapi  \
    -e NODE_ENV=development \
    -p 5001:1337 \
    -v ${PWD}/uploads:/app/public/uploads \
    -v ${PWD}/src-data:/app/src\
    -v ${PWD}/db:/app/.tmp \
    kodashen/lingmu-app:sqllite-latest
```