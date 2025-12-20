// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // 💡 貴社のHQサイトのドメインを正確に設定
  siteUrl: process.env.SITE_URL || 'https://hq.havefunwithaich.com',
  generateRobotsTxt: true, // robots.txtも自動生成

  // 💡 不要なページ（APIルートなど）を除外
  exclude: ['/server-sitemap.xml', '/404', '/api/*'],

  // サイトマップの生成場所をNext.jsの出力ディレクトリに設定
  outDir: './out',

  // 💡 WP GraphQLからのデータ取得が非常に遅いため、タイムアウト設定を長くする
  // 貴社の環境でWPの応答が遅い場合に必要な設定
  sitemapSize: 5000,
  priority: 0.7,
  changefreq: 'daily',
};
