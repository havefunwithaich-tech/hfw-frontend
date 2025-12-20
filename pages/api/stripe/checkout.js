// hq-frontend/pages/api/stripe/checkout.js

import stripe from '../../../lib/stripe'; // Stripeクライアントのインポート (lib/stripe.jsが存在することを前提)

// 💡 Next.jsのAPI Route Handlerを定義
export default async function handler(req, res) {
  // POSTメソッドのみを受け付ける
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { priceId, userId, userEmail } = req.body;

    // 環境変数 NEXT_PUBLIC_SITE_URL は必ず設定してください
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; 

    // 成功時/キャンセル時のリダイレクトURLを設定
    const successUrl = `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/join`;

    // Stripe Checkout Sessionの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // フロントエンドから渡された価格IDを使用
        quantity: 1,
      }],
      mode: 'subscription',
      // Webhookで紐づけに利用するため、顧客情報（特にメールアドレス）を自動でStripeに渡す
      customer_email: userEmail,
      // WebhookでWPのユーザーIDを特定するためのカスタムメタデータ
      metadata: {
        wp_user_id: userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // フロントエンドにStripeの決済URLを返す
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('❌ Stripe Checkout Error:', error.message);
    // 詳細なエラーメッセージをクライアントには返さず、汎用メッセージを返す
    res.status(500).json({ error: 'Failed to create Stripe Checkout Session.' });
  }
}
