import crypto from 'crypto';
import { readDb } from '../../lib/github.js';
import { sign } from '../../lib/token.js';
import { cfg } from '../../lib/config.js';

export default async function handler(req, res) {
  const webKey = String(req.query.webKey || '');
  if (!webKey.startsWith('wk_')) return res.status(400).json({ error: 'geçersiz istek' });

  let data;
  try {
    ({ data } = await readDb());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'sunucu hatası' });
  }

  const bot = Object.values(data.bots).find((b) => b.webKey === webKey && b.active);
  if (!bot) return res.status(403).json({ error: 'geçersiz web key' });

  const a = crypto.randomInt(1, 20);
  const b = crypto.randomInt(1, 20);
  const nonce = crypto.randomBytes(12).toString('base64url');
  const answerHash = crypto
    .createHmac('sha256', cfg.signSecret)
    .update(`${nonce}:${a + b}`)
    .digest('base64url');

  res.json({
    question: `${a} + ${b} = ?`,
    challenge: sign({ nonce, answerHash, botId: bot.botId, exp: Date.now() + 120_000 }),
  });
}
