import { UserConfig, DefaultTheme } from 'vitepress'

export default {
    title: 'mlb-controls',
    description: 'mlb controls',
    appearance: 'dark',
    base: '/mlb-controls/',
    head: [
        [
            'link',
            { rel: 'icon', href: '/logo.svg' }
        ]
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        logo: '/logo.svg',
        sidebar: {
            "/guide": {
                "base": "/guide",
                items: [
                    { text: "简介", link: "/" },
                    { text: "安装", link: "/install" },
                    {
                        text: "组件",
                        base: "/guide/controls",
                        collapsed: true,
                        items: [
                            { text: "bto", link: "/bto" },
                            { text: "doodle", link: "/doodle" },
                            { text: "extend", link: "/extend" },
                            { text: "eye", link: "/eye" },
                            { text: "grid", link: "/grid" },
                            { text: "location", link: "/location" },
                            { text: "marker", link: "/marker" },
                            { text: "measure", link: "/measure" },
                            { text: "switch-layer", link: "/switch-layer" },
                            { text: "switch-map", link: "/switch-map" }
                        ]
                    }
                ]
            }
        },
        // nav: [{ 'text': "组件", link: '/controls/' }],
        socialLinks: [{ icon: 'github', link: "https://github.com/giserver/mlb-controls" }],
    }
} as UserConfig<DefaultTheme.Config>