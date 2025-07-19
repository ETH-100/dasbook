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
      text: 'Guide',
      link: '/guide/concept',
      activeMatch: '/guide/'
    },
    {
      text: 'Advanced',
      link: '/advanced/network/das-network-design',
      activeMatch: '/advanced/'
    },
    {
      text: 'Research',
      link: '/research/getting-started',
      activeMatch: '/research/'
    },
    {
      text: 'Donate',
      link: 'https://eth100.wtf/donate'
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Guide',
      collapsed: false,
      items: [
        { text: 'Concepts', link: '/concept' },
        { text: 'Encoding', link: '/encoding' },
        { text: 'Applications', link: '/application' }
      ]
    }
  ]
}

function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Advanced',
      collapsed: false,
      items: [
        {
          text: 'Network',
          items: [
            { text: 'DAS Network Design', link: '/network/das-network-design' },
            { text: 'DHT', link: '/network/dht' },
            { text: 'Gossip', link: '/network/gossip' }
          ]
        },
        {
          text: 'Cryptography',
          items: [
            { text: 'Elliptic Curve Cryptography', link: '/cryptography/elliptic-curve-cryptography' },
            { text: 'Elliptic Curve Applications', link: '/cryptography/elliptic-curve-applications' },
            { text: 'Elliptic Curve Pairing', link: '/cryptography/elliptic-curve-pairing' },
            { text: 'Weil Pairing', link: '/cryptography/weil-pairing' },
            { text: 'Tate Pairing', link: '/cryptography/tate-pairing' },
            { text: 'Miller Algorithm', link: '/cryptography/miller-algorithm' },
            { text: 'Polynomial Commitment', link: '/cryptography/polynomial-commitment' }
          ]
        },
        {
          text: 'Encoding',
          items: [
            { text: 'Reed-Solomon Code', link: '/encoding/reed-solomon-code' },
            { text: 'Data Matrix', link: '/encoding/data-matrix' },
            { text: 'Distributed Generation', link: '/encoding/distributed-generation' }
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
      text: 'Research',
      collapsed: false,
      items: [
        {
          text: 'Getting Started',
          link: '/getting-started'
        },
        {
          text: 'Security',
          items: [
            { text: 'Security Assumptions', link: '/security/security-assumptions' },
            { text: 'Threat Model', link: '/security/threat-model' }
          ]
        },
        {
          text: 'Design',
          items: [
            { text: 'Network Topology', link: '/design/network-topology' },
            { text: 'Data Dissemination', link: '/design/data-dissemination' },
            { text: 'Sampling Strategies', link: '/design/sampling-strategies' }
          ]
        },
        {
          text: 'Cryptography & Coding',
          items: [
            { text: 'RLNC', link: '/cryptography-and-coding/rlnc' }
          ]
        }
      ]
    }
  ]
}
