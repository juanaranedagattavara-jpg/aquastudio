export function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-alert" />
    </span>
  )
}
