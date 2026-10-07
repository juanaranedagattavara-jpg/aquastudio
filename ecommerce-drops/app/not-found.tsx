import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-3 text-7xl sm:text-9xl">Se la llevaron</h1>
      <p className="mt-4 max-w-sm text-muted">Esta página no existe o la prenda ya no está. Pasa que son únicas.</p>
      <Link href="/" className="btn-primary mt-8">
        Ver el drop
      </Link>
    </main>
  )
}
