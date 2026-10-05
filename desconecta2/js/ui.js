/* Desconecta2 · utilidades de interfaz: íconos, formato, gráficos, tooltip y avisos. */
(function () {
  const D2 = (window.D2 = window.D2 || {});

  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
    survey: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.5c2.5 0 4.5 1.6 5 4.5"/>',
    listcheck: '<path d="M11 6h9M11 12h9M11 18h9"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    bellOff: '<path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H8"/><path d="M10 20a2 2 0 0 0 4 0"/><path d="M3 3l18 18"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    send: '<path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    pauseFill: '<path d="M8 5v14M16 5v14" stroke-width="3.2"/>',
    next: '<path d="M6 5v14l9-7z" fill="currentColor"/><path d="M18 5v14"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2M6.6 7.6C4.3 9.2 3 12 3 12s4 6 9 6a9 9 0 0 0 4-.9"/><path d="M10 10a3 3 0 0 0 4 4"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    up: '<path d="m4 16 6-6 4 4 6-7"/><path d="M15 7h5v5"/>',
    down: '<path d="m4 8 6 6 4-4 6 7"/><path d="M15 17h5v-5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="m5 19 8-8"/>',
    inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    skip: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    snooze: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M19 3l3 3"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    person: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11l4-2 4 2M9 21l3-6 3 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    door: '<path d="M14 3H6v18h8"/><path d="M14 3l5 2v14l-5 2z"/><path d="M11 12h.01"/>',
  };
  D2.icon = function (name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
  D2.face = function (level) {
    // level 1..5 → boca de triste a feliz
    const mouths = ['M8 16.5c1.2-2 6.8-2 8 0', 'M8.5 16c1.5-1 5.5-1 7 0', 'M8.5 15.5h7', 'M8.5 15c1.5 1 5.5 1 7 0', 'M8 14.5c1.2 2.4 6.8 2.4 8 0'];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 10v.5M15 10v.5" stroke-width="2.4"/><path d="' + mouths[level - 1] + '"/></svg>';
  };

  D2.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };
  D2.f1 = (n) => Number(n).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  D2.f2 = (n) => Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  D2.pct = (n) => Math.round(n) + '%';
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  D2.parseDate = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  D2.fmtDate = (s) => { const d = D2.parseDate(s); return d.getDate() + ' ' + MES[d.getMonth()]; };
  D2.fmtDateTime = (s) => D2.fmtDate(s) + (s.length > 10 ? ' · ' + s.slice(11, 16) : '');
  D2.daysSince = (s) => Math.floor((D2.simToday() - D2.parseDate(s)) / 86400000);
  D2.simToday = () => { const n = new Date(D2.now()); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  D2.hhmm = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  D2.stamp = () => { const d = new Date(D2.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + D2.hhmm(d.getTime()); };
  D2.mmss = (sec) => { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  D2.initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  D2.avg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

  // Escala divergente para el mapa de calor (meta 3,5 = neutro)
  D2.heatBg = function (v) {
    const t = Math.max(-1, Math.min(1, (v - D2.TARGET) / 1.2));
    const pctv = Math.round(Math.abs(t) * 62);
    const pole = t < 0 ? 'var(--div-low)' : 'var(--div-high)';
    return 'background: color-mix(in oklab, ' + pole + ' ' + pctv + '%, var(--surface-2))';
  };

  /* ---------- Gráficos (SVG dibujado al ancho real del contenedor) ---------- */
  const charts = {};
  let chartId = 0;
  D2.chartSlot = function (spec) {
    const id = 'c' + ++chartId;
    charts[id] = spec;
    return '<div class="chart" data-chart="' + id + '" style="height:' + (spec.height || 220) + 'px" role="img" aria-label="' + D2.esc(spec.aria || '') + '"></div>';
  };
  D2.drawCharts = function () {
    document.querySelectorAll('[data-chart]').forEach((el) => {
      const spec = charts[el.dataset.chart];
      if (spec) el.innerHTML = lineChart(spec, el.clientWidth || 600);
    });
  };
  D2.resetCharts = function () { for (const k in charts) delete charts[k]; };

  function lineChart(s, W) {
    const H = s.height || 220;
    const padL = 36, padR = 58, padT = 14, padB = 28;
    const iw = Math.max(80, W - padL - padR), ih = H - padT - padB;
    const n = s.values.length;
    const x = (i) => padL + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
    const y = (v) => padT + ih - ((v - s.min) / (s.max - s.min)) * ih;
    const fmt = s.fmt || ((v) => v);
    let out = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
    s.ticks.forEach((t) => {
      out += '<line class="grid-line" x1="' + padL + '" x2="' + (padL + iw) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>';
      out += '<text class="axis-label" x="' + (padL - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + fmt(t) + '</text>';
    });
    if (s.goal != null) {
      out += '<line class="goal" x1="' + padL + '" x2="' + (padL + iw) + '" y1="' + y(s.goal) + '" y2="' + y(s.goal) + '"/>';
      out += '<text class="goal-label" x="' + (padL + iw + 6) + '" y="' + (y(s.goal) + 4) + '">' + D2.esc(s.goalLabel || 'Meta') + '</text>';
    }
    const step = iw / Math.max(1, n - 1) < 46 ? 2 : 1;
    s.labels.forEach((l, i) => {
      if (i % step && i !== n - 1) return;
      out += '<text class="axis-label" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + D2.esc(l) + '</text>';
    });
    const pts = s.values.map((v, i) => x(i) + ',' + y(v));
    out += '<path class="area" d="M' + x(0) + ',' + (padT + ih) + ' L' + pts.join(' L') + ' L' + x(n - 1) + ',' + (padT + ih) + ' Z"/>';
    out += '<polyline class="line" points="' + pts.join(' ') + '"/>';
    out += '<line class="cross" x1="0" x2="0" y1="' + padT + '" y2="' + (padT + ih) + '"/>';
    const last = s.values[n - 1];
    out += '<circle class="dot" cx="' + x(n - 1) + '" cy="' + y(last) + '" r="5"/>';
    // Evita que la etiqueta final choque con la de la meta
    let ly = y(last) + 4;
    if (s.goal != null && Math.abs(y(last) - y(s.goal)) < 14) ly = y(last) + (y(last) < y(s.goal) ? -6 : 16);
    out += '<text class="end-label" x="' + (x(n - 1) + 10) + '" y="' + ly + '">' + (s.endFmt || fmt)(last) + '</text>';
    const colW = iw / Math.max(1, n - 1);
    s.values.forEach((v, i) => {
      const tip = '<b>' + D2.esc((s.endFmt || fmt)(v)) + '</b>' + D2.esc((s.tipPrefix || '') + s.labels[i]);
      out += '<rect class="hit" x="' + (x(i) - colW / 2) + '" y="' + padT + '" width="' + colW + '" height="' + ih + '" data-cx="' + x(i) + '" data-tip="' + D2.esc(tip) + '"/>';
    });
    out += '</svg>';
    return out;
  }

  /* ---------- Tooltip global ---------- */
  function placeTip(e) {
    const tip = document.getElementById('tip');
    const pad = 14;
    let left = e.clientX + pad, top = e.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (left + r.width > window.innerWidth - 8) left = e.clientX - r.width - pad;
    if (top + r.height > window.innerHeight - 8) top = e.clientY - r.height - pad;
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top = Math.max(8, top) + 'px';
  }
  function showTip(e) {
    const t = e.target.closest && e.target.closest('[data-tip]');
    const tip = document.getElementById('tip');
    if (!tip) return;
    document.querySelectorAll('.cross').forEach((c) => (c.style.opacity = 0));
    if (!t) { tip.hidden = true; return; }
    tip.innerHTML = t.getAttribute('data-tip');
    tip.hidden = false;
    placeTip(e);
    if (t.dataset.cx) {
      const cross = t.ownerSVGElement && t.ownerSVGElement.querySelector('.cross');
      if (cross) { cross.setAttribute('x1', t.dataset.cx); cross.setAttribute('x2', t.dataset.cx); cross.style.opacity = 1; }
    }
  }
  document.addEventListener('pointerover', showTip);
  document.addEventListener('pointermove', (e) => { const tip = document.getElementById('tip'); if (tip && !tip.hidden) placeTip(e); });
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !(e.relatedTarget.closest && e.relatedTarget.closest('[data-tip]'))) { const tip = document.getElementById('tip'); if (tip) tip.hidden = true; document.querySelectorAll('.cross').forEach((c) => (c.style.opacity = 0)); } });

  /* ---------- Avisos ---------- */
  D2.toast = function (msg, icon) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = D2.icon(icon || 'check') + '<span>' + D2.esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  };

  /* ---------- Piezas comunes ---------- */
  D2.statusPill = function (status) {
    const cls = ['pill-crit', 'pill-warn', 'pill-info', 'pill-ok'][status];
    return '<span class="pill ' + cls + '">' + D2.STATUSES[status] + '</span>';
  };
  D2.catName = (id) => (D2.CATEGORIES.find((c) => c.id === id) || {}).name || 'Otra situación';
  D2.appTile = function (app) {
    return '<span class="ai" style="background:' + app.color + '">' + app.abbr + '</span>';
  };
  D2.minibar = function (value, max) {
    const p = Math.round((value / max) * 100);
    const cls = p < 60 ? 'crit' : p < 75 ? 'low' : '';
    return '<div class="minibar"><div class="track"><div class="fill ' + cls + '" style="width:' + p + '%"></div></div><span class="num small" style="width:38px;text-align:right">' + p + '%</span></div>';
  };
})();
