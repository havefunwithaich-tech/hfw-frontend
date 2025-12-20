// hq-frontend/pages/api/stripe/get-session.js

import stripe from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Secret Keyを使用してStripeからセッションの詳細を取得
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 成功時、セッション情報をクライアントに返す
    res.status(200).json(session);

  } catch (error) {
    console.error('❌ Stripe Get Session Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve Stripe session.' });
  }
}
