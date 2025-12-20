// hq-frontend/pages/api/stripe/webhook.js

import { buffer } from 'micro';
import stripe from '../../../lib/stripe';

// 💡 更新用: GraphQL Mutation
import { UPDATE_USER_DATA } from '../../../lib/graphql/mutations';
// 💡 検索用: さっき修正した Query
import { GET_USER_ID_BY_STRIPE_CUSTOMER } from '../../../lib/graphql/queries';

export const config = {
    api: {
        bodyParser: false,
    },
};

const endpoint = process.env.WP_GRAPHQL_URL;
// Tokenにダブルクォーテーションがついている前提で処理
const authHeader = Buffer.from(`admin:${process.env.WP_USER_TOKEN}`).toString('base64');
const graphQLHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authHeader}`,
};

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

// ユーザーIDを検索する関数
async function findWPUserId(stripeCustomerId) {
    // IDが空なら検索しない
    if (!stripeCustomerId) return null;

    const data = await sendGraphQLQuery(GET_USER_ID_BY_STRIPE_CUSTOMER, { stripeCustomerId });

    // 新しいクエリ名 "user" に対応
    if (data && data.user) {
        return data.user.databaseId;
    }
    return null;
}

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

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            buf,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const dataObject = event.data.object;
    let wp_user_database_id = null;
    let customerId = null;
    let statusToUpdate = 'active';

    // イベントタイプに応じた処理
    switch (event.type) {
        // ✅ 新規登録時
        case 'checkout.session.completed':
            customerId = dataObject.customer;
            // メタデータからWPユーザーIDを直接取得
            if (dataObject.metadata && dataObject.metadata.wp_user_id) {
                wp_user_database_id = dataObject.metadata.wp_user_id;
                console.log(`✅ Found WP ID from metadata: ${wp_user_database_id}`);
            }
            statusToUpdate = 'active';
            break;

        // ✅ 更新・解約時
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'invoice.payment_failed':
            customerId = dataObject.customer;
            statusToUpdate = (event.type === 'customer.subscription.deleted') ? 'cancelled' : dataObject.status;

            // Stripe IDを使ってWPユーザーを検索
            console.log(`🔍 Searching WP User for Stripe ID: ${customerId}`);
            wp_user_database_id = await findWPUserId(customerId);
            break;

        default:
            return res.json({ received: true });
    }

    if (!wp_user_database_id) {
        console.error(`❌ WP user not found for Stripe Customer ID: ${customerId}`);
        return res.status(200).json({ received: true, message: "User not found, skipping update." });
    }

    // GraphQLミューテーションの実行
    const success = await sendGraphQLMutation(wp_user_database_id, {
        stripeCustomerId: customerId,
        subscriptionStatus: statusToUpdate,
    });

    if (success) {
        console.log(`✅ User ${wp_user_database_id} updated successfully to: ${statusToUpdate}`);
    } else {
        console.error(`❌ Failed to update user ${wp_user_database_id}`);
    }

    res.json({ received: true });
}
