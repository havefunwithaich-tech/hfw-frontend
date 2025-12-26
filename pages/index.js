import Link from 'next/link';
import { useState } from 'react';

// fs, path, matter は Cloudflareビルドで事故の元なので削除
// import fs from 'fs';
// import path from 'path';
// import matter from 'gray-matter';

export async function getStaticProps() {
  // 【V1.3修正】
  // ファイルシステムやDBを見に行かず、固定の「メンテナンス用データ」を配列で作る
  // これならサーバー環境に依存せず、100%ビルドが通ります。
  
  const posts = [
    {
      slug: 'maintenance-info',
      title: 'Currently under maintenance',
      date: new Date().toISOString(),
      // HTMLタグを含めておけば createSnippet も動きます
      content: '<p>We are currently performing system maintenance. The HFW server will be back online shortly. </p>',
      featuredImage: null, // 画像もなし（エラー回避）
    },
    // 必要ならここに2つ目のダミー記事を追加してもOK
  ];

  return {
    props: {
      posts: posts,
    },
  };
}

const createSnippet = (htmlContent, length = 150) => {
  if (!htmlContent) return "";
  let text = htmlContent.replace(/<[^>]+>/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > length ? text.substring(0, length) + '...' : text;
};

export default function Articles({ posts }) {
  const [visibleCount, setVisibleCount] = useState(6);

  const showMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="articles-container">
      <h1 className="page-title">Articles (Backup Mode)</h1>

      <div className="articles-grid">
        {posts.slice(0, visibleCount).map((post) => (
          <Link href={`/articles/${post.slug}`} key={post.slug} legacyBehavior>
            <a className="article-card-link">
              <div className="article-card">
                <div className="image-wrapper">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.title}
                      className="article-image"
                    />
                  ) : (
                    <div className="no-image">Maintenance</div>
                  )}
                </div>

                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  
                  <div className="card-excerpt">
                      {createSnippet(post.content, 200)}
                  </div>

                  <p className="card-date">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {/* 記事数が少ないのでLoad Moreは出ないはずですが、ロジックは残しておきます */}
      {visibleCount < posts.length && (
        <div className="load-more-container">
          <button onClick={showMore} className="load-more-btn">
            Load More
          </button>
        </div>
      )}

      <style jsx>{`
        .articles-container {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: sans-serif;
          box-sizing: border-box; 
          width: 100%;
        }
        .page-title {
          text-align: center;
          margin-bottom: 40px;
          font-size: 2.5rem;
          color: #fff;
        }
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
          width: 100%;
        }
        .article-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .article-card {
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          background-color: #1a1a1a;
          color: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .article-card:hover {
          transform: translateY(-5px);
        }
        .image-wrapper {
          height: 200px;
          background-color: #222;
          overflow: hidden;
          width: 100%;
        }
        .article-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: bold;
          background: #2a2a2a;
        }
        .card-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          margin: 0 0 10px 0;
          font-size: 1.2rem;
          line-height: 1.4;
          color: #fff;
        }
        .card-excerpt {
          font-size: 0.9rem;
          color: #bbb;
          margin: 0;
          flex: 1;
          overflow: hidden;
          line-height: 1.6;
        }
        .card-date {
          font-size: 0.8rem;
          color: #666;
          margin-top: 15px;
        }
        .load-more-container {
          text-align: center;
          margin-top: 50px;
        }
        .load-more-btn {
          padding: 15px 40px;
          font-size: 1rem;
          background-color: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 30px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .load-more-btn:hover {
          background-color: #444;
        }
        @media (max-width: 600px) {
          .articles-container {
            padding: 40px 15px; 
          }
          .articles-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .page-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}