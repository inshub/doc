# Sublime Text

[sublimetext](https://www.sublimetext.com/)

### 用户设置
通过Preferences——settings进入用户设置菜单
```
    "font_size": 17, //字体大小
    "font_face": "Courier New", //高亮编辑中的那一行
    "draw_minimap_border": true, // 代码地图(右侧缩略图)是否加上边框
    "save_on_focus_lost": true, // 失焦立即保存
    "highlight_line": true, // 当前行高亮
    "show_encoding": true, // 窗口右下角显示打开文件的编码
    "word_wrap": false, // 自动换行
    "overlay_scroll_bars": "enabled", // 滚动条自动隐藏显示
    "fade_fold_buttons": false, // 显示行号右侧的代码段闭合展开三角号
    "show_full_path": true, //显示全路径
    "trim_trailing_white_space_on_save": true, //保存的时候把无用的空格去掉
    "rulers": [
        80
    ],
    "preview_on_click": false,// 默认在一个新的tab 打开文件
    "open_files_in_new_window": false,// 双击文件 在tab里打开 不是window
    "tab_size": 4, //Tab转换  换4个空格 下一行也是，一共两个配置
    "translate_tabs_to_spaces": true,
    "scroll_past_end": true, //要不要滚过头
    "show_line_endings": true,
    "bold_folder_labels": true, //加粗文件夹名称
    "ignored_packages":
    [
        "Vintage"
    ],
    "theme": "Material-Theme.sublime-theme",
    "color_scheme": "Packages/User/SublimeLinter/Mariana (SL).tmTheme",
```

**设置显示打开文件**
```
View -> Side Bar -> Show Side Bar
```

### Package Control Commands 找不到
新版本安装Package Control 找不到不能安装插件
```
/Users/xxx/Library/Application Support/Sublime Text/Installed Packages
```
下载package_control
`https://github.com/wbond/package_control/releases`
Rename the file to Package Control.sublime-package and copy it to Installed Packages.

参考地址
https://github.com/sublimehq/sublime_text/issues/6037