import { ShaderChunk, Vector2, type Material } from 'three';

/**
 * Ajustes de shader para follaje:
 *  - el follaje muy cercano a la cámara se desvanece con un tramado (dither)
 *    para que hojas y helechos no tapen al mono;
 *  - en hojas de doble cara se usa la misma normal por ambos lados, así no
 *    salen negras al verlas por detrás.
 */
export function addNearFade(mat: Material, start: number, end: number): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNearFade = { value: new Vector2(start, end) };
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec2 uNearFade;')
      .replace(
        '#include <normal_fragment_begin>',
        ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', ''),
      )
      .replace(
        'void main() {',
        `void main() {
  {
    float nfT = clamp((length(vViewPosition) - uNearFade.x) / (uNearFade.y - uNearFade.x), 0.0, 1.0);
    float nfN = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    if (nfT < nfN) discard;
  }`,
      );
  };
  mat.customProgramCacheKey = () => `nearfade-${start}-${end}`;
}
