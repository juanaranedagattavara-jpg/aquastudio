/* Desconecta2 · núcleo: estado, reloj simulado, navegación y eventos. */
(function () {
  const D2 = (window.D2 = window.D2 || {});
  const STORE_KEY = 'desconecta2-demo-v1';
  const LOAD_REAL = Date.now();
  let clockOffset = 0;

  D2.now = () => D2.SIM_START + (Date.now() - LOAD_REAL) + clockOffset;
  D2.advanceClockTo = (ms) => { clockOffset += ms - D2.now(); };

  function freshState() {
    return {
      role: 'worker',
      view: { worker: 'inicio', rrhh: 'resumen', jefe: 'equipo' },
      worker: {
        name: 'Camila Rojas', cargo: 'Analista de operaciones', area: 'ops',
        prefs: { freq: 90, routine: 'mixta', remind: 1 },
        slotStatus: { '10:30': 'completada' },
        snooze: {}, postponesUsed: 0, moods: [], skipReasons: [],
        week: [{ d: 'Lun 28', v: 4 }, { d: 'Mar 29', v: 3 }, { d: 'Mié 30', v: 4 }, { d: 'Jue 1', v: 2 }, { d: 'Vie 2', v: 4 }],
        survey: null,
      },
      policy: {
        freq: 90, freqMin: 60, freqMax: 120, dur: 5, start: '09:00', end: '18:00',
        maxPostpones: 2, postponeMin: 10, allowSkip: true, offHours: true, dnd: true,
        apps: { slack: true, teams: true, outlook: true, gmail: false, sap: true, drive: true, whatsapp: true },
      },
      complaints: D2.seedComplaints(),
      actions: D2.seedActions(),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(freshState(), JSON.parse(raw));
    } catch (e) { /* almacenamiento no disponible: la demo funciona igual en memoria */ }
    return freshState();
  }
  D2.save = function () {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(D2.state)); } catch (e) { /* sin almacenamiento */ }
  };
  D2.state = load();
  D2.ui = { complaintTab: 'nueva', newCode: null, followCode: null, followError: '', rrhhCase: null, rrhhFilter: 'abiertas', peopleQuery: '', peopleArea: 'all', copied: false };

  /* ---------- Horario de pausas ---------- */
  const toMs = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); const d = D2.simToday(); d.setHours(h, m, 0, 0); return d.getTime(); };
  D2.toMs = toMs;
  D2.effectiveFreq = function () {
    const p = D2.state.policy;
    return Math.max(p.freqMin, Math.min(p.freqMax, D2.state.worker.prefs.freq));
  };
  D2.slots = function () {
    const p = D2.state.policy;
    const freq = D2.effectiveFreq();
    const out = [];
    const start = toMs(p.start), end = toMs(p.end), lunchA = toMs('13:00'), lunchB = toMs('14:00');
    for (let t = start + freq * 60000; t < end - 15 * 60000; t += freq * 60000) {
      if (t >= lunchA && t < lunchB) continue;
      const label = D2.hhmm(t);
      out.push({ label, at: t, status: D2.state.worker.slotStatus[label] || null, snooze: D2.state.worker.snooze[label] || null });
    }
    return out;
  };
  D2.nextSlot = function () {
    return D2.slots().find((s) => !s.status) || null;
  };
  D2.slotTarget = (s) => (s.snooze || s.at);

  /* ---------- Navegación ---------- */
  D2.NAV = {
    worker: [
      { id: 'inicio', label: 'Inicio', icon: 'home' },
      { id: 'pausas', label: 'Mis pausas', icon: 'pause' },
      { id: 'encuesta', label: 'Encuesta', icon: 'survey' },
      { id: 'denuncias', label: 'Denuncias', icon: 'shield' },
    ],
    rrhh: [
      { id: 'resumen', label: 'Resumen', icon: 'chart' },
      { id: 'denuncias', label: 'Denuncias', icon: 'inbox', badge: () => D2.state.complaints.filter((c) => c.unread).length },
      { id: 'clima', label: 'Clima laboral', icon: 'survey' },
      { id: 'pausas', label: 'Pausas activas', icon: 'pause' },
      { id: 'politicas', label: 'Políticas', icon: 'sliders' },
    ],
    jefe: [
      { id: 'equipo', label: 'Mi equipo', icon: 'users' },
      { id: 'pausas', label: 'Pausas', icon: 'pause' },
      { id: 'plan', label: 'Plan de acción', icon: 'listcheck' },
    ],
  };
  const PERSONA = {
    worker: { name: 'Camila Rojas', sub: 'Operaciones', note: 'Estás viendo la app como <b>trabajadora</b>. Las denuncias que envíes aquí llegan a RR.HH. sin tu nombre.' },
    rrhh: { name: 'Andrea Fuentes', sub: 'Jefa de Personas', note: 'Estás viendo el panel de <b>RR.HH.</b>. Recibe las denuncias y ve todos los datos de pausas y clima.' },
    jefe: { name: 'Rodrigo Muñoz', sub: 'Jefe de Operaciones', note: 'Estás viendo la vista de <b>jefatura</b>. Ve el clima de su equipo en agregado y no tiene acceso a denuncias.' },
  };

  D2.render = function (opts) {
    const st = D2.state;
    const role = st.role;
    const view = st.view[role];
    const nav = D2.NAV[role];
    const persona = PERSONA[role];
    D2.resetCharts();
    const navBtn = (n, cls) => {
      const b = n.badge ? n.badge() : 0;
      return '<button class="' + cls + '" data-act="nav" data-view="' + n.id + '"' + (n.id === view ? ' aria-current="page"' : '') + '>' + D2.icon(n.icon) + '<span>' + n.label + '</span>' + (b ? '<span class="nav-badge">' + b + '</span>' : '') + '</button>';
    };
    const roles = [['worker', 'Trabajador'], ['rrhh', 'RR.HH.'], ['jefe', 'Jefatura']];
    const page = (D2.views[role][view] || D2.views[role][nav[0].id])();
    document.getElementById('app').innerHTML =
      '<div class="shell">' +
      '<header class="topbar">' +
      '<a class="logo" href="#" data-act="nav" data-view="' + nav[0].id + '" aria-label="Desconecta2, inicio"><span class="logo-mark"><span></span></span><span class="logo-text">Desconecta<b>2</b></span></a>' +
      '<span class="demo-chip">Prototipo · datos de ejemplo</span>' +
      '<span class="topbar-spacer"></span>' +
      '<div class="role-switch"><span class="role-switch-label">Ver como</span><div class="segmented" role="group" aria-label="Cambiar vista">' +
      roles.map((r) => '<button data-act="role" data-role="' + r[0] + '" aria-pressed="' + (r[0] === role) + '">' + r[1] + '</button>').join('') +
      '</div></div>' +
      '<div class="user-chip"><span class="avatar">' + D2.initials(persona.name) + '</span><span class="who"><b>' + persona.name + '</b><span>' + persona.sub + '</span></span></div>' +
      '</header>' +
      '<nav class="sidebar" aria-label="Secciones"><div class="eyebrow">' + D2.company.name + '</div>' +
      nav.map((n) => navBtn(n, 'nav-item')).join('') +
      '<div class="sidebar-foot"><span>' + persona.note + '</span><button class="link small" data-act="reset">Reiniciar demo</button></div>' +
      '</nav>' +
      '<main class="main" id="main">' + page + '</main>' +
      '<nav class="tabbar" aria-label="Secciones">' + nav.map((n) => navBtn(n, 'tab')).join('') + '</nav>' +
      '</div>';
    D2.drawCharts();
    D2.tickDom();
    if (opts && opts.scroll) window.scrollTo({ top: 0 });
  };

  /* ---------- Acciones ---------- */
  D2.actions = {
    nav(el) { D2.state.view[D2.state.role] = el.dataset.view; D2.ui.rrhhCase = null; D2.save(); D2.render({ scroll: true }); },
    go(el) { D2.state.view[D2.state.role] = el.dataset.view; if (el.dataset.tab) D2.ui.complaintTab = el.dataset.tab; D2.save(); D2.render({ scroll: true }); },
    role(el) { D2.state.role = el.dataset.role; D2.ui.rrhhCase = null; D2.save(); D2.render({ scroll: true }); },
    reset() {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nada */ }
      D2.state = freshState();
      clockOffset = 0;
      D2.ui = { complaintTab: 'nueva', newCode: null, followCode: null, followError: '', rrhhCase: null, rrhhFilter: 'abiertas', peopleQuery: '', peopleArea: 'all', copied: false };
      D2.closeOverlay();
      D2.render({ scroll: true });
      D2.toast('Demo reiniciada', 'refresh');
    },
  };
  D2.forms = {};
  D2.changes = {};
  D2.views = { worker: {}, rrhh: {}, jefe: {} };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = D2.actions[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const fn = D2.forms[form.dataset.form];
    if (fn) fn(form);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (!el) return;
    const fn = D2.changes[el.dataset.change];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const fn = D2.changes[el.dataset.input];
    if (fn) fn(el, e);
  });

  /* ---------- Reloj ---------- */
  D2.tickDom = function () {
    const now = D2.now();
    document.querySelectorAll('[data-clock]').forEach((el) => (el.textContent = D2.hhmm(now)));
    const next = D2.nextSlot();
    document.querySelectorAll('[data-countdown]').forEach((el) => {
      if (!next) { el.textContent = '—'; return; }
      const sec = Math.max(0, Math.round((D2.slotTarget(next) - now) / 1000));
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      el.textContent = (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
    });
  };
  setInterval(() => {
    D2.tickDom();
    if (D2.pauseTick) D2.pauseTick();
  }, 250);

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(D2.drawCharts, 120); });

  document.addEventListener('DOMContentLoaded', () => D2.render());
  if (document.readyState !== 'loading') setTimeout(() => D2.render(), 0);
})();
