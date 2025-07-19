import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const en = defineConfig({
  lang: 'en-US',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/advanced/': { base: '/advanced/', items: sidebarAdvanced() },
      '/research/': { base: '/research/', items: sidebarResearch() }
    },

    editLink: {
      pattern: 'https://github.com/Angry-ETH/dasbook/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present AngryETH'
    }
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'guide',
      link: '/guide/concept',
      activeMatch: '/guide/'
    },
    {
      text: 'advanced',
      link: '/advanced/network/das-network-design',
      activeMatch: '/advanced/'
    },
    {
      text: 'research',
      link: '/research/getting-started',
      activeMatch: '/research/'
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '指南',
      collapsed: false,
      items: [
        { text: '概念', link: '/concept' },
        { text: '编码', link: '/encoding' },
        { text: '应用', link: '/application' }
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
            { text: 'DAS 网络设计', link: '/network/das-network-design' },
            { text: 'DHT', link: '/network/dht' },
            { text: 'Gossip', link: '/network/gossip' }
          ]
        },
        {
          text: '编码',
          items: [
            { text: 'Reed-Solomon Code', link: '/encoding/reed-solomon-code' },
            { text: '数据矩阵', link: '/encoding/data-matrix' },
            { text: '分布式生成', link: '/encoding/distributed-generation' }
          ]
        },
        {
          text: '密码学',
          items: [
            { text: '椭圆曲线加密', link: '/cryptography/elliptic-curve-cryptography' },
            { text: '椭圆曲线应用', link: '/cryptography/elliptic-curve-applications' },
            { text: '椭圆曲线配对', link: '/cryptography/elliptic-curve-pairing' },
            { text: 'Weil 配对', link: '/cryptography/weil-pairing' },
            { text: 'Tate 配对', link: '/cryptography/tate-pairing' },
            { text: 'Miller 算法', link: '/cryptography/miller-algorithm' },
            { text: '多项式承诺', link: '/cryptography/polynomial-commitment' }
          ]
        },
        { text: 'PeerDAS', link: '/peerdas' }
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
          link: '/research/getting-started'
        },
        {
          text: '安全性',
          items: [
            { text: '安全假设', link: '/security/security-assumptions' },
            { text: '威胁模型', link: '/security/threat-model' }
          ]
        },
        {
          text: '方案设计',
          items: [
            { text: '网络拓扑', link: '/design/network-topology' },
            { text: '数据分发', link: '/design/data-dissemination' },
            { text: '采样策略', link: '/design/sampling-strategies' }
          ]
        },
        {
          text: '密码学和编码',
          items: [
            { text: 'RLNC', link: '/cryptography-and-coding/rlnc' }
          ]
        }
      ]
    }
  ]
}