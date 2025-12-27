import crypto from 'crypto';

export default function handler(req, res) {
  // 認証チェック (HQへのアクセス権確認)
  // session check...

  const { rid } = req.query; // Resource ID (例: IL041)
  
  if (!rid) return res.status(400).json({ error: 'Missing rid' });

  // ペイロード作成
  const payload = {
    rid: rid,
    exp: Date.now() + 60 * 1000, // 60秒だけ有効な使い捨てパス
  };
  
  // JSON化してBase64URLエンコード (URLセーフにする)
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // 署名作成 (HMAC-SHA256)
  // 秘密鍵は .env.local の GATE_SECRET
  const signature = crypto
    .createHmac('sha256', process.env.GATE_SECRET)
    .update(payloadStr)
    .digest('base64url');

  // トークン結合 (Payload.Signature)
  const token = `${payloadStr}.${signature}`;

  res.status(200).json({ token });
}