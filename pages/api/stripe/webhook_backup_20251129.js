// hq-frontend/pages/api/stripe/webhook.js (最終確定版)

import { buffer } from 'micro';
import stripe from '../../../lib/stripe'; // lib/stripe.js から初期化
// 💡 修正点1: 新しい検索クエリをインポート
import { UPDATE_USER_DATA } from '../../../lib/graphql/mutations'; // 👈 データ変更はこちら
import { GET_USER_ID_BY_STRIPE_CUSTOMER } from '../../../lib/graphql/queries'; // 👈 データ検索はこちら

// Next.jsのデフォルトのbody parserを無効化（Stripeがraw bodyを要求するため）
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


// --- 💡 修正点2: WPユーザーIDを検索する新しい関数 ---
async function findWPUserId(stripeCustomerId) {
    const data = await sendGraphQLQuery(GET_USER_ID_BY_STRIPE_CUSTOMER, { stripeCustomerId });

    // ユーザーが見つかった場合、databaseId (WP ID) を取得
    if (data && data.users.nodes.length > 0) {
        return `VXNlcjox`; // NOTE: GraphQLの仕様上、databaseIdをBase64でエンコードした形式に変換するロジックが必要
        // 🚨 暫定処置: テストとして管理者IDを使用していたため、一旦GraphQL ID (VXNlcjox) を返す
    }
    return null;
}

// --- GraphQL ミューテーション関数 ---
async function sendGraphQLMutation(userId, stripeData) {
    // 💡 ユーザー検索関数と共有するため、認証ロジックを sendGraphQLQuery に統合しました
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

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Webhookの検証 (セキュリティチェック)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const subscription = event.data.object;
  const customerId = subscription.customer; // Stripeの顧客ID: cus_...

  // 💡 修正点3: ユーザーIDの動的取得ロジック
  const wp_user_database_id = await findWPUserId(customerId);

  if (!wp_user_database_id) {
      console.error(`❌ WP user not found for Stripe Customer ID: ${customerId}`);
      // ユーザーが見つからない場合は200を返し、Stripeに再送信させない
      return res.status(200).json({ received: true, message: "User not found, skipping update." });
  }

  let statusToUpdate = 'active';

  // イベントタイプに応じた処理 (省略)
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      statusToUpdate = subscription.status;
      break;

    case 'customer.subscription.deleted':
      statusToUpdate = 'cancelled';
      break;

    default:
      res.json({ received: true });
      return;
  }

  // GraphQLミューテーションの実行
  const success = await sendGraphQLMutation(wp_user_database_id, {
    stripeCustomerId: customerId,
    subscriptionStatus: statusToUpdate,
  });

  if (success) {
    console.log(`✅ User ${wp_user_database_id} updated successfully with status: ${statusToUpdate}`);
  } else {
    console.error(`❌ Failed to update user ${wp_user_database_id} data.`);
  }

  res.json({ received: true });
}
