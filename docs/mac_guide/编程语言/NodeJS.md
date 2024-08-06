# Node.js

### 安装nodejs
安装 Node.js 的最佳方式是使用 nvm。
在[nodejs官网](https://nodejs.org/en/download/package-manager)下载并安装即可。

### npm源
由于npm官方的源比较缓慢，替换为国内的npm源。

```
修改为淘宝npm源
npm config set registry https://registry.npmmirror.com
验证命令
npm config get registry
如果返回https://registry.npmmirror.com，说明镜像配置成功。

```
yarn,pmpm都可以使用类似命令/方式。


### 安装pnpm
[pnpm官网](https://pnpm.io/zh/)
直接获取脚本安装
```
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
npm安装pnpm
```
npm install -g pnpm
```
你可以用`pnpm env`命令安装Node.js,你两个就相互卷吧。