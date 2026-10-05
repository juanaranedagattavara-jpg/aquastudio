/* Desconecta2 · pausa activa: alarma, rutina con videos animados, cierre y desconexión. */
(function () {
  const D2 = window.D2;
  const SPEEDS = [1, 5, 20];
  D2.pause = null;

  D2.routineSteps = function () {
    const r = D2.state.worker.prefs.routine;
    if (r === 'respiracion') return D2.ROUTINE.filter((s) => s.type === 'breath').map((s) => Object.assign({}, s, { dur: 150 }));
    if (r === 'movilidad') return D2.ROUTINE.filter((s) => s.type === 'move').map((s) => Object.assign({}, s, { dur: 75 }));
    return D2.ROUTINE;
  };
  D2.blockedApps = () => D2.APPS.filter((a) => D2.state.policy.apps[a.id]);

  function figure(anim) {
    let arms = '<path class="body" d="M78 76 L72 108 L74 136"/><path class="body" d="M122 76 L128 108 L126 136"/>';
    let hints = '';
    if (anim === 'circles') {
      arms = '<g class="arm-l"><path class="body" d="M78 76 L42 80"/></g><g class="arm-r"><path class="body" d="M122 76 L158 80"/></g>';
      hints = '<path class="hint" d="M34 58 A26 26 0 0 0 34 102"/><path class="hint" d="M166 58 A26 26 0 0 1 166 102"/>';
    }
    if (anim === 'side') {
      arms = '<path class="body" d="M78 76 L74 46 L88 14"/><path class="body" d="M122 76 L126 46 L112 14"/>';
      hints = '<path class="hint" d="M40 40 Q100 -14 160 40"/>';
    }
    if (anim === 'neck') hints = '<path class="hint" d="M70 26 Q100 4 130 26"/>';
    if (anim === 'shrug') hints = '<path class="hint" d="M62 74 V50 M56 58 L62 50 L68 58 M138 74 V50 M132 58 L138 50 L144 58"/>';
    return '<svg class="figure anim-' + anim + '" viewBox="0 0 200 220" aria-hidden="true">' +
      '<line class="floor" x1="30" y1="208" x2="170" y2="208"/>' + hints +
      '<path class="body" d="M100 140 L86 206 M100 140 L114 206"/>' +
      '<g class="g-upper"><path class="body" d="M100 72 L100 140"/><path class="body" d="M78 76 L122 76"/>' + arms +
      '<g class="g-head"><path class="body" d="M100 61 L100 72"/><circle class="head" cx="100" cy="45" r="15"/></g></g></svg>';
  }

  function totalLeft(p) {
    const steps = p.steps;
    let left = steps[p.step].dur - p.elapsed;
    for (let i = p.step + 1; i < steps.length; i++) left += steps[i].dur;
    return left;
  }

  function statusChips() {
    const pol = D2.state.policy;
    const apps = D2.blockedApps();
    return '<div class="ov-status">' +
      (pol.dnd ? '<span class="st">' + D2.icon('bellOff') + 'No molestar activo en ' + D2.DEVICES.length + ' dispositivos</span>' : '') +
      '<span class="st">' + D2.icon('lock') + apps.length + ' apps de trabajo en pausa</span></div>';
  }
  function blockedList() {
    return '<div class="blocked-apps">' + D2.blockedApps().map((a) => '<span class="ba">' + D2.appTile(a) + a.name + D2.icon('lock') + '</span>').join('') + '</div>';
  }

  D2.renderOverlay = function () {
    const root = document.getElementById('overlay-root');
    const p = D2.pause;
    if (!p) { root.innerHTML = ''; document.body.style.overflow = ''; return; }
    document.body.style.overflow = 'hidden';
    const pol = D2.state.policy;
    let html = '';
    if (p.phase === 'alarm') {
      const left = pol.maxPostpones - D2.state.worker.postponesUsed;
      html = '<div class="alarm"><div class="alarm-inner">' +
        '<div class="alarm-bell">' + D2.icon('bell') + '</div>' +
        '<div class="eyebrow">' + p.slot + ' · Pausa activa</div>' +
        '<h1>Es hora de tu pausa activa</h1>' +
        '<p class="muted">' + pol.dur + ' minutos de respiración y movilidad. Al comenzar se activa No molestar y tus apps de trabajo quedan en pausa hasta que termines.</p>' +
        '<div class="actions"><button class="btn btn-primary" data-act="pause-start">' + D2.icon('play') + 'Comenzar pausa</button>' +
        '<button class="btn btn-ghost" data-act="pause-snooze"' + (left > 0 ? '' : ' disabled') + '>' + D2.icon('snooze') + 'Posponer ' + pol.postponeMin + ' min</button>' +
        (pol.allowSkip ? '<button class="btn btn-ghost" data-act="pause-skip">' + D2.icon('skip') + 'Saltar</button>' : '') + '</div>' +
        '<p class="small muted">' + (left > 0 ? 'Puedes posponer ' + left + (left === 1 ? ' vez más' : ' veces más') + ' hoy.' : 'Ya usaste tus aplazamientos de hoy.') + '</p>' +
        '</div></div>';
    } else if (p.phase === 'skip') {
      html = '<div class="alarm"><div class="alarm-inner">' +
        '<h1>¿Por qué saltas esta pausa?</h1>' +
        '<p class="muted">Tu empresa ve los motivos para ajustar horarios y cargas de trabajo.</p>' +
        '<div class="reason-chips">' + ['Estaba en reunión', 'Atención a cliente', 'Mucha carga de trabajo', 'Otro motivo'].map((r) => '<button data-act="pause-skip-reason" data-reason="' + r + '">' + r + '</button>').join('') + '</div>' +
        '<button class="btn btn-ghost" data-act="pause-back">' + D2.icon('back') + 'Volver</button>' +
        '</div></div>';
    } else if (p.phase === 'run') {
      const s = p.steps[p.step];
      const stage = s.type === 'breath'
        ? '<div class="breath"><div class="ring"></div><div class="ball" id="pl-ball"></div><div class="word" id="pl-word">Inhala</div></div>'
        : figure(s.anim);
      html = '<div class="overlay-inner">' +
        '<div class="ov-top"><div><div class="eyebrow">Pausa activa · ' + p.slot + '</div><h2>' + s.title + '</h2></div>' + statusChips() + '</div>' +
        '<div class="ov-grid">' +
        '<div class="stack">' +
        '<div class="player' + (p.playing ? '' : ' paused') + '" id="player">' +
        '<div class="player-stage">' + stage + '</div>' +
        '<div class="player-top"><div class="t"><b>' + s.title + '</b><span>Paso ' + (p.step + 1) + ' de ' + p.steps.length + '</span></div><span class="player-badge">Video guiado</span></div>' +
        '<div class="player-bottom"><div class="player-progress"><i id="pl-progress"></i></div>' +
        '<div class="player-ctrl"><button data-act="pause-toggle" aria-label="' + (p.playing ? 'Pausar video' : 'Reproducir video') + '">' + D2.icon(p.playing ? 'pauseFill' : 'play') + '</button>' +
        '<button data-act="pause-next" aria-label="Siguiente ejercicio">' + D2.icon('next') + '</button>' +
        '<span id="pl-time">0:00 / ' + D2.mmss(s.dur) + '</span><span class="grow"></span>' +
        '<button class="speed" data-act="pause-speed" title="Velocidad de la demo">x' + p.speed + '</button></div></div>' +
        '</div>' +
        '<p class="muted">' + s.desc + '</p>' +
        '</div>' +
        '<div class="stack">' +
        '<div class="ov-panel"><div class="eyebrow">Tiempo restante</div><div class="big-clock" id="pl-total">' + D2.mmss(totalLeft(p)) + '</div>' +
        '<div class="steps-list">' + p.steps.map((st, i) => '<div class="sl ' + (i < p.step ? 'done' : i === p.step ? 'current' : '') + '"><span class="n">' + (i < p.step ? '✓' : i + 1) + '</span>' + st.title + '<span class="d">' + D2.mmss(st.dur) + '</span></div>').join('') + '</div></div>' +
        '<div class="ov-panel"><h4>En pausa mientras descansas</h4>' + blockedList() + '<p class="small muted">Las llamadas de emergencia siguen funcionando.</p></div>' +
        '<button class="btn btn-ghost" data-act="pause-finish">Terminar antes</button>' +
        '</div></div></div>';
    } else if (p.phase === 'done') {
      const next = D2.nextSlot();
      html = '<div class="alarm"><div class="alarm-inner">' +
        '<div class="alarm-bell">' + D2.icon('check') + '</div>' +
        '<h1>Pausa completada</h1>' +
        '<p class="muted">Tus apps de trabajo se reactivaron.' + (next ? ' Tu próxima pausa es a las ' + next.label + '.' : ' No te quedan pausas hoy.') + '</p>' +
        '<h3>¿Cómo te sientes ahora?</h3>' +
        '<div class="mood">' + ['Mal', 'Regular', 'Igual', 'Bien', 'Muy bien'].map((m, i) => '<button data-act="pause-mood" data-mood="' + (i + 1) + '">' + D2.face(i + 1) + m + '</button>').join('') + '</div>' +
        '<button class="link" style="color:var(--pause-muted)" data-act="pause-mood" data-mood="0">Prefiero no responder</button>' +
        '</div></div>';
    } else if (p.phase === 'offhours') {
      html = '<div class="offhours"><div class="alarm-inner">' +
        '<div class="moon"></div>' +
        '<div class="eyebrow">' + pol.end + ' · Fin de tu jornada</div>' +
        '<h1>Ya estás desconectada</h1>' +
        '<p class="muted">Hasta mañana a las ' + pol.start + ', estas apps quedan en pausa en tus dispositivos de trabajo. Los mensajes que lleguen te van a esperar mañana.</p>' +
        blockedList() +
        '<div class="ov-panel" style="text-align:left;width:100%"><div class="row nowrap">' + D2.icon('shield') + '<span class="small">Derecho a desconexión: tu empresa se compromete a no pedirte respuestas fuera de tu jornada. Si hay una emergencia real, te van a llamar por teléfono.</span></div></div>' +
        '<button class="btn btn-primary" data-act="pause-close">Volver a la demo</button>' +
        '</div></div>';
    }
    root.innerHTML = '<div class="overlay" role="dialog" aria-modal="true" aria-label="Pausa activa">' + html + '</div>';
    D2.pauseTick(true);
  };

  D2.openAlarm = function (slot) { D2.pause = { phase: 'alarm', slot }; D2.renderOverlay(); };
  D2.closeOverlay = function () { D2.pause = null; D2.renderOverlay(); };

  D2.pauseTick = function (domOnly) {
    const p = D2.pause;
    const st = D2.state;
    if (!p) {
      if (st.role !== 'worker') return;
      const next = D2.nextSlot();
      if (next && D2.now() >= D2.slotTarget(next)) D2.openAlarm(next.label);
      return;
    }
    if (p.phase !== 'run') return;
    if (!domOnly && p.playing) {
      p.elapsed += 0.25 * p.speed;
      if (p.elapsed >= p.steps[p.step].dur) {
        if (p.step < p.steps.length - 1) { p.step++; p.elapsed = 0; D2.renderOverlay(); return; }
        finish(); return;
      }
    }
    const s = p.steps[p.step];
    const prog = document.getElementById('pl-progress');
    if (prog) prog.style.width = Math.min(100, (p.elapsed / s.dur) * 100) + '%';
    const t = document.getElementById('pl-time');
    if (t) t.textContent = D2.mmss(p.elapsed) + ' / ' + D2.mmss(s.dur);
    const tot = document.getElementById('pl-total');
    if (tot) tot.textContent = D2.mmss(totalLeft(p));
    const ball = document.getElementById('pl-ball');
    const word = document.getElementById('pl-word');
    if (ball && word) {
      const c = p.elapsed % 12; // 4 inhala · 2 sostén · 6 exhala
      let scale, label, left;
      if (c < 4) { scale = 0.45 + (c / 4) * 0.55; label = 'Inhala'; left = 4 - c; }
      else if (c < 6) { scale = 1; label = 'Sostén'; left = 6 - c; }
      else { scale = 1 - ((c - 6) / 6) * 0.55; label = 'Exhala'; left = 12 - c; }
      ball.style.transform = 'scale(' + scale.toFixed(3) + ')';
      word.innerHTML = label + '<small>' + Math.ceil(left) + '</small>';
    }
  };

  function finish() {
    const p = D2.pause;
    const w = D2.state.worker;
    w.slotStatus[p.slot] = 'completada';
    delete w.snooze[p.slot];
    D2.save();
    D2.pause = { phase: 'done', slot: p.slot };
    D2.renderOverlay();
    D2.render();
  }

  Object.assign(D2.actions, {
    'pause-test'() {
      const next = D2.nextSlot();
      if (!next) { D2.toast('No quedan pausas programadas hoy', 'clock'); return; }
      D2.advanceClockTo(D2.slotTarget(next) - 1500);
      D2.tickDom();
    },
    'pause-now'() {
      const next = D2.nextSlot();
      const slot = next ? next.label : D2.hhmm(D2.now());
      D2.pause = { phase: 'run', slot, step: 0, elapsed: 0, playing: true, speed: 1, steps: D2.routineSteps() };
      D2.renderOverlay();
    },
    'pause-start'() {
      const p = D2.pause;
      D2.pause = { phase: 'run', slot: p.slot, step: 0, elapsed: 0, playing: true, speed: 1, steps: D2.routineSteps() };
      D2.renderOverlay();
    },
    'pause-snooze'() {
      const pol = D2.state.policy;
      const w = D2.state.worker;
      if (w.postponesUsed >= pol.maxPostpones) return;
      w.postponesUsed++;
      w.snooze[D2.pause.slot] = D2.now() + pol.postponeMin * 60000;
      D2.save();
      D2.closeOverlay();
      D2.render();
      D2.toast('Pausa pospuesta ' + pol.postponeMin + ' minutos', 'snooze');
    },
    'pause-skip'() { D2.pause.phase = 'skip'; D2.renderOverlay(); },
    'pause-back'() { D2.pause.phase = 'alarm'; D2.renderOverlay(); },
    'pause-skip-reason'(el) {
      const w = D2.state.worker;
      w.slotStatus[D2.pause.slot] = 'saltada';
      w.skipReasons.push({ slot: D2.pause.slot, reason: el.dataset.reason });
      D2.save();
      D2.closeOverlay();
      D2.render();
      D2.toast('Pausa saltada. Motivo registrado.', 'skip');
    },
    'pause-toggle'() { D2.pause.playing = !D2.pause.playing; D2.renderOverlay(); },
    'pause-next'() {
      const p = D2.pause;
      if (p.step < p.steps.length - 1) { p.step++; p.elapsed = 0; D2.renderOverlay(); } else finish();
    },
    'pause-speed'() {
      const p = D2.pause;
      p.speed = SPEEDS[(SPEEDS.indexOf(p.speed) + 1) % SPEEDS.length];
      D2.renderOverlay();
    },
    'pause-finish'() { finish(); },
    'pause-mood'(el) {
      const m = Number(el.dataset.mood);
      if (m) D2.state.worker.moods.push({ slot: D2.pause.slot, mood: m });
      D2.save();
      D2.closeOverlay();
      D2.render();
      D2.toast(m ? 'Gracias. Pausa registrada.' : 'Pausa registrada.', 'leaf');
    },
    'offhours'() { D2.pause = { phase: 'offhours' }; D2.renderOverlay(); },
    'pause-close'() { D2.closeOverlay(); },
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && D2.pause && (D2.pause.phase === 'offhours' || D2.pause.phase === 'done')) D2.closeOverlay();
  });
})();
