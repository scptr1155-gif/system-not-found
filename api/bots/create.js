import crypto from 'crypto';
import { updateDb } from '../../lib/github.js';
import { cfg } from '../../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST gerekli' });

  const { name, domain } = req.body || {};
  if (!name || !domain) return res.status(400).json({ error: 'name ve domain zorunlu' });

  const botId = crypto.randomUUID();
  const secretKey = 'sk_' + crypto.randomBytes(32).toString('base64url');
  const webKey = 'wk_' + crypto.randomBytes(16).toString('base64url');
  const secretHash = crypto.createHmac('sha256', cfg.pepper).update(secretKey).digest('hex');

  try {
    await updateDb((db) => {
      db.bots[botId] = {
        botId,
        name: String(name).slice(0, 80),
        domain: String(domain).slice(0, 253),
        webKey,
        secretHash,
        active: true,
        createdAt: Date.now(),
      };
      return db;
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'kayıt yapılamadı' });
  }

  res.status(201).json({ botId, webKey, secretKey });
}
