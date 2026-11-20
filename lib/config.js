export const cfg = {
  owner: process.env.GH_OWNER,
  repo: process.env.GH_REPO,
  path: process.env.GH_DATA_PATH || 'data/bots.json',
  token: process.env.GITHUB_TOKEN,
  pepper: process.env.PEPPER,
  signSecret: process.env.SIGN_SECRET,
};

for (const [k, v] of Object.entries(cfg)) {
  if (!v) console.warn(`[config] eksik ortam değişkeni: ${k}`);
}
