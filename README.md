# bot-verify

Vercel üzerinde çalışan bot doğrulama sistemi. Kayıtlar GitHub reposunda `data/bots.json` dosyasında tutulur.

## Ortam değişkenleri (Vercel)

- GITHUB_TOKEN: system-not-found reposu için fine-grained token (Contents: Read and write)
- GH_OWNER: scptr1155-gif
- GH_REPO: system-not-found
- GH_DATA_PATH: data/bots.json
- PEPPER: rastgele uzun string
- SIGN_SECRET: rastgele uzun string (PEPPER'dan farklı)

## Oyuncu sitesi

<script src="https://SENIN-APP.vercel.app/botverify.js" data-web-key="wk_XXXX"></script>

Sunucu tarafı doğrulama: POST https://SENIN-APP.vercel.app/api/siteverify  body: { secretKey, pass }
