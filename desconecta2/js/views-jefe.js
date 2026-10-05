/* Desconecta2 · vista Jefatura (Operaciones). */
(function () {
  const D2 = window.D2;
  const V = D2.views.jefe;
  const esc = D2.esc;
  const TEAM = 'ops';

  const team = () => D2.areaData().find((a) => a.id === TEAM);
  const legend2 = '<div class="legend"><span><i style="background:var(--series-1)"></i>Tu equipo</span><span><i style="background:var(--series-2)"></i>Empresa</span><span><i class="dash"></i>Meta 3,5</span></div>';

  V.equipo = function () {
    const t = team();
    const comp = D2.companyScores();
    const weakest = D2.DIMS.slice().sort((a, b) => t.scores[a.key] - t.scores[b.key]).slice(0, 2);
    const acts = D2.state.actions;
    const pauseTeam = D2.pauseByArea().find((a) => a.id === TEAM);
    const comments = D2.COMMENTS.filter((c) => c.area === TEAM);
    const own = D2.state.worker.survey;
    if (own && own.open) comments.unshift({ area: TEAM, dim: null, text: own.open, isNew: true });
    const diff = t.index - comp.index;
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Operaciones · 12 personas</span><h1>Mi equipo</h1><p>Ves promedios de tu equipo. No ves respuestas individuales ni denuncias.</p></div></div>' +
      '<div class="grid g4">' +
      D2.kpi('Clima del equipo', D2.f2(t.index) + '<small> /5</small>', (diff >= 0 ? '+' : '−') + D2.f2(Math.abs(diff)), diff >= 0, 'vs empresa') +
      D2.kpi('Respondieron', t.resp + '<small> de ' + t.size + '</small>', null, null, 'Encuesta de septiembre') +
      D2.kpi('Pausas completadas', Math.round(pauseTeam.pct) + '<small>%</small>', '+3 pts', true, 'vs semana anterior') +
      D2.kpi('Plan de acción', acts.filter((a) => a.done).length + '<small> de ' + acts.length + '</small>', null, null, 'acciones hechas') +
      '</div>' +
      '<div class="grid g2">' +
      '<section class="card"><div class="card-head"><div><h3>Tu equipo vs la empresa</h3><p>Septiembre 2026, escala 1 a 5</p></div>' + legend2 + '</div>' +
      D2.hbars(D2.DIMS.map((d) => ({ label: d.label, v: t.scores[d.key], v2: comp.scores[d.key] })), { target: D2.TARGET, s1: 'Tu equipo', s2: 'Empresa' }) + '</section>' +
      '<div class="stack">' +
      '<section class="card"><div class="card-head"><div><h3>Evolución del clima del equipo</h3><p>Índice de Operaciones, abril a septiembre</p></div></div>' +
      D2.chartSlot({ labels: D2.MONTHS, values: t.trend.concat([t.index]), min: 2.8, max: 3.8, ticks: [3, 3.5], fmt: (v) => D2.f1(v), endFmt: (v) => D2.f2(v), goal: 3.5, goalLabel: 'Meta 3,5', aria: 'Evolución del clima del equipo', height: 190 }) + '</section>' +
      '<div class="notice">' + D2.icon('shield') + '<span><b>Las denuncias no pasan por ti</b>El canal anónimo llega directo a RR.HH. Así quien denuncia está protegido, incluso si la situación involucra a una jefatura.</span></div>' +
      '</div></div>' +
      '<section class="card"><div class="card-head"><div><h3>Dónde enfocarte este mes</h3><p>Las dos dimensiones más bajas de tu equipo y acciones sugeridas</p></div><button class="btn btn-quiet btn-sm" data-act="go" data-view="plan">Ver plan de acción</button></div>' +
      '<div class="grid g2">' + weakest.map((d) => '<div class="card flat"><div class="row between"><h4>' + d.label + '</h4><span class="pill pill-warn nodot num">' + D2.f1(t.scores[d.key]) + ' / 5</span></div>' +
        '<p class="small muted">"' + esc(d.q) + '"</p><div class="list">' + D2.SUGGESTIONS[d.key].map((s) => {
          const added = D2.state.actions.some((a) => a.text === s);
          return '<div class="list-item small"><span class="grow">' + esc(s) + '</span>' + (added ? '<span class="pill pill-ok">En el plan</span>' : '<button class="btn btn-ghost btn-sm" data-act="add-sugg" data-dim="' + d.key + '" data-text="' + esc(s) + '">Agregar</button>') + '</div>';
        }).join('') + '</div></div>').join('') + '</div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Lo que dice tu equipo</h3><p>Comentarios anónimos de septiembre</p></div></div>' +
      '<div class="grid g2" style="gap:10px">' + comments.map((c) => '<div class="comment"><q>' + esc(c.text) + '</q><span class="meta">' + (c.dim ? D2.dimLabel(c.dim) : 'Sin clasificar') + (c.isNew ? ' · <b style="color:var(--brand)">Nuevo</b>' : '') + '</span></div>').join('') + '</div></section>' +
      '</div>';
  };

  V.pausas = function () {
    const ppl = D2.PEOPLE.filter((p) => p.area === TEAM);
    const done = ppl.reduce((n, p) => n + p.completed, 0), sch = ppl.reduce((n, p) => n + p.scheduled, 0);
    const skip = ppl.reduce((n, p) => n + p.skipped, 0);
    const slots = D2.slots().map((s) => s.label);
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Operaciones · semana del 28 sep</span><h1>Pausas del equipo</h1><p>Tu equipo descansa mejor si tú también haces tus pausas y no agendas reuniones encima.</p></div></div>' +
      '<div class="grid g3">' +
      D2.kpi('Cumplimiento', Math.round((done / sch) * 100) + '<small>%</small>', '+3 pts', true, 'Meta 80%') +
      D2.kpi('Pausas saltadas', skip, null, null, 'Motivo principal: reuniones') +
      D2.kpi('Personas bajo 60%', ppl.filter((p) => p.completed / p.scheduled < 0.6).length, null, null, 'de ' + ppl.length + ' en tu equipo') +
      '</div>' +
      '<div class="grid g-main">' +
      '<section class="card"><div class="card-head"><div><h3>Cumplimiento semanal</h3><p>Operaciones, % de pausas completadas</p></div></div>' +
      D2.chartSlot({ labels: D2.WEEKS, values: D2.WEEKLY_OPS, min: 40, max: 100, ticks: [40, 60, 80, 100], fmt: (v) => v + '%', goal: 80, goalLabel: 'Meta 80%', tipPrefix: 'Semana del ', aria: 'Cumplimiento semanal del equipo' }) + '</section>' +
      '<section class="card flat"><h4>Evita agendar reuniones a estas horas</h4><div class="row">' + slots.map((s) => '<span class="pill pill-brand nodot num">' + D2.icon('clock').replace('<svg', '<svg width="14" height="14"') + s + '</span>').join('') + '</div>' +
      '<p class="small ink2">El 44% de las pausas saltadas en tu equipo coincide con reuniones.</p></section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><div><h3>Por persona</h3><p>Ordenado de menor a mayor cumplimiento</p></div></div><div class="table-wrap">' +
      '<table><thead><tr><th>Persona</th><th class="hide-mobile">Cargo</th><th style="min-width:160px">Cumplimiento</th><th class="r">Pospuestas</th><th class="r">Saltadas</th></tr></thead><tbody>' +
      ppl.slice().sort((a, b) => a.completed / a.scheduled - b.completed / b.scheduled).map((p) => '<tr><td style="white-space:nowrap"><span class="row nowrap" style="gap:8px"><span class="avatar" style="width:28px;height:28px;font-size:11px">' + D2.initials(p.name) + '</span>' + esc(p.name) + '</span></td><td class="hide-mobile muted">' + p.cargo + '</td><td>' + D2.minibar(p.completed, p.scheduled) + '</td><td class="r num">' + p.postponed + '</td><td class="r num">' + p.skipped + '</td></tr>').join('') +
      '</tbody></table></div></section>' +
      '</div>';
  };

  V.plan = function () {
    const acts = D2.state.actions;
    const t = team();
    const dimOpts = D2.DIMS.map((d) => '<option value="' + d.key + '">' + d.label + '</option>').join('');
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Operaciones · octubre 2026</span><h1>Plan de acción</h1><p>Acciones concretas para mejorar lo que tu equipo marcó más bajo. RR.HH. ve el avance.</p></div></div>' +
      '<div class="grid g-main">' +
      '<section class="card"><div class="card-head"><div><h3>Acciones del mes</h3><p>' + acts.filter((a) => a.done).length + ' de ' + acts.length + ' hechas</p></div></div>' +
      '<div class="list">' + acts.map((a) => '<label class="check-item' + (a.done ? ' done' : '') + '"><input type="checkbox" data-change="action-done" data-id="' + a.id + '"' + (a.done ? ' checked' : '') + '><span class="grow"><b class="small">' + esc(a.text) + '</b><span class="xs muted">' + D2.dimLabel(a.dim) + ' · equipo en ' + D2.f1(t.scores[a.dim]) + '</span></span></label>').join('') + '</div>' +
      '<form data-form="add-action" class="stack" style="padding-top:6px"><div class="divider"></div><h4>Agregar acción</h4>' +
      '<div class="grid g2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:10px"><div class="field"><label class="visually-hidden" for="act-text">Acción</label><input id="act-text" name="text" class="input" placeholder="Ej: reunión de 15 minutos los lunes con agenda"></div>' +
      '<div class="field"><label class="visually-hidden" for="act-dim">Dimensión</label><select id="act-dim" name="dim" class="select">' + dimOpts + '</select></div></div>' +
      '<div><button class="btn btn-primary btn-sm" type="submit">Agregar al plan</button></div></form>' +
      '</section>' +
      '<aside class="stack"><section class="card flat"><h4>Cómo armar un buen plan</h4><div class="list small">' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('check') + '</span><span class="grow">Máximo 3 a 5 acciones por mes.</span></div>' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('check') + '</span><span class="grow">Que dependan de ti, no de otra área.</span></div>' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('check') + '</span><span class="grow">Cuéntale al equipo qué vas a cambiar. La próxima encuesta mide si funcionó.</span></div>' +
      '</div></section></aside></div></div>';
  };

  Object.assign(D2.actions, {
    'add-sugg'(el) {
      D2.state.actions.push({ id: 'a' + Date.now(), dim: el.dataset.dim, text: el.dataset.text, done: false });
      D2.save();
      D2.render();
      D2.toast('Acción agregada al plan');
    },
  });
  D2.changes['action-done'] = function (el) {
    const a = D2.state.actions.find((x) => x.id === el.dataset.id);
    a.done = el.checked;
    D2.save();
    D2.render();
  };
  D2.forms['add-action'] = function (form) {
    const fd = new FormData(form);
    const text = String(fd.get('text') || '').trim();
    if (!text) { document.getElementById('act-text').focus(); return; }
    D2.state.actions.push({ id: 'a' + Date.now(), dim: String(fd.get('dim')), text, done: false });
    D2.save();
    D2.render();
    D2.toast('Acción agregada al plan');
  };
})();
