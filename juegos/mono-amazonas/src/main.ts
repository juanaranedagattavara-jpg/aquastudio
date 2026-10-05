import './ui/style.css';
import { Game } from './game/game';

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
