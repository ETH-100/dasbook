import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const zh = defineConfig({
  lang: 'zh-Hans',
  description: '关于 DAS 的一切',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/zh/guide/': { base: '/zh/guide/', items: sidebarGuide() },
      '/zh/advanced/': { base: '/zh/advanced/', items: sidebarAdvanced() },
      '/zh/research/': { base: '/zh/research/', items: sidebarResearch() }
    },

    editLink: {
      pattern: 'https://github.com/Angry-ETH/dasbook/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: `版权所有 © 2025-${new Date().getFullYear()} AngryETH`
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '指南',
      link: '/zh/guide/concept',
      activeMatch: '/zh/guide/'
    },
    {
      text: '进阶',
      link: '/zh/advanced/network/das-network-design',
      activeMatch: '/zh/advanced/'
    },
    {
      text: '研究',
      link: '/zh/research/getting-started',
      activeMatch: '/zh/research/'
    },
    {
      text: '捐赠',
      link: 'https://eth100.wtf/zh/donate'
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '指南',
      collapsed: false,
      items: [
        { text: '概念', link: 'concept' },
        { text: '编码', link: 'encoding' },
        { text: '应用', link: 'application' }
      ]
    }
  ]
}

function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '进阶',
      collapsed: false,
      items: [
        {
          text: '网络',
          items: [
            { text: 'DAS 网络设计', link: 'network/das-network-design' },
            { text: 'DHT', link: 'network/dht' },
            { text: 'Gossip', link: 'network/gossip' }
          ]
        },
        {
          text: '密码学',
          items: [
            { text: '椭圆曲线加密', link: 'cryptography/elliptic-curve-cryptography' },
            { text: '椭圆曲线应用', link: 'cryptography/elliptic-curve-applications' },
            { text: '椭圆曲线配对', link: 'cryptography/elliptic-curve-pairing' },
            { text: 'Weil 配对', link: 'cryptography/weil-pairing' },
            { text: 'Tate 配对', link: 'cryptography/tate-pairing' },
            { text: 'Miller 算法', link: 'cryptography/miller-algorithm' },
            { text: '多项式承诺', link: 'cryptography/polynomial-commitment' }
          ]
        },
        {
          text: '编码',
          items: [
            { text: 'Reed-Solomon Code', link: 'encoding/reed-solomon-code' },
            { text: '数据矩阵', link: 'encoding/data-matrix' },
            { text: '分布式生成', link: 'encoding/distributed-generation' }
          ]
        },
        { text: 'PeerDAS', link: 'peerdas' }
      ]
    }
  ]
}

function sidebarResearch(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '研究',
      collapsed: false,
      items: [
        {
          text: '入门',
          link: 'getting-started'
        },
        {
          text: '安全性',
          items: [
            { text: '安全假设', link: 'security/security-assumptions' },
            { text: '威胁模型', link: 'security/threat-model' }
          ]
        },
        {
          text: '方案设计',
          items: [
            { text: '网络拓扑', link: 'design/network-topology' },
            { text: '数据分发', link: 'design/data-dissemination' },
            { text: '采样策略', link: 'design/sampling-strategies' }
          ]
        },
        {
          text: '密码学和编码',
          items: [
            { text: 'RLNC', link: 'cryptography-and-coding/rlnc' }
          ]
        }
      ]
    }
  ]
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  zh: {
    placeholder: '搜索文档',
    translations: {
      button: {
        buttonText: '搜索文档',
        buttonAriaLabel: '搜索文档'
      },
      modal: {
        searchBox: {
          resetButtonTitle: '清除查询条件',
          resetButtonAriaLabel: '清除查询条件',
          cancelButtonText: '取消',
          cancelButtonAriaLabel: '取消'
        },
        startScreen: {
          recentSearchesTitle: '搜索历史',
          noRecentSearchesText: '没有搜索历史',
          saveRecentSearchButtonTitle: '保存至搜索历史',
          removeRecentSearchButtonTitle: '从搜索历史中移除',
          favoriteSearchesTitle: '收藏',
          removeFavoriteSearchButtonTitle: '从收藏中移除'
        },
        errorScreen: {
          titleText: '无法获取结果',
          helpText: '你可能需要检查你的网络连接'
        },
        footer: {
          selectText: '选择',
          navigateText: '切换',
          closeText: '关闭',
          searchByText: '搜索提供者'
        },
        noResultsScreen: {
          noResultsText: '无法找到相关结果',
          suggestedQueryText: '你可以尝试查询',
          reportMissingResultsText: '你认为该查询应该有结果？',
          reportMissingResultsLinkText: '点击反馈'
        }
      }
    }
  }
}