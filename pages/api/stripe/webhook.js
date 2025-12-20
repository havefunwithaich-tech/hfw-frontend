// hq-frontend/pages/api/stripe/webhook.js (デバッグ強化版)

import { buffer } from 'micro';
import stripe from '../../../lib/stripe';
import { UPDATE_USER_DATA } from '../../../lib/graphql/mutations';
import { GET_USER_ID_BY_STRIPE_CUSTOMER } from '../../../lib/graphql/queries';

export const config = {
    api: {
        bodyParser: false,
    },
};

const endpoint = process.env.WP_GRAPHQL_URL;
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
        console.error('❌ GraphQL Error:', JSON.stringify(result.errors));
        return null;
    }
    return result.data;
}

// ユーザーIDを検索する関数
async function findWPUserId(stripeCustomerId) {
    if (!stripeCustomerId) return null;
    console.log(`🔎 Querying WP for Stripe ID: ${stripeCustomerId}`);
    const data = await sendGraphQLQuery(GET_USER_ID_BY_STRIPE_CUSTOMER, { stripeCustomerId });
    if (data && data.user) {
        return data.user.databaseId;
    }
    return null;
}

async function sendGraphQLMutation(userId, stripeData) {
    console.log(`📝 Mutating WP User ${userId} with data:`, stripeData);
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

    // 🚨 ここで必ずログを出す（これで何が来ているか100%分かります）
    console.log(`🔔 Webhook received! Type: ${event.type}`);

    const dataObject = event.data.object;
    let wp_user_database_id = null;
    let customerId = null;
    let statusToUpdate = 'active';

    switch (event.type) {
        case 'checkout.session.completed':
            console.log(`➡️ Processing Checkout Session Completed`);
            customerId = dataObject.customer;
            if (dataObject.metadata && dataObject.metadata.wp_user_id) {
                wp_user_database_id = dataObject.metadata.wp_user_id;
                console.log(`✅ Found WP ID from metadata: ${wp_user_database_id}`);
            } else {
                console.warn(`⚠️ No WP ID in metadata for this session.`);
            }
            statusToUpdate = 'active';
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'invoice.payment_failed':
            console.log(`➡️ Processing Subscription Update: ${event.type}`);
            customerId = dataObject.customer;
            statusToUpdate = (event.type === 'customer.subscription.deleted') ? 'cancelled' : dataObject.status;
            wp_user_database_id = await findWPUserId(customerId);
            break;

        // 💡 その他のイベントもログに出して無視する
        default:
            console.log(`ℹ️ Ignored event type: ${event.type}`);
            return res.json({ received: true });
    }

    if (!wp_user_database_id) {
        console.error(`❌ WP user not found (or metadata missing) for Stripe Customer ID: ${customerId}`);
        return res.status(200).json({ received: true, message: "User not found" });
    }

    const success = await sendGraphQLMutation(wp_user_database_id, {
        stripeCustomerId: customerId,
        subscriptionStatus: statusToUpdate,
    });

    if (success) {
        console.log(`✅ User ${wp_user_database_id} updated successfully!`);
    } else {
        console.error(`❌ Failed to update user ${wp_user_database_id}`);
    }

    res.json({ received: true });
}
