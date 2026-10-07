/** Archivo Black para las imágenes generadas (OG, ícono). Si no hay red, se usa la fuente por defecto. */
export async function loadDisplayFont(): Promise<{ name: string; data: ArrayBuffer; weight: 900 }[]> {
  try {
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Archivo+Black')).text()
    const url = css.match(/src: url\((.+?)\)/)?.[1]
    if (!url) return []
    const data = await (await fetch(url)).arrayBuffer()
    return [{ name: 'Archivo Black', data, weight: 900 }]
  } catch {
    return []
  }
}
