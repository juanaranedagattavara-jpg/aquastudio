/* Desconecta2 · datos de ejemplo del prototipo.
   Empresa ficticia: Andes Logística SpA (48 personas). Nada de esto es información real. */
(function () {
  const D2 = (window.D2 = window.D2 || {});

  // Reloj simulado: lunes 5 de octubre de 2026, 11:46. Avanza en tiempo real desde que se abre la demo.
  D2.SIM_START = new Date(2026, 9, 5, 11, 46, 0).getTime();

  D2.company = { name: 'Andes Logística SpA', people: 48 };

  D2.DIMS = [
    { key: 'carga', label: 'Carga de trabajo', q: 'Mi carga de trabajo es manejable dentro de mi jornada.' },
    { key: 'lider', label: 'Liderazgo', q: 'Mi jefatura me da retroalimentación útil y respetuosa.' },
    { key: 'rel', label: 'Relaciones', q: 'En mi equipo nos tratamos con respeto.' },
    { key: 'recon', label: 'Reconocimiento', q: 'Siento que mi trabajo es reconocido.' },
    { key: 'desc', label: 'Desconexión', q: 'Puedo desconectarme del trabajo fuera de mi horario.' },
    { key: 'seg', label: 'Seguridad psicológica', q: 'Puedo dar mi opinión sin miedo a represalias.' },
  ];
  D2.LIKERT = ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'];
  D2.MIN_RESPONSES = 5;
  D2.TARGET = 3.5;

  D2.AREAS = [
    { id: 'ops', name: 'Operaciones', size: 12, resp: 11, scores: { carga: 2.9, lider: 3.6, rel: 4.1, recon: 3.0, desc: 2.5, seg: 3.4 }, trend: [3.05, 3.08, 3.1, 3.12, 3.18] },
    { id: 'com', name: 'Comercial', size: 9, resp: 8, scores: { carga: 3.2, lider: 4.1, rel: 4.3, recon: 3.6, desc: 2.9, seg: 3.9 }, trend: [3.4, 3.45, 3.5, 3.58, 3.62] },
    { id: 'fin', name: 'Finanzas', size: 6, resp: 5, scores: { carga: 3.4, lider: 3.8, rel: 4.0, recon: 3.2, desc: 3.3, seg: 3.6 }, trend: [3.42, 3.44, 3.5, 3.52, 3.55] },
    { id: 'ti', name: 'Tecnología', size: 7, resp: 7, scores: { carga: 3.3, lider: 4.3, rel: 4.5, recon: 3.7, desc: 2.6, seg: 4.1 }, trend: [3.6, 3.62, 3.7, 3.72, 3.75] },
    { id: 'bod', name: 'Bodega y despacho', size: 11, resp: 8, scores: { carga: 2.8, lider: 3.5, rel: 4.0, recon: 2.9, desc: 3.0, seg: 3.0 }, trend: [2.85, 2.9, 2.98, 3.02, 3.1] },
    { id: 'per', name: 'Personas', size: 3, resp: 2, scores: { carga: 3.5, lider: 4.0, rel: 4.2, recon: 3.5, desc: 3.1, seg: 3.9 }, trend: [3.6, 3.6, 3.65, 3.68, 3.7] },
  ];
  D2.MONTHS = ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

  D2.COMMENTS = [
    { area: 'ops', dim: 'carga', text: 'Los cierres de mes se alargan y nadie avisa con tiempo los turnos extra.' },
    { area: 'ops', dim: 'desc', text: 'Siguen llegando mensajes por WhatsApp después de las 20:00, aunque sea "para mañana".' },
    { area: 'ops', dim: 'recon', text: 'Las pausas activas ayudan, pero a veces da vergüenza hacerlas frente al resto.' },
    { area: 'ops', dim: 'lider', text: 'Me gustaría que las reuniones de los lunes fueran más cortas y con agenda.' },
    { area: 'bod', dim: 'recon', text: 'Falta reconocimiento cuando sacamos despachos urgentes un viernes en la tarde.' },
    { area: 'bod', dim: 'carga', text: 'Necesitamos mejores sillas y mesas a la altura correcta en embalaje.' },
    { area: 'com', dim: 'carga', text: 'Buen ambiente, pero las metas cambian a mitad de mes.' },
    { area: 'ti', dim: 'desc', text: 'Las guardias de fin de semana no se compensan con días libres.' },
    { area: 'fin', dim: 'lider', text: 'Me siento escuchada por mi jefatura. Ojalá se mantenga así.' },
  ];

  // Cumplimiento semanal de pausas (% de pausas completadas sobre programadas)
  D2.WEEKS = ['10 ago', '17 ago', '24 ago', '31 ago', '7 sep', '14 sep', '21 sep', '28 sep'];
  D2.WEEKLY_COMPANY = [58, 63, 67, 71, 70, 74, 78, 81];
  D2.WEEKLY_OPS = [52, 57, 60, 66, 64, 70, 73, 76];
  D2.SKIP_REASONS = [
    { label: 'Estaba en reunión', n: 38 },
    { label: 'Atención a cliente', n: 22 },
    { label: 'Mucha carga de trabajo', n: 17 },
    { label: 'Otro motivo', n: 9 },
  ];

  // Personas (generadas de forma determinista)
  const FIRST = ['Camila', 'Benjamín', 'Valentina', 'Matías', 'Javiera', 'Vicente', 'Fernanda', 'Tomás', 'Catalina', 'Joaquín', 'Constanza', 'Diego', 'Antonia', 'Sebastián', 'Isidora', 'Felipe', 'Francisca', 'Nicolás', 'Martina', 'Cristóbal', 'Josefa', 'Ignacio', 'Daniela', 'Gonzalo', 'Paula', 'Rodrigo', 'Carolina', 'Pablo', 'Macarena', 'Andrés', 'Bárbara', 'Cristian', 'Trinidad', 'Patricio', 'Florencia', 'Esteban', 'Natalia', 'Álvaro', 'Rocío', 'Claudio', 'Gabriela', 'Héctor', 'Pía', 'Mauricio', 'Sofía', 'Raúl', 'Amanda', 'Jorge'];
  const LAST = ['Rojas', 'González', 'Muñoz', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Tapia', 'Reyes', 'Gutiérrez', 'Castro', 'Pizarro', 'Álvarez', 'Vásquez', 'Sánchez', 'Fernández', 'Ramírez', 'Carrasco', 'Gómez', 'Cortés', 'Herrera', 'Núñez', 'Jara', 'Vergara', 'Rivera', 'Figueroa', 'Riquelme', 'García', 'Miranda', 'Bravo', 'Vera', 'Molina', 'Vega', 'Campos'];
  const CARGOS = {
    ops: ['Analista de operaciones', 'Coordinador/a de rutas', 'Planificador/a', 'Asistente de operaciones'],
    com: ['Ejecutivo/a comercial', 'Key account', 'Asistente comercial'],
    fin: ['Analista contable', 'Tesorero/a', 'Analista de cobranza'],
    ti: ['Desarrollador/a', 'Soporte TI', 'Analista de datos'],
    bod: ['Operario/a de bodega', 'Despachador/a', 'Supervisor/a de turno'],
    per: ['Analista de personas', 'Generalista de RR.HH.'],
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const people = [];
  let idx = 0;
  D2.AREAS.forEach((a) => {
    for (let i = 0; i < a.size; i++) {
      const base = { ops: 0.76, com: 0.82, fin: 0.86, ti: 0.84, bod: 0.71, per: 0.9 }[a.id];
      const scheduled = 20;
      let completed = Math.max(6, Math.min(20, Math.round(scheduled * (base + (rnd() - 0.5) * 0.36))));
      const missing = scheduled - completed;
      const skipped = Math.round(missing * (0.3 + rnd() * 0.4));
      const postponed = Math.round(rnd() * 5) + (missing > 4 ? 2 : 0);
      const name = FIRST[idx] + ' ' + LAST[(idx * 7) % LAST.length];
      people.push({ id: 'p' + idx, name, area: a.id, cargo: CARGOS[a.id][i % CARGOS[a.id].length], scheduled, completed, skipped, postponed });
      idx++;
    }
  });
  // La trabajadora de la demo
  Object.assign(people[0], { name: 'Camila Rojas', cargo: 'Analista de operaciones', completed: 17, skipped: 1, postponed: 3 });
  D2.PEOPLE = people;

  D2.APPS = [
    { id: 'slack', name: 'Slack', abbr: 'Sl', color: '#4A154B' },
    { id: 'teams', name: 'Teams', abbr: 'T', color: '#4B53BC' },
    { id: 'outlook', name: 'Outlook', abbr: 'O', color: '#0F6CBD' },
    { id: 'gmail', name: 'Gmail', abbr: 'G', color: '#C5221F' },
    { id: 'sap', name: 'SAP', abbr: 'SAP', color: '#0A6ED1' },
    { id: 'drive', name: 'Drive', abbr: 'D', color: '#1E8E3E' },
    { id: 'whatsapp', name: 'WhatsApp Business', abbr: 'WA', color: '#128C4B' },
  ];

  D2.DEVICES = [
    { id: 'nb', kind: 'laptop', name: 'Notebook corporativo', model: 'ThinkPad E14 · Windows 11' },
    { id: 'cel', kind: 'phone', name: 'Celular corporativo', model: 'Samsung A54 · Android 14' },
  ];

  // Rutina de pausa activa (5 minutos). Los "videos" son animaciones creadas para el prototipo.
  D2.ROUTINE = [
    { id: 'r1', type: 'breath', title: 'Respiración 4-2-6', dur: 60, desc: 'Inhala por la nariz en 4 tiempos, sostén 2 y exhala lento por la boca en 6. Suelta los hombros.' },
    { id: 'm1', type: 'move', anim: 'neck', title: 'Movilidad de cuello', dur: 50, desc: 'Inclina la cabeza hacia un hombro, vuelve al centro y cambia de lado. Movimientos lentos, sin forzar.' },
    { id: 'm2', type: 'move', anim: 'shrug', title: 'Elevación de hombros', dur: 40, desc: 'Sube los hombros hacia las orejas, sostén un segundo y suéltalos de golpe. Repite.' },
    { id: 'm3', type: 'move', anim: 'circles', title: 'Círculos de brazos', dur: 50, desc: 'Brazos extendidos a los lados. Dibuja círculos amplios hacia atrás, sin tensar el cuello.' },
    { id: 'm4', type: 'move', anim: 'side', title: 'Estiramiento lateral', dur: 50, desc: 'De pie, brazos arriba. Inclina el tronco hacia un lado, mantén 3 respiraciones y cambia.' },
    { id: 'r2', type: 'breath', title: 'Respiración de cierre', dur: 50, desc: 'Vuelve a la respiración 4-2-6. Nota cómo están tus hombros y tu mandíbula antes de volver.' },
  ];

  D2.CATEGORIES = [
    { id: 'acoso-laboral', name: 'Acoso laboral', hint: 'Agresiones, humillaciones o maltrato reiterado' },
    { id: 'acoso-sexual', name: 'Acoso sexual', hint: 'Requerimientos o conductas de connotación sexual no consentidas' },
    { id: 'violencia', name: 'Violencia en el trabajo', hint: 'Agresiones de clientes, proveedores o terceros' },
    { id: 'discriminacion', name: 'Discriminación', hint: 'Trato distinto por género, origen, edad, etc.' },
    { id: 'otra', name: 'Otra situación', hint: 'Seguridad, ética u otro problema' },
  ];
  D2.STATUSES = ['Recibida', 'En revisión', 'En investigación', 'Resuelta'];
  D2.DEADLINE_DAYS = 30;

  D2.seedComplaints = function () {
    return [
      {
        code: 'D2-6PVJ-48DS', cat: 'acoso-sexual', received: '2026-10-03', status: 0, unread: true, where: 'Prefiero no decirlo', when: 'Último mes', recurrent: 'Sí', witnesses: '', protection: true, files: [], dtReport: false,
        desc: 'Un compañero de turno me envía mensajes con comentarios sobre mi cuerpo, también fuera del horario de trabajo. Le dije que no me interesa salir con él y sigue insistiendo. Me incomoda trabajar en el mismo turno.',
        messages: [{ from: 'system', text: 'Denuncia recibida', at: '2026-10-03 22:14' }],
      },
      {
        code: 'D2-4HQM-72KP', cat: 'acoso-laboral', received: '2026-09-29', status: 2, unread: false, where: 'Prefiero no decirlo', when: 'Hace más de un mes', recurrent: 'Sí', witnesses: 'Sí, otras personas del equipo lo han visto', protection: true, files: ['captura_chat.png'], dtReport: false,
        desc: 'Desde hace dos meses una persona con cargo superior me grita frente al equipo cuando hay errores en los despachos y hace comentarios sobre mi capacidad. La última vez fue el jueves en la reunión de las 9:00.',
        messages: [
          { from: 'system', text: 'Denuncia recibida', at: '2026-09-29 08:02' },
          { from: 'rrhh', text: 'Hola. Recibimos tu denuncia y la estamos revisando. Gracias por usar este canal. ¿Te sientes en condiciones de seguir trabajando en tu área esta semana?', at: '2026-09-29 10:31' },
          { from: 'me', text: 'Por ahora sí, pero preferiría no estar en las reuniones con esa persona.', at: '2026-09-29 13:05' },
          { from: 'rrhh', text: 'Entendido. Como medida de resguardo, desde mañana el seguimiento de despachos será por escrito y sin esa jefatura presente. Iniciamos la investigación y te escribiremos por aquí.', at: '2026-09-30 09:12' },
          { from: 'system', text: 'Estado cambiado a "En investigación"', at: '2026-09-30 09:13' },
        ],
      },
      {
        code: 'D2-8TXN-31BW', cat: 'violencia', received: '2026-09-18', status: 2, unread: false, where: 'Bodega y despacho', when: 'Esta semana', recurrent: 'Sí', witnesses: 'Compañeros del turno mañana', protection: false, files: [], dtReport: false,
        desc: 'Un cliente que retira pedidos en bodega ha insultado y amenazado a compañeros en tres ocasiones. Tenemos miedo de atenderlo y nadie ha hecho nada todavía.',
        messages: [
          { from: 'system', text: 'Denuncia recibida', at: '2026-09-18 16:40' },
          { from: 'rrhh', text: 'Gracias por avisar. Desde hoy ese cliente será atendido solo por la supervisión de turno y en el mesón principal. ¿Recuerdas las fechas aproximadas de los episodios?', at: '2026-09-19 09:05' },
          { from: 'me', text: 'Fue el 2, el 11 y el 17 de septiembre, todos en la mañana.', at: '2026-09-19 11:22' },
        ],
      },
      {
        code: 'D2-2LCE-95RA', cat: 'discriminacion', received: '2026-08-21', status: 3, unread: false, where: 'Comercial', when: 'Último mes', recurrent: 'No', witnesses: '', protection: false, files: [], dtReport: true,
        desc: 'En la asignación de cuentas grandes siempre se deja fuera a las personas mayores de 50 años del equipo, con el argumento de que "no manejan las herramientas nuevas".',
        resolution: 'Se revisó el criterio de asignación de cuentas. Ahora es por cartera y desempeño, con capacitación disponible para todo el equipo.',
        messages: [
          { from: 'system', text: 'Denuncia recibida', at: '2026-08-21 19:47' },
          { from: 'rrhh', text: 'Revisamos la asignación de cuentas de los últimos seis meses y confirmamos el patrón que describes. Cambiamos el criterio y lo comunicaremos al equipo esta semana.', at: '2026-09-12 12:00' },
          { from: 'system', text: 'Estado cambiado a "Resuelta"', at: '2026-09-15 10:00' },
        ],
      },
    ];
  };

  D2.seedActions = function () {
    return [
      { id: 'a1', dim: 'desc', text: 'Acordar con el equipo que no se envían mensajes después de las 19:00. Usar envío programado.', done: false },
      { id: 'a2', dim: 'desc', text: 'Sacar a las personas del grupo de WhatsApp de turno cuando no están de turno.', done: true },
      { id: 'a3', dim: 'carga', text: 'Planificar el cierre de mes con una semana de anticipación y repartir los turnos extra.', done: false },
      { id: 'a4', dim: 'recon', text: 'En la reunión semanal, reconocer un logro concreto del equipo con nombre y apellido.', done: false },
    ];
  };

  D2.SUGGESTIONS = {
    carga: ['Revisar la distribución de tareas del cierre de mes.', 'Definir prioridades semanales y qué puede esperar.'],
    lider: ['Agendar conversaciones 1:1 de 20 minutos cada dos semanas.', 'Dar retroalimentación en privado y con ejemplos concretos.'],
    rel: ['Hacer una actividad de equipo dentro del horario laboral.'],
    recon: ['Reconocer logros concretos en la reunión semanal.', 'Agradecer por escrito los esfuerzos extra.'],
    desc: ['Acordar un horario sin mensajes y usar envío programado.', 'No esperar respuestas fuera del horario laboral.'],
    seg: ['Abrir un espacio para preguntas sin que haya consecuencias.', 'Reconocer públicamente cuando alguien levanta un problema.'],
  };
})();
