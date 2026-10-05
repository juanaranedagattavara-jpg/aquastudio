import './ui/style.css';
import { IS_TOUCH_DEVICE } from './core/device';
import { enableRotatedScroll, updateLayout } from './core/layout';
import { Game } from './game/game';

if (IS_TOUCH_DEVICE) document.body.classList.add('touch-device');
updateLayout();
enableRotatedScroll();

const canvas = document.getElementById('game') as HTMLCanvasElement;

function fail(msg: string): void {
  const el = document.querySelector('.loading-text');
  if (el) el.textContent = msg;
}

try {
  const game = new Game(canvas);
  game.load().catch((e: unknown) => {
    console.error(e);
    fail('No se pudo iniciar el juego. Prueba con otro navegador o actualiza los drivers gráficos.');
  });
} catch (e) {
  console.error(e);
  fail('Tu navegador no soporta WebGL. Prueba con Chrome, Edge o Firefox actualizados.');
}
