// pages/api/token.js
export const runtime = 'edge'; // Cloudflareで動かすための宣言

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { searchParams } = new URL(req.url);
  const rid = searchParams.get('rid');
  const secret = process.env.GATE_SECRET;

  if (!rid || !secret) {
    return new Response(JSON.stringify({ error: 'Server Configuration Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. Payload作成
    const payload = {
      rid: rid,
      exp: Date.now() + 60 * 1000, 
    };

    // 2. Base64URLエンコード (Bufferを使わない実装)
    const payloadJson = JSON.stringify(payload);
    const payloadStr = arrayBufferToBase64Url(new TextEncoder().encode(payloadJson));

    // 3. HMAC署名 (Web Crypto API)
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payloadStr)
    );

    const signature = arrayBufferToBase64Url(signatureBuf);

    // 4. 結合
    const token = `${payloadStr}.${signature}`;

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Token Generation Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ヘルパー: ArrayBuffer -> Base64URL string
function arrayBufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}