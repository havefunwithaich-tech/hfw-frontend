// hq-frontend/lib/stripe.js

import Stripe from 'stripe';

// シークレットキーを使ってStripeを初期化
// このファイルはNode.js環境（サーバーサイド）でのみ使用されます
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Stripeの最新安定版APIバージョンを使用
});

export default stripe;