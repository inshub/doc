# Python3


### 安装Python3

[Python3官网](https://www.python.org/downloads/)

```
brew install python3
```

### Pyenv

Python环境管理工具
```
brew install pyenv
```

**pyenv常用命令**
```
寻找 python 的时候优先级
shell > local > global

pyenv global 2.7.3  # 设置全局的 Python 版本，通过将版本号写入 ~/.pyenv/version 文件的方式。
pyenv local 2.7.3 # 设置 Python 本地版本，通过将版本号写入当前目录下的 .python-version 文件的方式。


pyenv install 3.8.5 # 安装 python
pyenv uninstall 3.8.5 # 卸载 python

pyenv versions # 查看本机安装版本
pyenv install --list # 查看可安装版本

```



### UV


```
curl -LsSf https://astral.sh/uv/install.sh | sh
```


**uv常用命令**
```
# 查看所有的可安装版本
uv python list
# 仅查看所有的已安装版本
uv python list --installed
# 安装制定版本python
uv python install 3.13
#切换 Python 版本
uv python pin 3.13

# 默认安装最新版本的依赖
uv add requests
# 安装指定版本的依赖
uv add requests@1.0.0
# 删除
uv remove requests

```



### Poetry

```
curl -sSL https://install.python-poetry.org | python3 -

```
