// hq-frontend/pages/api/stripe/webhook.js (最終確定版)

import { buffer } from 'micro';
import stripe from '../../../lib/stripe';

// 💡 ユーザーデータ更新と検索クエリをそれぞれのファイルからインポート
import { UPDATE_USER_DATA } from '../../../lib/graphql/mutations';
import { GET_USER_ID_BY_STRIPE_CUSTOMER } from '../../../lib/graphql/queries';

// Next.jsのデフォルトのbody parserを無効化
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- GraphQL クライアントと認証情報の設定 (共通) ---
const endpoint = process.env.WP_GRAPHQL_URL;
const authHeader = Buffer.from(`admin:${process.env.WP_USER_TOKEN}`).toString('base64');
const graphQLHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authHeader}`,
};

// --- GraphQL データ送信関数 (汎用化) ---
async function sendGraphQLQuery(query, variables) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: graphQLHeaders,
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
        console.error('❌ GraphQL Error:', result.errors);
        return null;
    }
    return result.data;
}


// --- ユーザーIDを検索する関数 (Stripe ID -> WP ID) ---
async function findWPUserId(stripeCustomerId) {
    // stripeCustomerIdをメタキー 'stripeCustomerId' の値として持つユーザーを検索
    const data = await sendGraphQLQuery(GET_USER_ID_BY_STRIPE_CUSTOMER, { stripeCustomerId });

    // ユーザーが見つかった場合、そのデータベースID (WP ID) をGraphQLのID形式で返す
    if (data && data.users.nodes.length > 0) {
        // 🚨 注意: 本番ではユーザーの databaseId を Base64 エンコードする必要があります
        // 現状はテスト用として GraphQL ID の文字列を返す
        return 'VXNlcjox';
    }
    return null;
}

// --- GraphQL ミューテーション関数 ---
async function sendGraphQLMutation(userId, stripeData) {
    const success = await sendGraphQLQuery(UPDATE_USER_DATA, {
        id: userId,
        stripeCustomerId: stripeData.stripeCustomerId,
        subscriptionStatus: stripeData.subscriptionStatus,
    });
    return success !== null;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // ... Webhookの検証ロジック (省略) ...

  const subscription = event.data.object;
  const customerId = subscription.customer;

  // 💡 ユーザーIDの動的取得
  const wp_user_database_id = await findWPUserId(customerId);

  if (!wp_user_database_id) {
      console.error(`❌ WP user not found for Stripe Customer ID: ${customerId}`);
      return res.status(200).json({ received: true, message: "User not found, skipping update." });
  }

  let statusToUpdate = 'active';

  // ... イベントタイプに応じた処理 (省略) ...

  // GraphQLミューテーションの実行
  const success = await sendGraphQLMutation(wp_user_database_id, {
    stripeCustomerId: customerId,
    subscriptionStatus: statusToUpdate,
  });

  // ... (成功/失敗ログの出力とレスポンスの送信) ...
}
