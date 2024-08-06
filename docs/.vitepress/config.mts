import { defineConfig } from 'vitepress';
// auto_sidebar
import { set_sidebar } from './config/set_sidebar.ts';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "知识库",
  description: "学习笔记，日常记录，daily-notes",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Mac', link: '/mac_guide/' },
      { text: 'Docker', link: '/docker/' },
      { text: 'Kubernetes', link: '/k8s/' },
      { text: 'VitePress', link: '/VitePress' },
    ],
    outline: 'deep',
    outlineTitle: '页面目录',
    sidebar: { '/mac_guide': set_sidebar('mac_guide'), '/docker': set_sidebar('docker'), '/k8s': set_sidebar('k8s') },
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/inshub' }
    ]
  },
  ignoreDeadLinks: true
})
