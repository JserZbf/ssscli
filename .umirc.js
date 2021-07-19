import { resolve } from 'path';

export const TARGETS = {
  dev: {
    ems: 'http://172.17.40.154:9500',
  },
};
const TARGET = TARGETS[process.env.PROXY_TARGET] || {};
// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  base: '/ems/',
  proxy: {
    context: (pathname, req) => {
      return req.headers['x-requested-with'] === 'XMLHttpRequest';
    },
    target: TARGET.ems,
    changeOrigin: true,
    ws: true,
    onProxyReqWs: (proxyReq) => {
      proxyReq.setHeader('origin', TARGET.ems);
    },
    secure: false,
    // 需要转发的API前缀
  },
  hash: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: { webpackChunkName: true },
        title: 'ems',
        dll: true,
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
        headScripts: [
          // header里面插入script脚本
        ].filter((i) => i),
        links: [{ rel: 'stylesheet', href: '//at.alicdn.com/t/font_2681856_xb9arcks7y.css' }],
      },
    ],
    'umi-plugin-build-version',
  ],
  chainWebpack(config) {
    config.resolve.modules.add(resolve(__dirname, './src'));
    config.module
      .rule('worker-loader')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('file-loader');
  },
  define: {
    'process.env.dev': 'Y',
  },
};
