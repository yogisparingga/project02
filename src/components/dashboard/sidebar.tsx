"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileQuestion,
  BookOpen,
  ClipboardList,
  Trophy,
  Award,
  Users,
  Brain,
  Camera,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kategori Soal",
    href: "/admin/categories",
    icon: BookOpen,
  },
  {
    title: "Bank Soal",
    href: "/admin/questions",
    icon: FileQuestion,
  },
  {
    title: "Paket Ujian",
    href: "/admin/exams",
    icon: ClipboardList,
  },
  {
    title: "Sesi Ujian",
    href: "/admin/sessions",
    icon: Users,
  },
  {
    title: "Peringkat",
    href: "/admin/rankings",
    icon: Trophy,
  },
  {
    title: "Sertifikat",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    title: "Generate AI",
    href: "/admin/ai-generate",
    icon: Brain,
  },
  {
    title: "Verifikasi Wajah",
    href: "/admin/face-verification",
    icon: Camera,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ujian Online</h1>
        <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {adminMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
