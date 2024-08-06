# VitePress


### VitePress 是什么？
(VitePress)[https://vitepress.dev/zh] 是一个静态站点生成器 (SSG)，专为构建快速、以内容为中心的站点而设计。简而言之，VitePress 获取用 Markdown 编写的内容，对其应用主题，并生成可以轻松部署到任何地方的静态 HTML 页面。


### VitePress 主题
https://www.builtatlightspeed.com/category/vitepress

### VitePress 安装
环境要求：Node.js 18 及以上版本。
Node.js/pnpm环境，参考编程环境[Node.js](xxx)

1. 安装 VitePress 
```
pnpm add -D vitepress

```
2. 使用命令行设置向导，快速构建一个基本项目。
```
pnpm vitepress init

┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./docs
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◆  Theme:
│  ● Default Theme (Out of the box, good-looking docs)
│  ○ Default Theme + Customization
│  ○ Custom Theme
└

```
[官网getting-started](https://vitepress.dev/zh/guide/getting-started)

3. 启动项目
`pnpm run docs:dev`

package.json
```
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:preview": "vitepress preview docs --port 8080" #可修改查看端口
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  },
```

notes:
如果node版本低于18，如为v16。
需要`pnpm init`生成package.json文件。


### 主页修改

- 增加背景
```
在index.md下面直接配置即可
  image:
    src: /bg.svg
    alt: 背景
```

- 首页logo
```
在config.mjs defineConfig themeConfig下面直接配置即可
    // https://vitepress.dev/reference/default-theme-config
    logo: '/ai.svg',

```

- 修改地址栏图标
```
在config.mjs defineConfig下面直接配置即可

head: [["link", { rel: "icon", href: "/logo.svg" }]],

```

- 页脚
在config.mjs defineConfig下面直接配置即可
```

 footer: {
      message: '本导航来自互联网，仅供个人学习参考。',
      copyright: 'Copyright © 2023-present inshub'
    },  //页脚，可按Vue支持格式修改

```

- 关闭dark模式
```
在config.mjs defineConfig下配置

appearance: false,
https://vitepress.dev/zh/reference/site-config#appearance
```

### 设置搜索框
在config.mjs defineConfig themeConfig下面直接配置即可

```
	// 设置搜索框的样式
	search: {
	  provider: "local",
	  options: {
	    translations: {
	      button: {
	        buttonText: "搜索文档",
	        buttonAriaLabel: "搜索文档",
	      },
	      modal: {
	        noResultsText: "无法找到相关结果",
	        resetButtonTitle: "清除查询条件",
	        footer: {
	          selectText: "选择",
	          navigateText: "切换",
	        },
	      },
	    },
	  },
	},
 ```

### Github Pages部署
在github项目目录 .github/workflows下创建文件deploy.yml
注意可能需要修改项目对应的分支。
```
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
#
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行。如果你
  # 使用 `master` 分支作为默认分支，请将其更改为 `master`
  push:
    branches: [main]

  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      # - uses: pnpm/action-setup@v3 # 如果使用 pnpm，请取消注释
      # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci # 或 pnpm install / yarn install / bun install
      - name: Build with VitePress
        run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

### 注意事项
- vitepress部署样式问题
如果遇到没有CSS样式，可能是没有.nojekyll这个文件，不然一些css会被忽略。
添加.nojekyll文件，推送到远程即可。


- VitePress与VuePress的区别
https://vitejs.cn/vitepress/guide/differences-from-vuepress.html


### 使用主题

[主题](https://www.builtatlightspeed.com/category/vitepress)


### icon图标
https://www.iconfont.cn/  <br/>
https://icones.js.org/


### 参考地址
https://www.builtatlightspeed.com/category/vitepress <br/>
https://github.com/Charles7c/charles7c.github.io <br/>
https://juejin.cn/post/7205087401018753081 <br/>
https://github.com/xinlei3166/vitepress-demo