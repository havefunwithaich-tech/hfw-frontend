import { GraphQLClient, gql } from 'graphql-request';

export default async function handler(req, res) {
  // 1. エンドポイント設定
  const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 'https://hq.havefunwithaich.com/graphql';
  
  // 2. サーバー側からGraphを取りに行く（CORS関係なし！）
  const client = new GraphQLClient(endpoint, {
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
    },
  });

  const query = gql`
    query GetFreshArticles {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          slug
          title
          date
          content 
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  `;

  try {
    // 3. データを取得
    const data = await client.request(query);
    
    // 4. クライアント（ブラウザ）にJSONとして返す
    res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}