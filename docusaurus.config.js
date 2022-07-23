// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '快点技术手册',
  tagline: '让你的运维更简单！',
  url: 'https://support.quickso.cn',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://quickso.cn/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'muzihuaner', // Usually your GitHub org/user name.
  projectName: 'support', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/muzihuaner/support/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/muzihuaner/support/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '快点技术手册',
        logo: {
          alt: '快点技术手册',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '文档',
          },
          {to: '/blog', label: '博客', position: 'left'},
          {
            href: 'https://github.com/muzihuaner/support',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '本站',
            items: [
              {
                label: '文档',
                to: '/docs/intro',
              },
              {
                label: '博客',
                to: '/blog',
              },{
                label: '关于',
                to: '/docs/about',
              },{
                label: '技术支持',
                to: '/docs/helpdesk',
              },
            ],
          },
          {
            title: '关注我们',
            items: [
              {
                label: '哔哩哔哩',
                href: 'https://space.bilibili.com/100814804',
              },
              {
                label: '欢哥科技官方网站',
                href: 'https://huangetech.github.io',
              },
            ],
          },
          {
            title: '友情链接',
            items: [
              {
                label: '快点搜',
                to: 'https://quickso.cn',
              },
              {
                label: 'QuickCDN',
                href: 'https://cdn.quickso.cn/',
              },
              {
                label: '快点开源镜像站',
                href: 'https://mirrors.quickso.cn/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 欢哥科技 `,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,

      },
    }),
};

module.exports = config;
