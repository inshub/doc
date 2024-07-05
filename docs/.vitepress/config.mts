import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
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

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
