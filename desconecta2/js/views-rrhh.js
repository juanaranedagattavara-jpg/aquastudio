/* Desconecta2 · vista RR.HH. (panel de la empresa). */
(function () {
  const D2 = window.D2;
  const V = D2.views.rrhh;
  const esc = D2.esc;

  /* ---------- Datos agregados ---------- */
  D2.areaData = function () {
    const s = D2.state.worker.survey;
    return D2.AREAS.map((a) => {
      let resp = a.resp;
      const scores = Object.assign({}, a.scores);
      if (s && a.id === 'ops') {
        resp = a.resp + 1;
        D2.DIMS.forEach((d) => { scores[d.key] = (a.scores[d.key] * a.resp + s.answers[d.key]) / resp; });
      }
      const index = D2.avg(D2.DIMS.map((d) => scores[d.key]));
      return Object.assign({}, a, { resp, scores, index, visible: resp >= D2.MIN_RESPONSES });
    });
  };
  D2.companyScores = function () {
    const areas = D2.areaData();
    const total = areas.reduce((n, a) => n + a.resp, 0);
    const scores = {};
    D2.DIMS.forEach((d) => { scores[d.key] = areas.reduce((n, a) => n + a.scores[d.key] * a.resp, 0) / total; });
    return { scores, index: D2.avg(D2.DIMS.map((d) => scores[d.key])), resp: total };
  };
  D2.pauseByArea = function () {
    return D2.AREAS.map((a) => {
      const ps = D2.PEOPLE.filter((p) => p.area === a.id);
      const sch = ps.reduce((n, p) => n + p.scheduled, 0);
      const done = ps.reduce((n, p) => n + p.completed, 0);
      return { id: a.id, name: a.name, pct: (done / sch) * 100, done, sch };
    });
  };
  D2.dimLabel = (k) => D2.DIMS.find((d) => d.key === k).label;

  D2.hbars = function (rows, opts) {
    opts = opts || {};
    const max = opts.max || 5;
    return '<div class="hbars">' + rows.map((r) => {
      const w1 = (r.v / max) * 100;
      const tip = '<b>' + esc(r.label) + '</b>' + (opts.s1 || '') + ': ' + (opts.fmt || D2.f1)(r.v) + (r.v2 != null ? '<br>' + (opts.s2 || '') + ': ' + (opts.fmt || D2.f1)(r.v2) : '');
      return '<div class="hbar" data-tip="' + esc(tip) + '"><div class="lbl">' + esc(r.label) + (r.sub ? '<small>' + esc(r.sub) + '</small>' : '') + '</div>' +
        '<div class="bars"><div class="bar" style="width:' + w1 + '%"></div>' + (r.v2 != null ? '<div class="bar s2" style="width:' + (r.v2 / max) * 100 + '%"></div>' : '') +
        (opts.target != null ? '<span class="target" style="left:' + (opts.target / max) * 100 + '%"></span>' : '') + '</div>' +
        '<div class="val">' + (opts.fmt || D2.f1)(r.v) + '</div></div>';
    }).join('') + '</div>';
  };

  /* ---------- Resumen ---------- */
  V.resumen = function () {
    const comp = D2.companyScores();
    const areas = D2.areaData();
    const open = D2.state.complaints.filter((c) => c.status < 3);
    const unread = D2.state.complaints.filter((c) => c.unread);
    const totalResp = comp.resp;
    const lowestDim = D2.DIMS.slice().sort((a, b) => comp.scores[a.key] - comp.scores[b.key])[0];
    const lowestArea = areas.filter((a) => a.visible).sort((a, b) => a.index - b.index)[0];
    const trend = [3.21, 3.25, 3.3, 3.34, 3.41, comp.index];
    const attention = [];
    unread.forEach((c) => attention.push({ cls: 'crit', icon: 'inbox', t: 'Denuncia sin leer · ' + D2.catName(c.cat), s: c.code + ' · recibida el ' + D2.fmtDate(c.received), act: 'open-case', code: c.code }));
    open.filter((c) => !c.unread).forEach((c) => { const dl = D2.deadlineInfo(c); if (dl.left <= 20) attention.push({ cls: dl.left <= 10 ? 'crit' : 'warn', icon: 'clock', t: 'Quedan ' + dl.left + ' días para cerrar la investigación', s: c.code + ' · ' + D2.catName(c.cat), act: 'open-case', code: c.code }); });
    attention.push({ cls: 'warn', icon: 'down', t: lowestDim.label + ' es lo más bajo del mes (' + D2.f1(comp.scores[lowestDim.key]) + ')', s: 'Bajo la meta de 3,5 en ' + areas.filter((a) => a.visible && a.scores[lowestDim.key] < D2.TARGET).length + ' de ' + areas.filter((a) => a.visible).length + ' áreas visibles', act: 'go', view: 'clima' });
    attention.push({ cls: 'warn', icon: 'users', t: lowestArea.name + ' tiene el clima más bajo (' + D2.f1(lowestArea.index) + ')', s: 'Su jefatura tiene un plan de acción en curso', act: 'go', view: 'clima' });
    attention.push({ cls: 'info', icon: 'calendar', t: '38 pausas saltadas por reuniones este mes', s: 'Considera no agendar reuniones en horario de pausa', act: 'go', view: 'pausas' });

    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">' + D2.company.name + ' · 48 personas</span><h1>Resumen</h1><p>Clima laboral, pausas activas y denuncias en un solo lugar.</p></div></div>' +
      '<div class="grid g4">' +
      kpi('Cumplimiento de pausas', '81<small>%</small>', '+3 pts', true, 'Semana del 28 sep') +
      kpi('Índice de clima', D2.f2(comp.index) + '<small> /5</small>', '+' + D2.f2(comp.index - 3.41), true, 'Septiembre vs agosto') +
      kpi('Participación encuesta', Math.round((totalResp / 48) * 100) + '<small>%</small>', null, null, totalResp + ' de 48 personas') +
      kpi('Denuncias abiertas', open.length, null, null, unread.length ? '<span class="pill pill-crit">' + unread.length + ' sin leer</span>' : 'Todas revisadas') +
      '</div>' +
      '<div class="grid g-main">' +
      '<div class="stack">' +
      '<section class="card"><div class="card-head"><div><h3>Cumplimiento semanal de pausas</h3><p>% de pausas completadas sobre las programadas</p></div></div>' +
      D2.chartSlot({ labels: D2.WEEKS, values: D2.WEEKLY_COMPANY, min: 40, max: 100, ticks: [40, 60, 80, 100], fmt: (v) => v + '%', goal: 80, goalLabel: 'Meta 80%', tipPrefix: 'Semana del ', aria: 'Cumplimiento semanal de pausas, de 58% a 81% en 8 semanas' }) + '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Índice de clima laboral</h3><p>Promedio de las 6 dimensiones, escala 1 a 5</p></div></div>' +
      D2.chartSlot({ labels: D2.MONTHS, values: trend, min: 3, max: 4, ticks: [3, 3.5, 4], fmt: (v) => D2.f1(v), endFmt: (v) => D2.f2(v), goal: 3.5, goalLabel: 'Meta 3,5', aria: 'Índice de clima de abril a septiembre', height: 200 }) + '</section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><div><h3>Requiere atención</h3><p>Ordenado por urgencia</p></div></div><div class="list">' +
      attention.map((a) => '<button class="list-item" style="border-left:0;border-right:0;border-bottom:0;background:none;text-align:left;width:100%" data-act="' + a.act + '"' + (a.code ? ' data-code="' + a.code + '"' : '') + (a.view ? ' data-view="' + a.view + '"' : '') + '><span class="icon-dot ' + a.cls + '">' + D2.icon(a.icon) + '</span><span class="grow"><b class="small">' + esc(a.t) + '</b><span class="xs muted">' + esc(a.s) + '</span></span></button>').join('') +
      '</div></section>' +
      '</div></div>';
  };
  function kpi(label, value, delta, up, sub) {
    return '<section class="card kpi"><span class="eyebrow">' + label + '</span><span class="kpi-value">' + value + '</span>' +
      '<span class="row small muted" style="gap:8px">' + (delta ? '<span class="delta ' + (up ? 'up' : 'down') + '">' + D2.icon(up ? 'up' : 'down') .replace('<svg', '<svg width="14" height="14"') + delta + '</span>' : '') + sub + '</span></section>';
  }
  D2.kpi = kpi;

  /* ---------- Denuncias ---------- */
  V.denuncias = function () {
    if (D2.ui.rrhhCase) return caseDetail(D2.state.complaints.find((c) => c.code === D2.ui.rrhhCase));
    const f = D2.ui.rrhhFilter;
    const all = D2.state.complaints;
    const list = all.filter((c) => (f === 'abiertas' ? c.status < 3 : f === 'resueltas' ? c.status === 3 : true));
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Canal anónimo · Ley Karin</span><h1>Denuncias</h1><p>Solo el equipo de Personas ve esta sección. Las jefaturas no tienen acceso.</p></div>' +
      '<div class="toggle-tabs" role="group" aria-label="Filtrar">' + [['abiertas', 'Abiertas'], ['resueltas', 'Resueltas'], ['todas', 'Todas']].map((t) => '<button data-act="rfilter" data-f="' + t[0] + '" aria-pressed="' + (f === t[0]) + '">' + t[1] + '</button>').join('') + '</div></div>' +
      '<div class="notice">' + D2.icon('eyeOff') + '<span><b>Identidad protegida</b>Desconecta2 no registra nombre, correo, IP ni dispositivo de quien denuncia. Solo ves lo que la persona escribió y puedes conversar con ella de forma anónima.</span></div>' +
      '<section class="card">' + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Código</th><th>Tipo</th><th>Recibida</th><th>Estado</th><th>Plazo</th><th class="r">Mensajes</th></tr></thead><tbody>' +
        list.map((c) => {
          const dl = D2.deadlineInfo(c);
          const plazo = c.status === 3 ? '<span class="muted">Cerrada</span>' : '<span class="pill ' + (dl.left <= 10 ? 'pill-crit' : dl.left <= 20 ? 'pill-warn' : 'pill-neutral') + ' nodot num">' + dl.left + ' días</span>';
          return '<tr class="clickable" data-act="open-case" data-code="' + c.code + '"><td class="mono" style="white-space:nowrap">' + (c.unread ? '<b>' + c.code + '</b> <span class="pill pill-crit nodot">Nueva</span>' : c.code) + '</td><td>' + D2.catName(c.cat) + (c.protection ? '<div class="xs muted">Pide medidas de protección</div>' : '') + '</td><td class="num" style="white-space:nowrap">' + D2.fmtDate(c.received) + '</td><td>' + D2.statusPill(c.status) + '</td><td>' + plazo + '</td><td class="r num">' + c.messages.filter((m) => m.from !== 'system').length + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="empty">' + D2.icon('inbox') + '<span>No hay denuncias en esta vista.</span></div>') +
      '</section></div>';
  };

  function caseDetail(c) {
    if (!c) { D2.ui.rrhhCase = null; return V.denuncias(); }
    const dl = D2.deadlineInfo(c);
    const pctDays = Math.min(100, (dl.days / D2.DEADLINE_DAYS) * 100);
    return '<div class="page">' +
      '<div><button class="btn btn-quiet btn-sm" data-act="close-case">' + D2.icon('back') + 'Todas las denuncias</button></div>' +
      '<div class="page-head"><div><span class="eyebrow mono">' + c.code + '</span><h1>' + D2.catName(c.cat) + '</h1><p>Recibida el ' + D2.fmtDate(c.received) + ' · denunciante anónimo</p></div>' + D2.statusPill(c.status) + '</div>' +
      '<div class="grid g-main">' +
      '<div class="stack">' +
      '<section class="card"><h3>Relato</h3><p class="ink2">' + esc(c.desc) + '</p>' +
      '<div class="grid g2" style="gap:10px">' +
      info('Dónde', c.where) + info('Cuándo', c.when) + info('¿Más de una vez?', c.recurrent) + info('Testigos', c.witnesses || 'No indica') +
      '</div>' +
      (c.files && c.files.length ? '<div class="row">' + c.files.map((f) => '<span class="pill pill-neutral nodot">' + D2.icon('file').replace('<svg', '<svg width="14" height="14"') + esc(f) + '</span>').join('') + '</div>' : '') +
      '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Conversación anónima</h3><p>Respondes como "Equipo de Personas". La persona lo ve con su código.</p></div></div>' +
      D2.chatHtml(c, 'rrhh') +
      (c.status < 3 ? '<form data-form="rrhh-msg" class="chat-input"><label class="visually-hidden" for="r-msg">Respuesta</label><textarea id="r-msg" name="msg" class="textarea" placeholder="Escribe una respuesta o pide más antecedentes" maxlength="1000"></textarea><button class="btn btn-primary" type="submit" aria-label="Enviar">' + D2.icon('send') + '</button></form>' : '') +
      '</section></div>' +
      '<aside class="stack">' +
      '<section class="card"><h4>Estado del caso</h4>' + D2.stepper(c.status) +
      '<div class="row">' + D2.STATUSES.map((s, i) => '<button class="btn btn-sm ' + (i === c.status ? 'btn-primary' : 'btn-ghost') + '" data-act="set-status" data-s="' + i + '"' + (i === c.status ? ' aria-pressed="true"' : '') + '>' + s + '</button>').join('') + '</div>' +
      (c.status === 3 && c.resolution ? '<p class="small ink2"><b>Resolución:</b> ' + esc(c.resolution) + '</p>' : '') +
      '</section>' +
      (c.status < 3 ? '<section class="card"><div class="row between"><h4>Plazo de investigación</h4><span class="num small"><b>Día ' + dl.days + '</b> de ' + D2.DEADLINE_DAYS + '</span></div>' +
        '<div class="minibar"><div class="track"><div class="fill ' + (dl.left <= 10 ? 'crit' : dl.left <= 20 ? 'low' : '') + '" style="width:' + pctDays + '%"></div></div></div>' +
        '<p class="xs muted">Vence el ' + venc(c) + '. Configurable según tu reglamento interno.</p></section>' : '') +
      '<section class="card"><div class="row between"><h4>Medidas de resguardo</h4>' + (c.protection ? '<span class="pill pill-warn">Solicitadas</span>' : '') + '</div>' +
      ((c.measures || []).length ? '<div class="list">' + c.measures.map((m) => '<div class="list-item small"><span class="icon-dot ok">' + D2.icon('check') + '</span><span class="grow">' + esc(m) + '</span></div>').join('') + '</div>' : '<p class="small muted">Aún no registras medidas.</p>') +
      (c.status < 3 ? '<form data-form="measure" class="stack"><label class="visually-hidden" for="m-text">Nueva medida</label><input id="m-text" name="m" class="input" placeholder="Ej: separar turnos mientras se investiga"><button class="btn btn-ghost btn-sm" type="submit">Registrar medida</button></form>' : '') +
      '</section>' +
      '<section class="card"><h4>Dirección del Trabajo</h4><label class="switch"><span class="txt"><b>Informe de investigación enviado</b><span>Registra cuándo envías las conclusiones.</span></span><input type="checkbox" data-change="dt-report"' + (c.dtReport ? ' checked' : '') + '></label></section>' +
      '</aside></div></div>';
  }
  function info(k, v) { return '<div class="comment" style="gap:2px"><span class="xs muted">' + k + '</span><b class="small">' + esc(v) + '</b></div>'; }
  function venc(c) { const d = D2.parseDate(c.received); d.setDate(d.getDate() + D2.DEADLINE_DAYS); return d.getDate() + ' ' + ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]; }
  const current = () => D2.state.complaints.find((c) => c.code === D2.ui.rrhhCase);

  Object.assign(D2.actions, {
    'open-case'(el) {
      D2.state.role = 'rrhh';
      D2.state.view.rrhh = 'denuncias';
      D2.ui.rrhhCase = el.dataset.code;
      const c = current();
      if (c) c.unread = false;
      D2.save();
      D2.render({ scroll: true });
      D2.scrollChat();
    },
    'close-case'() { D2.ui.rrhhCase = null; D2.render({ scroll: true }); },
    rfilter(el) { D2.ui.rrhhFilter = el.dataset.f; D2.render(); },
    'set-status'(el) {
      const c = current();
      const s = Number(el.dataset.s);
      if (s === c.status) return;
      c.status = s;
      if (s === 3 && !c.resolution) c.resolution = 'Caso cerrado por el equipo de Personas.';
      c.messages.push({ from: 'system', text: 'Estado cambiado a "' + D2.STATUSES[s] + '"', at: D2.stamp() });
      D2.save();
      D2.render();
      D2.scrollChat();
      D2.toast('Estado actualizado: ' + D2.STATUSES[s]);
    },
  });
  D2.forms['rrhh-msg'] = function (form) {
    const text = String(new FormData(form).get('msg') || '').trim();
    if (!text) return;
    current().messages.push({ from: 'rrhh', text, at: D2.stamp() });
    D2.save();
    D2.render();
    D2.scrollChat();
    D2.toast('Respuesta enviada. La persona la verá con su código.', 'send');
  };
  D2.forms.measure = function (form) {
    const text = String(new FormData(form).get('m') || '').trim();
    if (!text) return;
    const c = current();
    c.measures = (c.measures || []).concat(text);
    c.messages.push({ from: 'system', text: 'Medida de resguardo registrada', at: D2.stamp() });
    D2.save();
    D2.render();
  };
  D2.changes['dt-report'] = function (el) {
    current().dtReport = el.checked;
    D2.save();
    D2.toast(el.checked ? 'Envío a la Dirección del Trabajo registrado' : 'Envío desmarcado');
  };

  /* ---------- Clima ---------- */
  V.clima = function () {
    const comp = D2.companyScores();
    const areas = D2.areaData();
    const sorted = D2.DIMS.slice().sort((a, b) => comp.scores[b.key] - comp.scores[a.key]);
    const comments = D2.COMMENTS.slice();
    const own = D2.state.worker.survey;
    if (own && own.open) comments.unshift({ area: 'ops', dim: null, text: own.open, isNew: true });
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Encuesta mensual · Septiembre 2026</span><h1>Clima laboral</h1><p>Resultados agregados. Las áreas con menos de ' + D2.MIN_RESPONSES + ' respuestas no se muestran, para proteger el anonimato.</p></div></div>' +
      '<div class="grid g4">' +
      kpi('Índice general', D2.f2(comp.index) + '<small> /5</small>', '+' + D2.f2(comp.index - 3.41), true, 'vs agosto') +
      kpi('Participación', Math.round((comp.resp / 48) * 100) + '<small>%</small>', null, null, comp.resp + ' de 48 respondieron') +
      kpi('Lo más alto', D2.f1(comp.scores[sorted[0].key]), null, null, sorted[0].label) +
      kpi('Lo más bajo', D2.f1(comp.scores[sorted[sorted.length - 1].key]), null, null, sorted[sorted.length - 1].label) +
      '</div>' +
      '<div class="grid g2">' +
      '<section class="card"><div class="card-head"><div><h3>Por dimensión</h3><p>Promedio de la empresa, escala 1 a 5</p></div><div class="legend"><span><i class="dash"></i>Meta 3,5</span></div></div>' +
      D2.hbars(D2.DIMS.map((d) => ({ label: d.label, v: comp.scores[d.key] })), { target: D2.TARGET, s1: 'Empresa' }) + '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Evolución del índice</h3><p>Abril a septiembre 2026</p></div></div>' +
      D2.chartSlot({ labels: D2.MONTHS, values: [3.21, 3.25, 3.3, 3.34, 3.41, comp.index], min: 3, max: 4, ticks: [3, 3.5, 4], fmt: (v) => D2.f1(v), endFmt: (v) => D2.f2(v), goal: 3.5, goalLabel: 'Meta 3,5', aria: 'Evolución del índice de clima', height: 230 }) + '</section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><div><h3>Por área y dimensión</h3><p>Pasa el cursor por una celda para ver el detalle</p></div>' +
      '<div class="heat-legend"><span>Bajo la meta</span><span class="ramp"></span><span>Sobre la meta</span></div></div>' +
      '<div class="table-wrap"><table class="heat"><thead><tr><th>Área</th>' + D2.DIMS.map((d) => '<th>' + d.label + '</th>').join('') + '<th>Índice</th><th class="r">Respuestas</th></tr></thead><tbody>' +
      areas.map((a) => {
        if (!a.visible) return '<tr><td><b>' + a.name + '</b></td><td class="hidden-cell" colspan="' + (D2.DIMS.length + 1) + '">' + D2.icon('eyeOff').replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px;margin-right:6px"') + 'Oculto para proteger el anonimato: ' + a.resp + ' respuestas, mínimo ' + D2.MIN_RESPONSES + '</td><td class="r num">' + a.resp + '/' + a.size + '</td></tr>';
        return '<tr><td><b>' + a.name + '</b></td>' + D2.DIMS.map((d) => { const v = a.scores[d.key]; return '<td class="cell" style="' + D2.heatBg(v) + '" data-tip="' + esc('<b>' + D2.f1(v) + '</b>' + a.name + ' · ' + d.label) + '">' + D2.f1(v) + '</td>'; }).join('') +
          '<td class="cell" style="' + D2.heatBg(a.index) + '"><b>' + D2.f2(a.index) + '</b></td><td class="r num">' + a.resp + '/' + a.size + '</td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Comentarios anónimos</h3><p>Respuestas a "¿Qué cambiarías este mes para trabajar mejor?"</p></div><span class="pill pill-neutral nodot">' + comments.length + ' comentarios</span></div>' +
      '<div class="grid g2" style="gap:10px">' + comments.map((c) => '<div class="comment"><q>' + esc(c.text) + '</q><span class="meta">' + D2.AREAS.find((a) => a.id === c.area).name + (c.dim ? ' · ' + D2.dimLabel(c.dim) : '') + (c.isNew ? ' · <b style="color:var(--brand)">Nuevo</b>' : '') + '</span></div>').join('') + '</div></section>' +
      '</div>';
  };

  /* ---------- Pausas ---------- */
  V.pausas = function () {
    const ppl = D2.PEOPLE;
    const sch = ppl.reduce((n, p) => n + p.scheduled, 0);
    const done = ppl.reduce((n, p) => n + p.completed, 0);
    const post = ppl.reduce((n, p) => n + p.postponed, 0);
    const skip = ppl.reduce((n, p) => n + p.skipped, 0);
    const byArea = D2.pauseByArea();
    const areaOpts = '<option value="all">Todas las áreas</option>' + D2.AREAS.map((a) => '<option value="' + a.id + '"' + (D2.ui.peopleArea === a.id ? ' selected' : '') + '>' + a.name + '</option>').join('');
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Semana del 28 de septiembre</span><h1>Pausas activas</h1><p>Cumplimiento por área y por persona. Cada pausa dura ' + D2.state.policy.dur + ' minutos.</p></div></div>' +
      '<div class="grid g4">' +
      kpi('Cumplimiento', Math.round((done / sch) * 100) + '<small>%</small>', '+3 pts', true, 'vs semana anterior') +
      kpi('Completadas', done, null, null, 'de ' + sch + ' programadas') +
      kpi('Pospuestas', post, null, null, 'Máximo ' + D2.state.policy.maxPostpones + ' por día') +
      kpi('Saltadas', skip, null, null, 'Con motivo registrado') +
      '</div>' +
      '<div class="grid g2">' +
      '<section class="card"><div class="card-head"><div><h3>Cumplimiento semanal</h3><p>Desde que se activó Desconecta2</p></div></div>' +
      D2.chartSlot({ labels: D2.WEEKS, values: D2.WEEKLY_COMPANY, min: 40, max: 100, ticks: [40, 60, 80, 100], fmt: (v) => v + '%', goal: 80, goalLabel: 'Meta 80%', tipPrefix: 'Semana del ', aria: 'Cumplimiento semanal de pausas' }) + '</section>' +
      '<div class="stack">' +
      '<section class="card"><div class="card-head"><div><h3>Por área</h3><p>% de pausas completadas</p></div><div class="legend"><span><i class="dash"></i>Meta 80%</span></div></div>' +
      D2.hbars(byArea.map((a) => ({ label: a.name, v: a.pct })), { max: 100, target: 80, fmt: (v) => Math.round(v) + '%', s1: 'Cumplimiento' }) + '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Motivos para saltar</h3><p>Últimos 30 días</p></div></div>' +
      D2.hbars(D2.SKIP_REASONS.map((r) => ({ label: r.label, v: r.n })), { max: 40, fmt: (v) => String(v), s1: 'Pausas' }) + '</section>' +
      '</div></div>' +
      '<section class="card"><div class="card-head"><div><h3>Por persona</h3><p>Ordenado de menor a mayor cumplimiento</p></div>' +
      '<div class="row"><label class="visually-hidden" for="pq">Buscar persona</label><input id="pq" class="input" style="width:200px" placeholder="Buscar persona" value="' + esc(D2.ui.peopleQuery) + '" data-input="people-q">' +
      '<label class="visually-hidden" for="pa">Área</label><select id="pa" class="select" style="width:auto" data-change="people-area">' + areaOpts + '</select></div></div>' +
      '<div class="notice info">' + D2.icon('alert') + '<span>Estos datos son identificados. Informa en el reglamento interno que se registran las pausas y para qué se usan.</span></div>' +
      '<div class="table-wrap" id="people-table">' + peopleTable() + '</div></section>' +
      '</div>';
  };
  function peopleTable() {
    const q = D2.ui.peopleQuery.toLowerCase();
    const rows = D2.PEOPLE.filter((p) => (D2.ui.peopleArea === 'all' || p.area === D2.ui.peopleArea) && (!q || p.name.toLowerCase().includes(q)))
      .slice().sort((a, b) => a.completed / a.scheduled - b.completed / b.scheduled);
    if (!rows.length) return '<div class="empty">' + D2.icon('search') + '<span>Nadie coincide con la búsqueda.</span></div>';
    return '<table><thead><tr><th>Persona</th><th>Área</th><th class="hide-mobile">Cargo</th><th style="min-width:160px">Cumplimiento</th><th class="r">Completadas</th><th class="r">Pospuestas</th><th class="r">Saltadas</th></tr></thead><tbody>' +
      rows.map((p) => '<tr><td style="white-space:nowrap"><span class="row nowrap" style="gap:8px"><span class="avatar" style="width:28px;height:28px;font-size:11px">' + D2.initials(p.name) + '</span>' + esc(p.name) + '</span></td><td style="white-space:nowrap">' + D2.AREAS.find((a) => a.id === p.area).name + '</td><td class="hide-mobile muted">' + p.cargo + '</td><td>' + D2.minibar(p.completed, p.scheduled) + '</td><td class="r num">' + p.completed + '/' + p.scheduled + '</td><td class="r num">' + p.postponed + '</td><td class="r num">' + p.skipped + '</td></tr>').join('') +
      '</tbody></table>';
  }
  D2.peopleTable = peopleTable;
  D2.changes['people-q'] = function (el) { D2.ui.peopleQuery = el.value; document.getElementById('people-table').innerHTML = peopleTable(); };
  D2.changes['people-area'] = function (el) { D2.ui.peopleArea = el.value; document.getElementById('people-table').innerHTML = peopleTable(); };

  /* ---------- Políticas ---------- */
  V.politicas = function () {
    const p = D2.state.policy;
    const sel = (name, vals, cur, fmt) => '<select id="pol-' + name + '" name="' + name + '" class="select">' + vals.map((v) => '<option value="' + v + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + (fmt ? fmt(v) : v) + '</option>').join('') + '</select>';
    const sw = (name, title, sub, on) => '<label class="switch"><span class="txt"><b>' + title + '</b><span>' + sub + '</span></span><input type="checkbox" name="' + name + '"' + (on ? ' checked' : '') + '></label>';
    const min = (v) => v + ' min';
    return '<div class="page"><form data-form="policy" class="page" style="gap:22px">' +
      '<div class="page-head"><div><span class="eyebrow">Configuración de la empresa</span><h1>Políticas</h1><p>Lo que definas aquí se aplica a las 48 personas. Cada trabajador ajusta sus pausas dentro de estos límites.</p></div>' +
      '<button class="btn btn-primary" type="submit">Guardar cambios</button></div>' +
      '<div class="grid g2">' +
      '<section class="card"><h3>Pausas activas</h3>' +
      '<div class="grid g2" style="gap:14px">' +
      '<div class="field"><label for="pol-freq">Frecuencia por defecto</label>' + sel('freq', [60, 75, 90, 105, 120], p.freq, (v) => 'Cada ' + v + ' min') + '</div>' +
      '<div class="field"><label for="pol-dur">Duración de cada pausa</label>' + sel('dur', [3, 5, 7, 10], p.dur, min) + '</div>' +
      '<div class="field"><label for="pol-freqMin">El trabajador puede elegir desde</label>' + sel('freqMin', [45, 60, 75, 90], p.freqMin, (v) => 'Cada ' + v + ' min') + '</div>' +
      '<div class="field"><label for="pol-freqMax">Hasta</label>' + sel('freqMax', [90, 105, 120, 150], p.freqMax, (v) => 'Cada ' + v + ' min') + '</div>' +
      '<div class="field"><label for="pol-maxPostpones">Aplazamientos por día</label>' + sel('maxPostpones', [0, 1, 2, 3], p.maxPostpones, (v) => (v ? v + (v === 1 ? ' vez' : ' veces') : 'No permitir')) + '</div>' +
      '<div class="field"><label for="pol-postponeMin">Cada aplazamiento</label>' + sel('postponeMin', [5, 10, 15], p.postponeMin, min) + '</div>' +
      '</div>' +
      '<div>' + sw('allowSkip', 'Permitir saltar pausas', 'El trabajador indica el motivo y queda registrado.', p.allowSkip) + '</div>' +
      '</section>' +
      '<section class="card"><h3>Jornada y desconexión</h3>' +
      '<div class="grid g2" style="gap:14px"><div class="field"><label for="pol-start">Inicio de jornada</label><input id="pol-start" name="start" type="time" class="input" value="' + p.start + '"></div>' +
      '<div class="field"><label for="pol-end">Fin de jornada</label><input id="pol-end" name="end" type="time" class="input" value="' + p.end + '"></div></div>' +
      '<div>' + sw('dnd', 'No molestar durante las pausas', 'Silencia notificaciones en notebook y celular corporativo.', p.dnd) +
      sw('offHours', 'Desconexión fuera de la jornada', 'Pausa las apps de trabajo desde el fin de la jornada hasta el inicio del día siguiente.', p.offHours) + '</div>' +
      '</section></div>' +
      '<section class="card"><div class="card-head"><div><h3>Apps que se pausan</h3><p>Se bloquean durante las pausas y fuera de la jornada. Toca para activar o desactivar.</p></div></div>' +
      '<div class="app-tiles">' + D2.APPS.map((a) => '<label class="app-tile' + (p.apps[a.id] ? '' : ' off') + '" style="position:relative"><input type="checkbox" name="app_' + a.id + '"' + (p.apps[a.id] ? ' checked' : '') + ' data-change="app-tile">' + D2.appTile(a) + a.name + '</label>').join('') + '</div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Dispositivos e integraciones</h3><p>96 dispositivos vinculados: 48 notebooks y 48 celulares corporativos.</p></div></div>' +
      '<div class="grid g3" style="gap:10px">' +
      [['Microsoft Intune', 'Bloqueo de apps en notebooks'], ['Google Workspace', 'Modo No molestar en Gmail y Chat'], ['Slack', 'Estado "En pausa" automático']].map((i) => '<div class="device">' + D2.icon('laptop') + '<div class="grow"><b>' + i[0] + '</b><span>' + i[1] + '</span></div><span class="pill pill-ok">Conectado</span></div>').join('') +
      '</div></section>' +
      '<div class="row"><button class="btn btn-primary" type="submit">Guardar cambios</button><button class="btn btn-ghost" type="button" data-act="reset">Reiniciar demo</button></div>' +
      '</form></div>';
  };
  D2.changes['app-tile'] = function (el) { el.closest('.app-tile').classList.toggle('off', !el.checked); };
  D2.forms.policy = function (form) {
    const fd = new FormData(form);
    const p = D2.state.policy;
    const freqMin = Number(fd.get('freqMin')), freqMax = Number(fd.get('freqMax'));
    if (freqMin > freqMax) { D2.toast('El mínimo de frecuencia no puede ser mayor que el máximo', 'alert'); return; }
    if (String(fd.get('start')) >= String(fd.get('end'))) { D2.toast('El fin de jornada debe ser después del inicio', 'alert'); return; }
    Object.assign(p, {
      freq: Math.max(freqMin, Math.min(freqMax, Number(fd.get('freq')))), dur: Number(fd.get('dur')), freqMin, freqMax,
      maxPostpones: Number(fd.get('maxPostpones')), postponeMin: Number(fd.get('postponeMin')),
      allowSkip: !!fd.get('allowSkip'), dnd: !!fd.get('dnd'), offHours: !!fd.get('offHours'),
      start: String(fd.get('start')), end: String(fd.get('end')),
    });
    D2.APPS.forEach((a) => { p.apps[a.id] = !!fd.get('app_' + a.id); });
    D2.save();
    D2.render();
    D2.toast('Política guardada. Ya se aplica a las 48 personas.');
  };
})();
