import crypto from 'crypto';
import { readDb } from '../lib/github.js';
import { verifyToken, safeEq } from '../lib/token.js';
import { cfg } from '../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { secretKey, pass } = req.body || {};

  const p = verifyToken(pass);
  if (!p) return res.json({ success: false, reason: 'invalid-or-expired' });

  let data;
  try {
    ({ data } = await readDb());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, reason: 'server-error' });
  }

  const bot = data.bots[p.botId];
  if (!bot || !bot.active) return res.json({ success: false, reason: 'bot-inactive' });

  const hash = crypto
    .createHmac('sha256', cfg.pepper)
    .update(String(secretKey || ''))
    .digest('hex');

  if (!safeEq(hash, bot.secretHash)) return res.json({ success: false, reason: 'bad-secret' });

  // TODO: p.jti tekrar kullanım kontrolü (Vercel KV / Upstash ile SET NX EX 300)

  res.json({ success: true, botId: bot.botId, hostname: bot.domain });
}
