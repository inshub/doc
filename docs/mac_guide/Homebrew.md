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


### brew国内镜像
 在.zshrc 或 .bashrc 增加
 ```
# brew
export HOMEBREW_NO_ENV_HINTS=true
export HOMEBREW_NO_AUTO_UPDATE="true"
export HOMEBREW_INSTALL_FROM_API=1
export HOMEBREW_API_DOMAIN="https://mirrors.aliyun.com/homebrew-bottles/api"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.aliyun.com/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.aliyun.com/homebrew/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.aliyun.com/homebrew/homebrew-bottles"

 ```

### brew 常用命令
```
brew update 更新 Homebrew
brew search package 搜索软件包
brew install package 安装软件包
brew uninstall package 卸载软件包
brew upgrade 升级所有软件包
brew upgrade package 升级指定软件包
brew list 列出已安装的软件包列表
brew services command package 管理 brew 安装软件包
brew services list 列出 brew 管理运行的服务
brew info package 查看软件包信息
brew deps package 列出软件包的依赖关系
brew help 查看帮助
brew cleanup 清除过时软件包
brew link package 创建软件包符号链接
brew unlink package 取消软件包符号链接
brew doctor 检查系统是否存在问题
```

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


