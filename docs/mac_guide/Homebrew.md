# brew

### 安装 Homebrew

[brew官网](https://brew.sh/zh-cn/)
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

brew安装程序所在路径：
- 配置文件在/usr/local/etc中
- 安装文件在/usr/local/Cellar中
- 二进制可执行程序的软连接在/usr/local/bin中


### 安装程序指定版本
- 官方大版本
```
brew search mysql
brew install mysql@5.7
```
- Git 历史版本
```
先通过 formulae.brew.sh/ 找到软件信息, 如我需要找到 folly 的历史版本, 可按照下面的步骤.

Formula code: wget.rb on GitHub -> 获取Formula/w/wget.rb到本地 -> brew install wget.rb
```