import { GraphQLClient, gql } from 'graphql-request';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// ★修正: 環境変数ではなく、本番のGraphQLエンドポイントを直接指定
const endpoint = 'https://www.havefunwithaich.com/graphql';

// User-Agentを追加してロボット扱い回避
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'User-Agent': 'Next.js-Client',
  },
});

const GET_ALL_POSTS = gql`
query GetAllPosts {
  posts(first: 1000, where: { orderby: { field: DATE, order: DESC } }) {
    nodes {
      slug
      title
    }
  }
}
`;

const GET_ARTICLE = gql`
query GetArticleBySlug($slug: String!) {
  postBy(slug: $slug) {
    title
    excerpt
    content
    date
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
  }
}
`;

// ==========================================
// getStaticPaths
// ==========================================
export async function getStaticPaths() {
  const data = await graphQLClient.request(GET_ALL_POSTS);

  const paths = data.posts.nodes.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: 'blocking' };
}

// ==========================================
// getStaticProps
// ==========================================
export async function getStaticProps({ params }) {
  const decodedSlug = decodeURIComponent(params.slug);

  try {
    const articleData = await graphQLClient.request(GET_ARTICLE, { slug: decodedSlug });

    if (!articleData.postBy) {
      return { notFound: true };
    }

    const allPostsData = await graphQLClient.request(GET_ALL_POSTS);
    const allPosts = allPostsData.posts.nodes;
    const currentIndex = allPosts.findIndex(post => post.slug === decodedSlug);
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    // 🧹 HTML整形処理
    if (articleData.postBy && articleData.postBy.content) {
      let cleanContent = articleData.postBy.content;
      cleanContent = cleanContent.replace(
        /<figure[^>]*class="[^"]*wp-block-embed[^"]*"[^>]*>\s*<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*(<iframe[^>]*>.*?<\/iframe>)\s*<\/div>\s*<\/figure>/gs,
        '$1'
      );
      cleanContent = cleanContent.replace(
        /<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*(<iframe[^>]*>.*?<\/iframe>)\s*<\/div>/gs,
        '$1'
      );
      cleanContent = cleanContent.replace(
        /<div[^>]*style="[^"]*aspect-ratio[^"]*"[^>]*>\s*(<iframe[^>]*>.*?<\/iframe>)\s*<\/div>/gs,
        '$1'
      );
      articleData.postBy.content = cleanContent;
    }

    return {
      props: {
        article: articleData.postBy || null,
        prevPost: prevPost || null,
        nextPost: nextPost || null,
      },
      revalidate: 3600,
    };
  } catch (err) {
    console.error("Error fetching article:", err);
    return { notFound: true };
  }
}

