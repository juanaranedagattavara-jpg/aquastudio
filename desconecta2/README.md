# Desconecta2 · prototipo

Prototipo navegable de **Desconecta2**, un software para cuidar el clima laboral y organizar las pausas activas. Es un proyecto independiente de la web de Aqua Studio: no usa Next.js ni comparte código con ella.

Todos los datos son de ejemplo. La empresa (Andes Logística SpA), las personas y las denuncias son ficticias.

## Cómo verlo

- **Archivo único:** abre `dist/desconecta2.html` en el navegador.
- **Para editar:** modifica `index.html`, `css/` y `js/`, y vuelve a generar el archivo único:

```bash
node desconecta2/build.mjs
```

## Qué incluye

Arriba hay un selector **"Ver como"** para cambiar entre las tres vistas. Todas comparten los mismos datos, así que lo que hace una persona aparece en las otras vistas.

| Vista | Pantallas |
|---|---|
| **Trabajador** (Camila, Operaciones) | Inicio con cuenta regresiva a la próxima pausa · Mis pausas (preferencias dentro de los límites de la empresa) · Encuesta mensual de 6 preguntas · Canal de denuncias anónimo con código de seguimiento y chat |
| **RR.HH.** (Andrea, Jefa de Personas) | Resumen con indicadores y alertas · Bandeja de denuncias con estados, plazo de 30 días, medidas de resguardo y chat anónimo · Clima por dimensión y por área (las áreas con menos de 5 respuestas se ocultan) · Pausas por área y por persona · Políticas (frecuencia, duración, aplazamientos, jornada, apps bloqueadas) |
| **Jefatura** (Rodrigo, Operaciones) | Clima de su equipo comparado con la empresa · Pausas del equipo · Plan de acción. No tiene acceso a las denuncias |

**Pausa activa:** alarma con opciones para comenzar, posponer o saltar (al saltar se pide el motivo). La rutina dura 5 minutos e incluye respiración guiada y cuatro videos de movilidad, que son animaciones hechas para el prototipo. Mientras dura la pausa se muestran No molestar y el bloqueo de apps, y al final se pregunta cómo se siente la persona. También se puede ver la pantalla de fin de jornada (18:00), con las apps de trabajo bloqueadas.

## Atajos para la demo

- El reloj de la demo parte el **lunes 5 de octubre de 2026 a las 11:46**.
- **"Probar la alarma"** adelanta el reloj hasta la próxima pausa.
- En el reproductor, el botón **x1 / x5 / x20** acelera la rutina.
- Código de denuncia de ejemplo: `D2-4HQM-72KP`.
- Flujo recomendado: envía una denuncia como Trabajador, respóndela como RR.HH. y vuelve a Trabajador para ver la respuesta con el código.
- **"Reiniciar demo"** (en el menú lateral o en Políticas) borra los cambios. El estado se guarda solo en el navegador de quien mira la demo.

## Lo que se simula

- El bloqueo de apps, el modo No molestar y las integraciones (Intune, Google Workspace, Slack) solo se muestran en pantalla. En un producto real requieren MDM o las APIs de cada herramienta.
- No hay servidor, así que el anonimato todavía no está implementado técnicamente. Ver las notas de producto en la conversación.
