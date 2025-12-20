// hq-frontend/pages/account.js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Account() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { session_id } = router.query;
    if (session_id) {
      // 決済セッションの詳細を取得するための新しいAPIを呼び出す
      fetch(`/api/stripe/get-session?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          setSession(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching session:', error);
          setLoading(false);
        });
    } else if (router.isReady) {
      // session_idがない場合はリダイレクトまたはエラー表示
      setLoading(false);
    }
  }, [router.query, router.isReady]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading payment status...</div>;
  }

  if (session && session.payment_status === 'paid') {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "green" }}>
        <h1>✅ Payment Successful!</h1>
        <p>Thank you for subscribing to HQ Member!</p>
        <p>Your subscription status is being updated (Session ID: {session.id}).</p>
        {/* Webhookが動作すれば、ここで会員コンテンツにアクセス可能になる */}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
      <h1>❌ Payment Failed or Not Found</h1>
      <p>There was an issue processing your subscription. Please contact support.</p>
    </div>
  );
}
