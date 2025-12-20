// pages/login.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { LOGIN_MUTATION } from '../lib/graphql/mutations';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 'https://hq.havefunwithaich.com/graphql';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { username, password },
        }),
      });

      const json = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      const { authToken, user } = json.data.login;

      // 認証情報を保存
      localStorage.setItem('hq_token', authToken);
      localStorage.setItem('hq_user', JSON.stringify(user));

      // ★ここが修正ポイント: 戻り先があればそこへ、なければトップへ
      const returnUrl = router.query.redirect || '/';
      
      // router.replaceで遷移（履歴に残さない方がログインフローとしては綺麗ですが、どちらでもOK）
      await router.replace(returnUrl);

    } catch (err) {
      console.error(err);

      // 日本語エラーを検知して英語に強制変換するロジック
      let msg = err.message || "";

      // まずHTMLタグを除去
      const cleanMsg = msg.replace(/<[^>]*>?/gm, '');

      if (cleanMsg.includes("メールアドレス") || cleanMsg.includes("ユーザー名") || cleanMsg.includes("不明")) {
        setError("Error: Invalid username or email address.");
      } else if (cleanMsg.includes("パスワード")) {
        setError("Error: The password you entered is incorrect.");
      } else {
        setError(`Error: ${cleanMsg}`);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", fontSize: "16px", backgroundColor: "#0070f3", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* エラー表示エリア */}
      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center", fontWeight: "bold" }}>
          {error}
        </p>
      )}
    </div>
  );
}
