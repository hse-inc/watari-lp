/* 渡工業（sp-34）の案件だけの動き。ページ送りには触らない（swipe.js が担当）
 * 1. 読み込みの画面（intro-sequence）：赤い面に紋 → 約1.1秒で上へ抜けて消える
 */
(() => {
  const intro = document.querySelector('.intro');
  if (!intro) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const done = () => { intro.classList.add('is-done'); setTimeout(() => intro.remove(), 800); };
  if (reduce) { intro.remove(); return; }
  const start = () => setTimeout(done, 1100);
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
  setTimeout(done, 3000);
})();

/* 2. 数字のカウントアップ（.cu の中の数字を 0 から数える。終わったら元の文字に戻す＝文言はシートのまま）
 *    ページに入ったとき（swipe.js の pagechange）に、--cd の順に 0.65 秒ずつずらして始める */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const DUR = 1100, START = 450, STEP = 650;
  const texts = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const out = []; while (w.nextNode()) out.push(w.currentNode); return out; };
  const run = (el) => {
    if (el._cuTimer) { clearTimeout(el._cuTimer); cancelAnimationFrame(el._cuRaf); }
    const nodes = texts(el).map((n) => ({ n, orig: n._cuOrig || (n._cuOrig = n.data) }));
    const fmt = (src, k) => src.replace(/\d[\d,]*/g, (m) => { const v = Math.round(parseInt(m.replace(/,/g, ''), 10) * k); return m.includes(',') ? v.toLocaleString('en-US') : String(v); });
    nodes.forEach((x) => { x.n.data = fmt(x.orig, 0); });
    const d = START + STEP * (parseFloat(getComputedStyle(el).getPropertyValue('--cd')) || 0);
    el._cuTimer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / DUR), k = 1 - Math.pow(1 - p, 3);
        nodes.forEach((x) => { x.n.data = p < 1 ? fmt(x.orig, k) : x.orig; });
        if (p < 1) el._cuRaf = requestAnimationFrame(tick);
      };
      el._cuRaf = requestAnimationFrame(tick);
    }, d);
  };
  document.addEventListener('pagechange', (e) => { const pg = e.detail && e.detail.page; if (pg) pg.querySelectorAll('.cu').forEach(run); });
})();
