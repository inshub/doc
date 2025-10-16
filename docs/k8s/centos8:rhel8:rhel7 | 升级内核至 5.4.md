### 内核版本介绍
| 内核版本      |  名词解释     | 含义      |
| --- | --- | --- |
|  lt      |  longterm 的缩写     |   长期维护版     |
|  ml     |  mainline 的缩写     |   最新稳定版     |

### 安装 ELRepo 仓库
ELRepo 提供兼容 RHEL 8 的更新内核。
1. 导入 ELRepo 的 GPG 密钥
```
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
```

2. 安装 ELRepo 发布包
```
sudo dnf install https://www.elrepo.org/elrepo-release-8.el8.elrepo.noarch.rpm
```

3. 查看可更新内核版本
```
dnf --disablerepo="*" --enablerepo="elrepo-kernel" list available
```

### 安装新内核 (kernel-lt，版本 6.16+)
1. 安装 kernel-lt
```
dnf --enablerepo=elrepo-kernel install kernel-lt kernel-lt-devel kernel-lt-core -y
```


rhel7 升级内核与rhel8 区别，官方elrepo rhel7无对应的rpm内核包，手动下载安装。

```
下载kernel-lt-5.4.278-1.el7.elrepo.x86_64
https://mirrors.coreix.net/elrepo-archive-archive/kernel/el7/x86_64/RPMS/

kernel-lt-5.4.278-1.el7.elrepo.x86_64.rpm  kernel-lt-devel-5.4.278-1.el7.elrepo.x86_64.rpm

安装kernel
yum localinstall -y kernel-lt-devel-5.4.278-1.el7.elrepo.x86_64.rpm kernel-lt-5.4.278-1.el7.elrepo.x86_64.rpm

查看kernel安装版本
rpm -qa | grep kernel

查看所有可用内核启动项
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg

grub2-set-default 0

```

2. 验证安装
```
rpm -qa | grep kernel

kernel-lt-core-5.4.300-1.el8.elrepo.x86_64
kernel-lt-modules-5.4.300-1.el8.elrepo.x86_64
kernel-lt-devel-5.4.300-1.el8.elrepo.x86_64
kernel-lt-5.4.300-1.el8.elrepo.x86_64

```

### 更新启动引导加载器 (GRUB)

1. 先列出可用内核：
```
sudo grubby --info=ALL | grep ^kernel
```

2. 设置新内核为默认启动项：
```
sudo grubby --set-default /boot/vmlinuz-5.4.300-1.el8.elrepo.x86_64
```
或者使用索引（新内核通常在列表顶部，索引 0）：
`sudo grub2-set-default 0`

3. 重启系统并验证
重启系统：
```
sudo reboot
```

验证新内核是否加载：
```
uname -r
5.4.300-1.el8.elrepo.x86_64
```


### 参考地址
elrepo-archive归档库
https://mirrors.coreix.net/elrepo-archive-archive/kernel/el7/x86_64/RPMS/



