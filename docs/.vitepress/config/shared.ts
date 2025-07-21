import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader
} from 'vitepress-plugin-group-icons'
import { search as zhSearch } from './zh'

export const shared = defineConfig({
  title: 'DASBook',

  // rewrites: {
  //   'en/:rest*': ':rest*'
  // },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  markdown: {
    math: true,
    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, '[!code')
        }
      }
    ],
    config(md) {
      // TODO: remove when https://github.com/vuejs/vitepress/issues/4431 is fixed
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const { localeIndex = 'root' } = env
        const codeCopyButtonTitle = (() => {
          switch (localeIndex) {
            case 'es':
              return 'Copiar código'
            case 'fa':
              return 'کپی کد'
            case 'ko':
              return '코드 복사'
            case 'pt':
              return 'Copiar código'
            case 'ru':
              return 'Скопировать код'
            case 'zh':
              return '复制代码'
            default:
              return 'Copy code'
          }
        })()
        return fence(tokens, idx, options, env, self).replace(
          '<button title="Copy Code" class="copy"></button>',
          `<button title="${codeCopyButtonTitle}" class="copy"></button>`
        )
      }
      md.use(groupIconMdPlugin)
    }
  },

  sitemap: {
    hostname: 'https://eth100.wtf',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ETH100-icon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/ETH100-icon-mini.png' }],

    ['meta', { name: 'theme-color', content: '#5f67ee' }],

    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:title', content: 'DASBook | Everything about DAS' }],
    ['meta', { property: 'og:site_name', content: 'DASBook' }],
    ['meta', { property: 'og:url', content: 'https://dasbook.eth100.wtf/' }],
    ['meta', { property: 'og:description', content: "Your living guide to DAS: from core concepts to cutting-edge research, made easy to understand." }],
    ['meta', { property: 'og:image', content: 'https://dasbook.eth100.wtf/eth100-icon.png' }],

    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'DASBook | Everything about DAS' }],
    ['meta', { name: 'twitter:description', content: "Your living guide to DAS: from core concepts to cutting-edge research, made easy to understand." }],
    ['meta', { name: 'twitter:image', content: 'https://dasbook.eth100.wtf/eth100-icon.png' }],
    // [
    //   'script',
    //   { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-CNF7DNTS26' }
    // ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-CNF7DNTS26');`
    ]
  ],

  themeConfig: {
    logo: {
      src: '/ETH100-icon.svg',
      height: 60,
      alt: 'ETH100 Logo'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Angry-ETH/dasbook' },
      { icon: 'twitter', link: 'https://x.com/angryeth_xyz' },
    ],

    search: {
      provider: 'algolia',
      options: {
        appId: 'XX5EAVN76F',
        apiKey: '97fc8ea6aa1ef089d5e9bbb7c1dd3068',
        indexName: 'DASBook',
        locales: {
          ...zhSearch,
        }
      }
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          vitepress: localIconLoader(
            import.meta.url,
            '../../public/ETH100-icon.svg'
          ),
          firebase: 'logos:firebase'
        }
      })
    ]
  }
})