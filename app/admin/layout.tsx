import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/sidebar"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Cafe Bella Admin" },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 md:overflow-auto">
        <div className="md:pt-0 pt-14 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
