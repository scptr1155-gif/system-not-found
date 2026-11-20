import crypto from 'crypto';
import { sign, verifyToken, safeEq } from '../../lib/token.js';
import { cfg } from '../../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST gerekli' });

  const { challenge, answer } = req.body || {};
  const p = verifyToken(challenge);
  if (!p) return res.status(400).json({ error: 'süre doldu, yenile' });

  const expected = crypto
    .createHmac('sha256', cfg.signSecret)
    .update(`${p.nonce}:${Number(answer)}`)
    .digest('base64url');

  if (!safeEq(expected, p.answerHash)) {
    return res.status(403).json({ error: 'yanlış cevap' });
  }

  const pass = sign({
    botId: p.botId,
    jti: crypto.randomUUID(),
    exp: Date.now() + 300_000,
  });
  res.json({ pass });
}
