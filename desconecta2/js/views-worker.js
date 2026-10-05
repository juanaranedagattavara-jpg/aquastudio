/* Desconecta2 · vista Trabajador (app del colaborador). */
(function () {
  const D2 = window.D2;
  const V = D2.views.worker;
  const esc = D2.esc;
  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* ---------- Piezas compartidas con RR.HH. ---------- */
  D2.stepper = function (status) {
    return '<div class="stepper" aria-label="Estado: ' + D2.STATUSES[status] + '">' + D2.STATUSES.map((s, i) =>
      '<div class="st ' + (i < status ? 'done' : i === status ? (status === 3 ? 'done current' : 'current') : '') + '"><i></i>' + s + '</div>').join('') + '</div>';
  };
  D2.chatHtml = function (c, perspective) {
    return '<div class="chat" id="chat">' + c.messages.map((m) => {
      if (m.from === 'system') return '<div class="msg system">' + esc(m.text) + ' · ' + D2.fmtDateTime(m.at) + '</div>';
      const mine = perspective === 'worker' ? m.from === 'me' : m.from === 'rrhh';
      const who = m.from === 'me' ? (perspective === 'worker' ? 'Tú' : 'Denunciante (anónimo)') : 'Equipo de Personas';
      return '<div class="msg ' + (mine ? 'me' : 'them') + '"><span class="meta">' + who + ' · ' + D2.fmtDateTime(m.at) + '</span>' + esc(m.text) + '</div>';
    }).join('') + '</div>';
  };
  D2.deadlineInfo = function (c) {
    const days = D2.daysSince(c.received);
    const left = D2.DEADLINE_DAYS - days;
    return { days, left };
  };
  function scrollChat() { const ch = document.getElementById('chat'); if (ch) ch.scrollTop = ch.scrollHeight; }
  D2.scrollChat = scrollChat;

  /* ---------- Inicio ---------- */
  V.inicio = function () {
    const st = D2.state, w = st.worker, pol = st.policy;
    const today = new Date(D2.now());
    const slots = D2.slots();
    const next = D2.nextSlot();
    const done = slots.filter((s) => s.status === 'completada').length;
    const routineName = { mixta: 'Rutina mixta', respiracion: 'Solo respiración', movilidad: 'Solo movilidad' }[w.prefs.routine];
    const slotHtml = slots.map((s) => {
      const cls = s.status || (next && s.label === next.label ? 'proxima' : '');
      const lbl = { completada: 'Completada', saltada: 'Saltada' }[s.status] || (cls === 'proxima' ? (s.snooze ? 'Pospuesta' : 'Próxima') : 'Pendiente');
      return '<div class="slot ' + cls + '" data-tip="<b>' + s.label + '</b>' + lbl + '"><i></i>' + s.label + '</div>';
    }).join('');
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">' + DAYS[today.getDay()] + ' ' + today.getDate() + ' de ' + MONTHS[today.getMonth()] + ' · <span data-clock class="num"></span></span>' +
      '<h1>Hola, Camila</h1><p>Estás en tu jornada. La desconexión automática empieza a las ' + pol.end + '.</p></div></div>' +
      '<div class="grid g-main">' +
      '<div class="stack">' +
      '<section class="card next-pause"><div class="rings"></div>' +
      (next
        ? '<div class="eyebrow">Próxima pausa activa · ' + (next.snooze ? D2.hhmm(next.snooze) + ' (pospuesta)' : next.label) + '</div>' +
          '<div class="count" data-countdown aria-live="off"></div>' +
          '<div class="sub">' + routineName + ' · ' + pol.dur + ' min · No molestar y apps en pausa mientras dura</div>'
        : '<div class="eyebrow">Pausas de hoy</div><div class="count">Listo</div><div class="sub">No te quedan pausas programadas hoy.</div>') +
      '<div class="row">' +
      '<button class="btn btn-primary" data-act="pause-now" style="background:var(--pause-glow);color:#06180E">' + D2.icon('play') + 'Hacer mi pausa ahora</button>' +
      (next ? '<button class="btn btn-ghost" data-act="pause-test">' + D2.icon('bell') + 'Probar la alarma</button>' : '') +
      '</div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Tus pausas de hoy</h3><p>' + done + ' de ' + slots.length + ' completadas · cada ' + D2.effectiveFreq() + ' minutos</p></div>' +
      '<button class="btn btn-quiet btn-sm" data-act="go" data-view="pausas">Ajustar</button></div>' +
      '<div class="timeline">' + slotHtml + '</div>' +
      '<div class="legend"><span><i style="background:var(--ok)"></i>Completada</span><span><i style="background:var(--accent)"></i>Próxima</span><span><i style="background:var(--crit)"></i>Saltada</span><span><i style="background:var(--surface-3)"></i>Pendiente</span></div>' +
      '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Desconexión</h3><p>Tu jornada: ' + pol.start + ' a ' + pol.end + '</p></div><span class="pill pill-ok">En jornada</span></div>' +
      D2.DEVICES.map((d) => '<div class="device">' + D2.icon(d.kind) + '<div class="grow"><b>' + d.name + '</b><span>' + d.model + '</span></div><span class="pill pill-neutral nodot">Conectado</span></div>').join('') +
      '<div class="row"><button class="btn btn-quiet btn-sm" data-act="offhours">' + D2.icon('moon') + 'Ver cómo se ve a las ' + pol.end + '</button></div>' +
      '</section>' +
      '</div>' +
      '<div class="stack">' +
      (w.survey
        ? '<section class="card"><div class="row nowrap"><span class="icon-dot ok">' + D2.icon('check') + '</span><div><h4>Encuesta de septiembre respondida</h4><p class="small muted">Gracias. Los resultados se comparten con tu equipo en noviembre.</p></div></div></section>'
        : '<section class="card"><div class="row nowrap"><span class="icon-dot brand">' + D2.icon('survey') + '</span><div><span class="eyebrow">Pendiente · cierra el 7 de octubre</span><h4>Encuesta de clima de septiembre</h4></div></div>' +
          '<p class="small ink2">6 preguntas, 2 minutos. Es anónima: tu jefatura solo ve promedios de equipos con 5 o más respuestas.</p>' +
          '<button class="btn btn-primary" data-act="go" data-view="encuesta">Responder ahora</button></section>') +
      '<section class="card"><div class="row nowrap"><span class="icon-dot brand">' + D2.icon('shield') + '</span><div><span class="eyebrow">100% anónimo</span><h4>Canal de denuncias</h4></div></div>' +
      '<p class="small ink2">Si algo no está bien en tu trabajo, cuéntalo. Llega directo a RR.HH. y nadie sabrá que fuiste tú.</p>' +
      '<div class="row"><button class="btn btn-ghost" data-act="go" data-view="denuncias" data-tab="nueva">Hacer una denuncia</button><button class="link small" data-act="go" data-view="denuncias" data-tab="seguir">Seguir mi denuncia</button></div></section>' +
      '<section class="card flat"><h4>Cómo te has sentido después de tus pausas</h4>' + moodSummary() + '</section>' +
      '</div></div></div>';
  };
  function moodSummary() {
    const moods = D2.state.worker.moods;
    const base = [4, 4, 3, 5, 4, 4, 3];
    const all = base.concat(moods.map((m) => m.mood));
    const a = D2.avg(all);
    return '<div class="row nowrap"><span style="width:44px;height:44px;color:var(--brand)">' + D2.face(Math.round(a)) + '</span><div><b class="num">' + D2.f1(a) + ' de 5</b><p class="small muted">Promedio de tus últimas ' + all.length + ' pausas. Solo tú ves este dato.</p></div></div>';
  }

  /* ---------- Mis pausas ---------- */
  V.pausas = function () {
    const st = D2.state, w = st.worker, pol = st.policy;
    const slots = D2.slots();
    const doneToday = slots.filter((s) => s.status === 'completada').length;
    const week = w.week.concat([{ d: 'Hoy', v: doneToday, today: true }]);
    const freq = D2.effectiveFreq();
    const chip = (name, val, label, cur) => '<label class="chip-radio"><input type="radio" name="' + name + '" value="' + val + '"' + (String(cur) === String(val) ? ' checked' : '') + '><span>' + label + '</span></label>';
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Pausas activas</span><h1>Mis pausas</h1><p>Tu empresa define los límites. Dentro de ellos, tú ajustas tus pausas.</p></div></div>' +
      '<div class="grid g2">' +
      '<section class="card"><div class="card-head"><div><h3>Mis preferencias</h3><p>Los cambios se aplican desde la próxima pausa.</p></div></div>' +
      '<form data-form="prefs" class="stack">' +
      '<div class="range-row"><div class="row"><label class="small" for="pref-freq"><b>Frecuencia</b></label><span class="num small" id="freq-out">Cada ' + freq + ' min</span></div>' +
      '<input id="pref-freq" name="freq" type="range" min="' + pol.freqMin + '" max="' + pol.freqMax + '" step="15" value="' + freq + '" data-input="freq-out">' +
      '<div class="row xs muted" style="justify-content:space-between"><span>' + pol.freqMin + ' min</span><span>' + pol.freqMax + ' min</span></div></div>' +
      '<div class="field"><span class="label">Tipo de rutina</span><div class="chips">' + chip('routine', 'mixta', 'Mixta', w.prefs.routine) + chip('routine', 'respiracion', 'Solo respiración', w.prefs.routine) + chip('routine', 'movilidad', 'Solo movilidad', w.prefs.routine) + '</div></div>' +
      '<div class="field"><span class="label">Avisarme antes</span><div class="chips">' + chip('remind', 1, '1 min', w.prefs.remind) + chip('remind', 5, '5 min', w.prefs.remind) + chip('remind', 10, '10 min', w.prefs.remind) + '</div></div>' +
      '<div class="notice info">' + D2.icon('lock') + '<span><b>Definido por tu empresa</b>Pausas de ' + pol.dur + ' minutos, cada ' + pol.freqMin + ' a ' + pol.freqMax + ' minutos, entre ' + pol.start + ' y ' + pol.end + '. Puedes posponer ' + pol.maxPostpones + ' veces al día.</span></div>' +
      '<button class="btn btn-primary" type="submit">Guardar preferencias</button>' +
      '</form></section>' +
      '<div class="stack">' +
      '<section class="card"><div class="card-head"><div><h3>Esta semana</h3><p>Pausas completadas por día (de 4)</p></div></div>' +
      '<div class="week-bars" style="grid-template-columns:repeat(' + week.length + ',minmax(0,1fr))">' + week.map((d) =>
        '<div class="wb' + (d.today ? ' today' : '') + '" data-tip="<b>' + d.v + ' de 4</b>' + d.d + '"><b>' + d.v + '</b><i style="height:' + Math.max(4, (d.v / 4) * 80) + 'px"></i>' + d.d + '</div>').join('') + '</div>' +
      '<div class="grid g3" style="gap:10px"><div class="kpi"><span class="eyebrow">Semana pasada</span><span class="num" style="font-weight:800;font-size:1.3rem">85%</span></div><div class="kpi"><span class="eyebrow">Pospuestas</span><span class="num" style="font-weight:800;font-size:1.3rem">' + (3 + w.postponesUsed) + '</span></div><div class="kpi"><span class="eyebrow">Saltadas</span><span class="num" style="font-weight:800;font-size:1.3rem">' + (1 + w.skipReasons.length) + '</span></div></div>' +
      '</section>' +
      '<section class="card"><div class="card-head"><div><h3>Durante tus pausas</h3><p>Se activa No molestar y estas apps quedan en pausa.</p></div></div>' +
      D2.DEVICES.map((d) => '<div class="device">' + D2.icon(d.kind) + '<div class="grow"><b>' + d.name + '</b><span>' + d.model + '</span></div><span class="pill pill-ok">Vinculado</span></div>').join('') +
      '<div class="app-tiles">' + D2.blockedApps().map((a) => '<span class="app-tile">' + D2.appTile(a) + a.name + D2.icon('lock', 'lock') + '</span>').join('') + '</div>' +
      '</section>' +
      '<section class="card flat"><h4>Probar en la demo</h4><p class="small ink2">El reloj de la demo parte a las 11:46. Usa estos atajos para ver cada momento.</p>' +
      '<div class="row"><button class="btn btn-quiet btn-sm" data-act="pause-test">' + D2.icon('bell') + 'Sonar la alarma</button><button class="btn btn-quiet btn-sm" data-act="pause-now">' + D2.icon('play') + 'Pausa ahora</button><button class="btn btn-quiet btn-sm" data-act="offhours">' + D2.icon('moon') + 'Fin de jornada</button></div></section>' +
      '</div></div></div>';
  };
  D2.changes['freq-out'] = (el) => { const o = document.getElementById('freq-out'); if (o) o.textContent = 'Cada ' + el.value + ' min'; };
  D2.forms.prefs = function (form) {
    const fd = new FormData(form);
    const w = D2.state.worker;
    w.prefs.freq = Number(fd.get('freq'));
    w.prefs.routine = fd.get('routine') || 'mixta';
    w.prefs.remind = Number(fd.get('remind') || 1);
    D2.save();
    D2.render();
    D2.toast('Preferencias guardadas. Próxima pausa: ' + (D2.nextSlot() ? D2.nextSlot().label : 'mañana'));
  };

  /* ---------- Encuesta ---------- */
  V.encuesta = function () {
    const w = D2.state.worker;
    if (w.survey) {
      return '<div class="page"><div class="page-head"><div><span class="eyebrow">Clima laboral · Septiembre 2026</span><h1>Gracias por responder</h1><p>Tus respuestas se sumaron a las de tu equipo sin tu nombre.</p></div></div>' +
        '<div class="grid g2"><section class="card"><h3>Qué pasa ahora</h3><div class="list">' +
        '<div class="list-item"><span class="icon-dot brand">' + D2.icon('users') + '</span><div class="grow"><b>Se suman a tu equipo</b><span class="small muted">Tu jefatura ve promedios solo si responden 5 o más personas.</span></div></div>' +
        '<div class="list-item"><span class="icon-dot brand">' + D2.icon('listcheck') + '</span><div class="grow"><b>Tu jefatura arma un plan</b><span class="small muted">Con los temas más bajos se definen acciones concretas.</span></div></div>' +
        '<div class="list-item"><span class="icon-dot brand">' + D2.icon('calendar') + '</span><div class="grow"><b>Próxima encuesta</b><span class="small muted">Fines de octubre. Siempre 6 preguntas.</span></div></div>' +
        '</div></section>' +
        '<section class="card flat"><h4>Si necesitas contar algo concreto</h4><p class="small ink2">La encuesta mide el ambiente general. Si viviste una situación de acoso, maltrato o discriminación, usa el canal de denuncias anónimo.</p><button class="btn btn-ghost" data-act="go" data-view="denuncias" data-tab="nueva">Ir al canal de denuncias</button></section></div></div>';
    }
    return '<div class="page"><div class="page-head"><div><span class="eyebrow">Clima laboral · Septiembre 2026</span><h1>¿Cómo estuvo tu mes?</h1><p>6 preguntas, 2 minutos. Anónima: nadie ve tus respuestas individuales.</p></div></div>' +
      '<div class="grid g-main"><section class="card"><form data-form="survey" novalidate>' +
      D2.DIMS.map((d, i) => '<fieldset class="q" style="border:0;margin:0;padding-inline:0"><legend class="visually-hidden">' + esc(d.q) + '</legend>' +
        '<div class="q-title"><span class="qn">' + String(i + 1).padStart(2, '0') + '</span><div><b>' + esc(d.q) + '</b><div class="q-dim">' + d.label + '</div></div></div>' +
        '<div class="likert">' + [1, 2, 3, 4, 5].map((v) => '<label><input type="radio" name="q_' + d.key + '" value="' + v + '"><span>' + v + '<small>' + D2.LIKERT[v - 1] + '</small></span></label>').join('') + '</div></fieldset>').join('') +
      '<div class="q"><label class="q-title" for="survey-open"><span class="qn">07</span><div><b>¿Qué cambiarías este mes para trabajar mejor?</b><div class="q-dim">Opcional · no escribas nombres si quieres mantener el anonimato</div></div></label>' +
      '<textarea id="survey-open" name="open" class="textarea" style="min-height:90px" maxlength="400" placeholder="Escribe aquí"></textarea></div>' +
      '<div class="row" style="padding-top:8px"><button class="btn btn-primary" type="submit">Enviar respuestas</button><span class="small" id="survey-error" style="color:var(--crit)" role="alert"></span></div>' +
      '</form></section>' +
      '<aside class="stack"><section class="card flat"><h4>Así protegemos tu anonimato</h4><div class="list">' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('eyeOff') + '</span><div class="grow small">Las respuestas se guardan sin tu nombre ni tu correo.</div></div>' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('users') + '</span><div class="grow small">Los equipos con menos de 5 respuestas no muestran resultados.</div></div>' +
      '<div class="list-item"><span class="icon-dot brand">' + D2.icon('message') + '</span><div class="grow small">Los comentarios se muestran sin fecha ni hora exacta.</div></div>' +
      '</div></section></aside></div></div>';
  };
  D2.forms.survey = function (form) {
    const fd = new FormData(form);
    const answers = {};
    let missing = 0;
    D2.DIMS.forEach((d) => { const v = fd.get('q_' + d.key); if (v) answers[d.key] = Number(v); else missing++; });
    if (missing) {
      document.getElementById('survey-error').textContent = 'Te falta' + (missing > 1 ? 'n ' + missing + ' preguntas' : ' 1 pregunta') + ' por responder.';
      return;
    }
    D2.state.worker.survey = { answers, open: String(fd.get('open') || '').trim() };
    D2.save();
    D2.render({ scroll: true });
    D2.toast('Respuestas enviadas de forma anónima');
  };

  /* ---------- Denuncias ---------- */
  V.denuncias = function () {
    const ui = D2.ui;
    const tab = ui.complaintTab;
    return '<div class="page">' +
      '<div class="page-head"><div><span class="eyebrow">Canal anónimo · Ley Karin</span><h1>Canal de denuncias</h1><p>Llega directo al equipo de Personas de ' + D2.company.name + '. Nadie sabrá que fuiste tú.</p></div>' +
      '<div class="toggle-tabs" role="group" aria-label="Opciones"><button data-act="ctab" data-tab="nueva" aria-pressed="' + (tab === 'nueva') + '">Nueva denuncia</button><button data-act="ctab" data-tab="seguir" aria-pressed="' + (tab === 'seguir') + '">Seguir mi denuncia</button></div></div>' +
      '<section class="card flat"><div class="anon-points">' +
      '<div>' + D2.icon('eyeOff') + '<b>Sin nombre ni correo</b>No pedimos ni guardamos quién eres, tu IP ni tu dispositivo.</div>' +
      '<div>' + D2.icon('inbox') + '<b>Solo RR.HH. la recibe</b>Las jefaturas no tienen acceso a las denuncias.</div>' +
      '<div>' + D2.icon('message') + '<b>Conversación anónima</b>Con tu código ves el avance y respondes preguntas de RR.HH.</div>' +
      '</div></section>' +
      (tab === 'nueva' ? newComplaint() : followComplaint()) +
      '</div>';
  };

  function newComplaint() {
    const ui = D2.ui;
    if (ui.newCode) {
      return '<section class="card" style="max-width:720px"><div class="row nowrap"><span class="icon-dot ok">' + D2.icon('check') + '</span><div><h2>Denuncia enviada</h2><p class="small muted">RR.HH. la recibió recién. Tu identidad no quedó registrada.</p></div></div>' +
        '<div class="field"><span class="label">Tu código de seguimiento</span><div class="code-box"><span class="code" id="new-code">' + ui.newCode + '</span><button class="btn btn-quiet btn-sm" data-act="copy-code">' + D2.icon('copy') + (ui.copied ? 'Copiado' : 'Copiar') + '</button></div></div>' +
        '<div class="notice warn">' + D2.icon('alert') + '<span><b>Guarda este código ahora</b>Es la única forma de ver el avance y conversar con RR.HH. Si lo pierdes no podemos recuperarlo, porque no sabemos quién eres.</span></div>' +
        '<div class="row"><button class="btn btn-primary" data-act="follow-new">Ver mi denuncia</button><button class="btn btn-ghost" data-act="new-again">Hacer otra denuncia</button></div></section>';
    }
    const areaOpts = '<option>Prefiero no decirlo</option>' + D2.AREAS.map((a) => '<option>' + a.name + '</option>').join('');
    return '<section class="card"><form data-form="complaint" class="stack" style="gap:20px" novalidate>' +
      '<div class="field"><span class="label">¿Qué tipo de situación quieres denunciar?</span><div class="choice-grid">' +
      D2.CATEGORIES.map((c) => '<label class="choice"><input type="radio" name="cat" value="' + c.id + '"><b>' + c.name + '</b><span>' + c.hint + '</span></label>').join('') + '</div></div>' +
      '<div class="field"><label for="c-desc">¿Qué pasó?</label><textarea id="c-desc" name="desc" class="textarea" maxlength="2000" placeholder="Qué pasó, cuándo y dónde. Puedes escribir con tus palabras."></textarea>' +
      '<span class="hint">Si quieres mantener el anonimato, evita datos que te identifiquen (tu nombre, tu turno exacto).</span></div>' +
      '<div class="grid g2"><div class="field"><label for="c-where">¿Dónde ocurrió?</label><select id="c-where" name="where" class="select">' + areaOpts + '</select></div>' +
      '<div class="field"><label for="c-when">¿Cuándo ocurrió?</label><select id="c-when" name="when" class="select"><option>Esta semana</option><option>Último mes</option><option>Hace más de un mes</option><option>Sigue pasando</option></select></div></div>' +
      '<div class="field"><span class="label">¿Ha pasado más de una vez?</span><div class="chips">' + ['Sí', 'No', 'No estoy seguro'].map((v, i) => '<label class="chip-radio"><input type="radio" name="recurrent" value="' + v + '"' + (i === 0 ? ' checked' : '') + '><span>' + v + '</span></label>').join('') + '</div></div>' +
      '<div class="field"><label for="c-wit">¿Hubo testigos? <span class="muted">(opcional)</span></label><input id="c-wit" name="witnesses" class="input" placeholder="Por ejemplo: dos personas del equipo"></div>' +
      '<div class="field"><label for="c-files">Adjuntar evidencia <span class="muted">(opcional)</span></label><input id="c-files" name="files" type="file" multiple class="input">' +
      '<span class="hint">Fotos, capturas o documentos. Antes de enviarlos borramos sus metadatos (autor, ubicación y fecha).</span></div>' +
      '<label class="switch" style="border-top:1px solid var(--line)"><span class="txt"><b>Necesito medidas de protección</b><span>Por ejemplo, separar espacios o turnos mientras se investiga.</span></span><input type="checkbox" name="protection"></label>' +
      '<div class="notice warn">' + D2.icon('alert') + '<span><b>Si estás en peligro ahora</b>Llama al 133 (Carabineros). Este canal no es para emergencias.</span></div>' +
      '<div class="row"><button class="btn btn-primary" type="submit">' + D2.icon('send') + 'Enviar denuncia anónima</button><span class="small" id="c-error" style="color:var(--crit)" role="alert"></span></div>' +
      '</form></section>';
  }

  function followComplaint() {
    const ui = D2.ui;
    const c = ui.followCode && D2.state.complaints.find((x) => x.code === ui.followCode);
    let html = '<section class="card"><form data-form="follow" class="row" style="align-items:flex-end" novalidate>' +
      '<div class="field" style="flex:1;min-width:220px"><label for="f-code">Código de seguimiento</label><input id="f-code" name="code" class="input mono" placeholder="D2-XXXX-XXXX" autocomplete="off" value="' + esc(ui.followCode || '') + '"></div>' +
      '<button class="btn btn-primary" type="submit">Ver estado</button></form>' +
      (ui.followError ? '<p class="small" style="color:var(--crit)" role="alert">' + esc(ui.followError) + '</p>' : '') +
      (!c ? '<p class="small muted">Para la demo puedes usar el código <button class="link mono" data-act="demo-code">D2-4HQM-72KP</button>.</p>' : '') +
      '</section>';
    if (c) {
      const dl = D2.deadlineInfo(c);
      html += '<div class="grid g-main">' +
        '<section class="card"><div class="card-head"><div><span class="eyebrow mono">' + c.code + '</span><h3>' + D2.catName(c.cat) + '</h3><p>Enviada el ' + D2.fmtDate(c.received) + '</p></div>' + D2.statusPill(c.status) + '</div>' +
        D2.stepper(c.status) +
        '<div class="divider"></div><h4>Conversación con RR.HH.</h4>' + D2.chatHtml(c, 'worker') +
        (c.status < 3
          ? '<form data-form="worker-msg" class="chat-input"><label class="visually-hidden" for="w-msg">Mensaje</label><textarea id="w-msg" name="msg" class="textarea" placeholder="Escribe tu mensaje. Sigue siendo anónimo." maxlength="1000"></textarea><button class="btn btn-primary" type="submit" aria-label="Enviar">' + D2.icon('send') + '</button></form>'
          : '<div class="notice">' + D2.icon('check') + '<span><b>Caso resuelto</b>' + esc(c.resolution || '') + '</span></div>') +
        '</section>' +
        '<aside class="stack"><section class="card flat"><h4>Lo que enviaste</h4><p class="small ink2">' + esc(c.desc) + '</p>' +
        '<div class="small muted">Dónde: ' + esc(c.where) + ' · Cuándo: ' + esc(c.when) + '</div></section>' +
        (c.status < 3 ? '<section class="card flat"><h4>Plazos</h4><p class="small ink2">RR.HH. tiene ' + D2.DEADLINE_DAYS + ' días para investigar. Van ' + dl.days + ' días.</p><p class="small muted">Para la demo: cambia a la vista RR.HH., responde este caso y vuelve aquí.</p></section>' : '') +
        '</aside></div>';
    }
    return html;
  }

  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newCode() {
    const pick = (n) => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
    return 'D2-' + pick(4) + '-' + pick(4);
  }

  D2.forms.complaint = function (form) {
    const fd = new FormData(form);
    const err = document.getElementById('c-error');
    const cat = fd.get('cat');
    const desc = String(fd.get('desc') || '').trim();
    if (!cat) { err.textContent = 'Elige el tipo de situación.'; return; }
    if (desc.length < 30) { err.textContent = 'Cuéntanos un poco más (mínimo 30 caracteres).'; document.getElementById('c-desc').focus(); return; }
    const files = Array.from(form.querySelector('#c-files').files || []).map((f) => f.name);
    const code = newCode();
    const today = D2.stamp();
    D2.state.complaints.unshift({
      code, cat, received: today.slice(0, 10), status: 0, unread: true,
      where: fd.get('where'), when: fd.get('when'), recurrent: fd.get('recurrent'), witnesses: String(fd.get('witnesses') || ''),
      protection: !!fd.get('protection'), files, desc, dtReport: false,
      messages: [{ from: 'system', text: 'Denuncia recibida', at: today }],
    });
    D2.ui.newCode = code;
    D2.ui.copied = false;
    D2.save();
    D2.render({ scroll: true });
  };
  D2.forms.follow = function (form) {
    const code = String(new FormData(form).get('code') || '').trim().toUpperCase();
    const found = D2.state.complaints.find((c) => c.code === code);
    D2.ui.followCode = found ? code : null;
    D2.ui.followError = found ? '' : 'No encontramos ese código. Revisa que esté bien escrito (D2-XXXX-XXXX).';
    D2.render();
    scrollChat();
  };
  D2.forms['worker-msg'] = function (form) {
    const text = String(new FormData(form).get('msg') || '').trim();
    if (!text) return;
    const c = D2.state.complaints.find((x) => x.code === D2.ui.followCode);
    c.messages.push({ from: 'me', text, at: D2.stamp() });
    c.unread = true;
    D2.save();
    D2.render();
    scrollChat();
  };
  Object.assign(D2.actions, {
    ctab(el) { D2.ui.complaintTab = el.dataset.tab; D2.render(); scrollChat(); },
    'demo-code'() { D2.ui.followCode = 'D2-4HQM-72KP'; D2.ui.followError = ''; D2.render(); scrollChat(); },
    'follow-new'() { D2.ui.followCode = D2.ui.newCode; D2.ui.newCode = null; D2.ui.complaintTab = 'seguir'; D2.render(); scrollChat(); },
    'new-again'() { D2.ui.newCode = null; D2.render(); },
    'copy-code'(el) {
      const code = D2.ui.newCode;
      const done = () => { D2.ui.copied = true; el.innerHTML = D2.icon('check') + 'Copiado'; };
      try {
        navigator.clipboard.writeText(code).then(done, () => selectCode());
      } catch (e) { selectCode(); }
    },
  });
  function selectCode() {
    const el = document.getElementById('new-code');
    if (!el) return;
    const r = document.createRange(); r.selectNodeContents(el);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    D2.toast('Código seleccionado. Cópialo con Ctrl+C o mantén presionado.', 'copy');
  }
})();
