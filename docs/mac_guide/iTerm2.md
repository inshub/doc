# iTerm2

### 什么是iTerm2?
[iTerm2](https://iterm2.com/)是默认终端的替代品，也是目前Mac系统下最好用的终端工具，集颜值和效率于一身。

### 主题包下载
https://iterm2colorschemes.com/
下载后到iterm2中，左上角iTerm2->preferences->Profiles，右侧面板找到Colors选项，右下角展开Color Presets…，拉到最下面，选择import，把下载好的配色主题包下的schemes下的所有.itermcolors文件导入，导入完成后再展开Colors下拉列表，即可选择不同的配色模板。

### 半透明设置
透明度，iterm2中，左上角iTerm2->preferences->Profiles，右侧找到window选项卡，拖动Transparency调整.

### 安装oh-my-zsh

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 安装配置zsh主题
以spaceship主题为例
```
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt"

ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"

修改配置
 ~/.zshrc
#ZSH_THEME="cloud"
ZSH_THEME="spaceship

# 配置 spaceship
SPACESHIP_TIME_SHOW="true" # 显示时间

```

###  终端美化
```
/etc/motd
/**********/**********/**********/**********/**********/**********/
   .--,       .--,
  ( (  \.---./  ) )
   '.__/o   o\__.'
      {=  ^  =}
       >  -  <
      /       \
     //       \\
    //|   .   |\\
    "'\       /'"_.-~^`'-.
       \  _  /--'         `
     ___)( )(___
    (((__) (__)))    高山仰止,景行行止.虽不能至,心向往之。
/**********/**********/**********/**********/**********/**********/

```