// ==========================================
// Component
// ==========================================
export default function Article({ article, prevPost, nextPost }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 💬 コメント用ステート
  const [comment, setComment] = useState("");

  // 🔐 門番ロジック (管理者特権 & セッション永続化対応)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      try {
        const storedUserRaw = localStorage.getItem('hq_user');
        
        if (storedUserRaw) {
          const user = JSON.parse(storedUserRaw);
          
          // ★修正ポイント: StripeIDがあるか、もしくは管理者(databaseId === 1)なら許可
          if (user && (user.myStripeId || user.databaseId === 1)) {
            setIsAuthorized(true);
          } else {
            // console.warn("User found but not authorized");
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    // 初回チェック
    checkAuth();

    // 他タブでのログイン状態変更を検知
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // 🎥 iframeラッパー生成ロジック
  useEffect(() => {
    if (!article) return;
    
    const timer = setTimeout(() => {
      const wpWrappers = document.querySelectorAll('.wp-block-embed__wrapper, .wp-block-embed');
      wpWrappers.forEach(w => w.style.display = 'contents');

      const iframes = document.querySelectorAll('.article-body iframe');

      iframes.forEach(iframe => {
        if (iframe.parentElement.classList.contains('custom-video-wrapper')) return;

        let w = parseFloat(iframe.getAttribute('width'));
        let h = parseFloat(iframe.getAttribute('height'));

        if (!w || !h) {
            const rect = iframe.getBoundingClientRect();
            w = rect.width || 16;
            h = rect.height || 9;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-video-wrapper';

        if (h > w) {
            wrapper.classList.add('vertical');
        } else {
            wrapper.classList.add('horizontal');
        }

        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      });

    }, 500);

    return () => clearTimeout(timer);
  }, [article, isAuthorized]);

  if (!article) return <div>Article not found.</div>;

  const imageUrl = article.featuredImage?.node?.sourceUrl;

  const currentUrl = `https://hq.havefunwithaich.com/articles/${article.slug}`;
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(currentUrl);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    const subject = encodeURIComponent(`Comment on: ${article.title}`);
    const body = encodeURIComponent(comment);
    window.location.href = `mailto:info@havefunwithaich.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="content-container" style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', overflowWrap: 'break-word', color: '#fff' }}>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '10px', color: '#fff' }}>{article.title}</h1>
        <p style={{ color: '#aaa', fontStyle: 'italic' }}>
          {new Date(article.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {imageUrl && (
        <div style={{ marginBottom: '50px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <img
            src={imageUrl}
            alt={article.featuredImage?.node?.altText || article.title}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
            <p>Verifying Access...</p>
        </div>
      ) : isAuthorized ? (

        // ✅ 会員向け
        <>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e0e0e0' }}
          />

          {/* シェアボタン */}
          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '15px', fontSize: '0.9rem' }}>Share this article</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                 style={{ padding: '8px 20px', borderRadius: '20px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>
                 X (Twitter)
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                 style={{ padding: '8px 20px', borderRadius: '20px', backgroundColor: '#3b5998', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>
                 Facebook
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                 style={{ padding: '8px 20px', borderRadius: '20px', backgroundColor: '#0077b5', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>
                 LinkedIn
              </a>
            </div>
          </div>

          {/* ナビゲーション */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333' }}>
            {prevPost ? (
              <Link href={`/articles/${prevPost.slug}`} style={{ textDecoration: 'none', color: '#4da3ff', fontWeight: 'bold' }}>
                &laquo; Previous
              </Link>
            ) : <span />}
            {nextPost ? (
              <Link href={`/articles/${nextPost.slug}`} style={{ textDecoration: 'none', color: '#4da3ff', fontWeight: 'bold' }}>
                Next &raquo;
              </Link>
            ) : <span />}
          </div>

          {/* コメントエリア */}
          <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>Leave a Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              style={{
                width: '100%', height: '120px', padding: '15px', borderRadius: '8px',
                border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '1rem',
                marginBottom: '15px', resize: 'vertical'
              }}
            />
            <button
              onClick={handleSendComment}
              style={{
                padding: '12px 30px', backgroundColor: '#0070f3', color: 'white',
                border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
              }}
            >
              Send Comment
            </button>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
              * Submitting will open your email client addressed to info@havefunwithaich.com
            </p>
          </div>

          {/* コンタクトエリア */}
          <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px', backgroundColor: '#111', borderRadius: '10px' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>Need Help or Have Inquiries?</h3>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>We are here to support you.</p>
            <a href="mailto:contact@havefunwithaich.com" style={{
              display: 'inline-block', padding: '12px 30px', border: '1px solid #fff',
              color: '#fff', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Contact Support
            </a>
          </div>
        </>

      ) : (

        // 🔒 非会員向け
        <div>
          <div
            className="article-excerpt"
            dangerouslySetInnerHTML={{ __html: article.excerpt || article.content.substring(0, 300) + '...' }}
            style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e0e0e0' }}
          />

          <div style={{ height: '150px', background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1))', marginTop: '-100px', position: 'relative' }} />

          <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '10px', textAlign: 'center', marginTop: '20px', border: '1px solid #333', color: '#fff' }}>
            <h2 style={{ marginBottom: '10px', color: '#fff' }}>Members Only Content</h2>
            <p style={{ marginBottom: '20px', color: '#ccc' }}>Join HQ Member to unlock full access.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link href="/join" style={{ padding: '12px 30px', backgroundColor: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Join Now ($1/mo)</Link>
              
              {/* ★ここを修正: 元記事に戻れるようにクエリパラメータを付与 */}
              <Link 
                href={`/login?redirect=${encodeURIComponent(router.asPath)}`} 
                style={{ padding: '12px 30px', backgroundColor: 'transparent', color: '#0070f3', border: '1px solid #0070f3', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* 画像 */
        .article-body img { max-width: 100%; height: auto; margin: 30px 0; border-radius: 4px; }

        /* 🔥 動画スタイル 🔥 */
        .article-body video {
            width: 100% !important; max-width: 100% !important; height: auto !important;
            margin: 40px auto; display: block; border-radius: 8px;
        }
        .custom-video-wrapper {
            position: relative; display: block; width: 100%; margin: 40px 0;
            border-radius: 8px; overflow: hidden; background: #000;
        }
        .custom-video-wrapper.horizontal { padding-top: 56.25%; }
        .custom-video-wrapper.vertical { padding-top: 177.77%; max-width: 450px; margin: 40px auto; }
        .custom-video-wrapper iframe {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: 100% !important; border: none !important;
        }
        .wp-block-embed, .wp-block-embed__wrapper { display: contents !important; }

        .article-body h2 { margin-top: 50px; font-size: 1.8rem; color: #fff; }
        .article-body h3 { margin-top: 40px; font-size: 1.5rem; color: #ddd; }
        .article-body p, .article-excerpt p {
            word-break: break-word; overflow-wrap: break-word; margin-bottom: 20px;
        }
        .article-body a { color: #4da3ff; }
      `}</style>

    </div>
  );
}