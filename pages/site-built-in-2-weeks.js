import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';

// public フォルダ内の記事ファイルへの相対パス
const ARTICLE_PATH = '/articles/site-built-in-2-weeks.md';

// === メインコンポーネント ===
export default function SiteBuiltInTwoWeeks() {
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // クライアントサイドでの実行時のみ、記事ファイルを fetch で取得
        fetch(ARTICLE_PATH)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${ARTICLE_PATH}: ${res.status}`);
                }
                return res.text(); // ★ raw text として確実に取得
            })
            .then((text) => {
                setMarkdown(text);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Markdown fetch error:", error);
                setMarkdown("## Error Loading Content\nCould not load the article file.");
                setLoading(false);
            });
    }, []); // 最初のレンダリング時のみ実行

    return (
        <>
            <Head>
                <title>HQ Report | Site Built in 2 Weeks</title>
            </Head>

            <div className="article-container">
                {loading ? (
                    <p>Loading article content...</p>
                ) : (
                    // 確実に取得された文字列を ReactMarkdown に渡す
                   <ReactMarkdown
                        components={{
                            img: ({ node, ...props }) => {
                               // パスがルートスラッシュで始まっているか確認し、強制的に絶対パスにする
                              const src = props.src.startsWith('/') ? props.src : `/${props.src}`;
            
                              // ★重要: CSSクラスを適用し、スタイルが当たるようにします
                              return <img src={src} alt={props.alt} className="markdown-image" />;
                            },
                        }}
                 >
                    {markdown}
                 </ReactMarkdown>
                )}
            </div>

            {/* 記事の可読性を上げるための簡易CSS (前回提供したもの) */}
            <style jsx global>{`
                /* グローバルなベーススタイル */
                body {
                    background-color: #000;
                    color: #fff;
                    font-family: sans-serif;
                }
                
                /* 記事コンテナとMarkdown要素へのスタイル適用 */
                .article-container {
                    max-width: 900px;
                    margin: 80px auto;
                    padding: 0 20px;
                    line-height: 1.7;
                }
                .article-container h1 { 
                    font-size: 2.8rem; 
                    margin-top: 40px; 
                    color: #00ccff;
                    border-bottom: 2px solid #00ccff;
                    padding-bottom: 10px;
                }
                /* ★ Markdown画像用の専用CSS (表示とサイズ調整を強制) ★ */
               .article-container .markdown-image {
                   max-width: 100%; /* コンテナからはみ出さない */
                   height: auto;
                   display: block;
                   margin: 40px auto; /* 中央揃えと上下の余白 */
                   object-fit: contain; /* 画像全体が見えるようにする */
                }
                .article-container h2 { 
                    font-size: 1.8rem; 
                    margin-top: 30px; 
                    border-bottom: 1px solid #333; 
                    padding-bottom: 5px; 
                }
                .article-container h3 { 
                    font-size: 1.4rem; 
                    margin-top: 20px; 
                    color: #bbb;
                }
                .article-container p { 
                    margin-bottom: 15px; 
                }
                .article-container ul { 
                    margin: 15px 0 15px 25px; 
                    list-style-type: disc; 
                }
                .article-container li { 
                    margin-bottom: 8px; 
                }
                .article-container strong {
                    color: #00ccff;
                }
            `}</style>
        </>
    );
}