(function () {
  const script = document.currentScript;
  const webKey = script.dataset.webKey;
  const base = new URL(script.src).origin;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <label style="display:flex;gap:8px;align-items:center;font-family:system-ui">
      <input type="checkbox" id="bv-check"> Ben bot değilim
    </label>
    <input type="hidden" name="bot_pass" id="bv-pass">`;
  script.parentNode.insertBefore(wrap, script.nextSibling);

  const frame = document.createElement('iframe');
  frame.src = `${base}/verify.html?webKey=${encodeURIComponent(webKey)}`;
  frame.style.cssText =
    'position:fixed;inset:0;margin:auto;width:320px;height:320px;border:0;display:none;z-index:99999;background:#0f1115;border-radius:12px';
  document.body.appendChild(frame);

  document.getElementById('bv-check').addEventListener('change', (e) => {
    frame.style.display = e.target.checked ? 'block' : 'none';
    if (!e.target.checked) document.getElementById('bv-pass').value = '';
  });

  window.addEventListener('message', (e) => {
    if (e.source !== frame.contentWindow || e.data?.type !== 'botverify:pass') return;
    document.getElementById('bv-pass').value = e.data.pass;
    frame.style.display = 'none';
  });
})();
