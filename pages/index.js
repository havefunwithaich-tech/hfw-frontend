import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// ▼▼▼ 唯一の窓口: knockDoor ▼▼▼
/**
 * 唯一の仕事：お土産を持ってWorkerのドアを叩く
 * @param {Object} souvenir - { content_id: "...", type: "..." } または {}
 */
export async function knockDoor(souvenir = {}) {
  // 1. ドアを叩く (Always POST)
  const response = fetch('/api/', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-HFW-Issue-Key': 'IL041'
  },
  body: JSON.stringify(souvenir),
});

  // 2. 門前払いされたら帰る
  if (!response.ok) {
    console.error("追い返されました: ", response.status);
    return null;
  }

  // 3. 渡されたものを確認する
  const contentType = response.headers.get("content-type");

  if (contentType && (contentType.includes("video") || contentType.includes("image"))) {
    // 現物支給の場合：ブラウザが表示できるURLに変換して渡す
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } else {
    // 情報支給の場合：JSONとして読み取って渡す
    return await response.json();
  }
}

// ▼▼▼ SSG: 記事リストデータ取得 (ここはローカルファイル読み込みのみ) ▼▼▼
export async function getStaticProps() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  
  if (!fs.existsSync(articlesDir)) {
    return { props: { posts: [] } };
  }

  const filenames = fs.readdirSync(articlesDir);
  const posts = filenames
    .filter((filename) => filename.endsWith('.mdx'))
    .map((filename) => {
      const filePath = path.join(articlesDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      const slug = filename.replace('.mdx', '');

      return {
        slug,
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        content: content,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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

// ▼▼▼ SecureImage (knockDoorを使用) ▼▼▼
const SecureImage = ({ contentId, alt, className }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!contentId) return;

    let active = true;
    const fetchImage = async () => {
      // お土産作成 { content_id: "...", type: "image" }
      const url = await knockDoor({ content_id: contentId, type: "image" });
      
      if (url && active) {
        setObjectUrl(url);
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contentId]);

  if (!objectUrl) return <div className="no-image">Loading...</div>;

  return <img src={objectUrl} alt={alt} className={className} />;
};

export default function Articles({ posts }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [heroImageSrc, setHeroImageSrc] = useState(null);

  const showMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const HERO_ID = "IL041";
   
  // ヒーロー画像の取得
  useEffect(() => {
    const fetchHero = async () => {
      // お土産作成 { content_id: "IL041", type: "image" }
      const url = await knockDoor({ content_id: HERO_ID, type: "image" });
      if (url) {
        setHeroImageSrc(url);
      }
    };

    fetchHero();

    return () => {
      if (heroImageSrc) URL.revokeObjectURL(heroImageSrc);
    };
  }, []); 

  return (
    <div className="main-container"> 
      <section className="hero-section">
        <div className="hero-bg">
          {heroImageSrc && (
            <img 
              src={heroImageSrc} 
              alt="Hero IL041" 
              className="hero-img" 
            />
          )}
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <div className="hero-frame">
            <p className="hero-title">Pirate</p>
            <h1 className="hero-title">havefunwithAIch v1.3</h1>
            <p className="hero-subtitle">NO FLAG LOWERED</p>
          </div>
        </div>
      </section>

      <div className="articles-container">
        <div className="articles-grid">
          {posts.slice(0, visibleCount).map((post) => (
            <Link href={`/articles/${post.slug}`} key={post.slug} legacyBehavior>
              <a className="article-card-link">
                <div className="article-card">
                  <div className="image-wrapper">
                     {/* 画像取得コンポーネントへIDを渡す */}
                     <SecureImage 
                       contentId={post.slug} 
                       alt={post.title} 
                       className="article-image" 
                     />
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
        {visibleCount < posts.length && (
          <div className="load-more-container">
            <button onClick={showMore} className="load-more-btn">
              Load More
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .main-container { background-color: #000; color: #fff; }
        .hero-section { position: relative; width: 100%; height: min(100vh, 720px); min-height: 500px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; animation: fadeIn 1s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%); z-index: 1; }
        .hero-content-wrapper { position: relative; z-index: 10; width: 100%; display: flex; justify-content: center; }
        .hero-frame { border: 3px solid rgba(255, 255, 255, 0.8); padding: 40px 60px; text-align: center; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(5px); max-width: 800px; width: 90%; }
        .hero-title { font-size: 3.5rem; margin: 0; font-weight: 800; color: #fff; text-shadow: 0 4px 10px rgba(0,0,0,0.8); }
        .hero-subtitle { font-size: 1.2rem; margin-top: 20px; color: #ddd; letter-spacing: 0.2em; }
        @media (max-width: 768px) { 
          .hero-title { font-size: 1.6rem; word-break: break-word; } 
          .hero-subtitle { font-size: 0.8rem; margin-top: 10px; letter-spacing: 0.1em; }
          .hero-frame { padding: 20px 10px; width: 95%; } 
        }
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