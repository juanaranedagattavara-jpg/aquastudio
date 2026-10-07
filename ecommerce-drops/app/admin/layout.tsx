import type { Metadata } from 'next'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <AdminNav />
      <div className="mx-auto max-w-5xl px-4 pb-40 pt-6">{children}</div>
    </div>
  )
}
