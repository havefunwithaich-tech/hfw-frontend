// hq-frontend/pages/join.js (HQメンバー $1/月 一本化版)

import { useState } from 'react';

export default function Join() {
  const [loading, setLoading] = useState(false);

  // 🔴 テスト用ユーザー情報 (NOTE: 運用時は動的に取得が必要です)
  const user = {
    id: "VXNlcjox", // 管理者のWP ID (テスト用)
    email: "test_user@example.com"
  };

  // 🔴 Stripe価格IDを定義
  // HQメンバー ($1/月) としてBronze IDを使用
  const HQ_MEMBER_PRICE_ID = "price_1SWgs20724S7HbUShLlhHxmt";
  // 将来の拡張用としてSilver IDを定義するが、ボタンは無効化する
  const FUTURE_SILVER_PRICE_ID = "price_1SY7VO0724S7HbUS6nrGH9sV";

  // 決済処理関数をプランIDを受け取るように汎用化
  const handleCheckout = async (priceId) => {
    setLoading(true);

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: priceId,
        userId: user.id,
        userEmail: user.email,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error processing checkout: " + (data.error || JSON.stringify(data)));
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>HQ Member Subscriptions</h1>
      <p>Full access to all SSM contents and supports for an unbeatable price.</p>

      {/* --- 🥇 HQ MEMBER PLAN --- */}
      <div style={{
        marginTop: "40px",
        border: "3px solid #0070f3",
        padding: "20px",
        display: "inline-block",
        margin: "10px",
        borderRadius: "8px"
      }}>
        <h2>HQ Member</h2>
        <p>Full Articles Access + Commenting</p>
        <p style={{fontSize: "24px", fontWeight: "bold", color: "#0070f3"}}>$1/month</p>

        <button
          onClick={() => handleCheckout(HQ_MEMBER_PRICE_ID)}
          disabled={loading}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "15px"
          }}
        >
          {loading ? "Processing..." : "Subscribe HQ Member ($1/mo)"}
        </button>
      </div>

      {/* --- 🥈 FUTURE SILVER PLAN (GREYED OUT) --- */}
      <div style={{
        marginTop: "40px",
        border: "1px solid #ddd",
        padding: "20px",
        display: "inline-block",
        margin: "10px",
        borderRadius: "8px",
        opacity: 0.5, // グレーアウト表示
        pointerEvents: 'none' // クリックを無効化
      }}>
        <h2>Silver Pro Plan (Future)</h2>
        <p>Advanced Consulting & Exclusive Reports</p>
        <p style={{fontSize: "24px", fontWeight: "bold", color: "#666"}}>$5/month</p>
        <button
          disabled={true}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#ccc",
            color: "#666",
            border: "none",
            borderRadius: "5px",
            marginTop: "15px"
          }}
        >
          Coming Soon
        </button>
        <p style={{marginTop: "10px", color: "red"}}>※現在、準備中です</p>
      </div>
    </div>
  );
}
