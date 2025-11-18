import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Home, ClipboardList, Trophy, Award, LogOut } from "lucide-react"

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/member" className="text-xl font-bold text-blue-600">
                Ujian Online
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/member"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/member/exams"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <ClipboardList className="h-4 w-4" />
                  Ujian
                </Link>
                <Link
                  href="/member/rankings"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Trophy className="h-4 w-4" />
                  Peringkat
                </Link>
                <Link
                  href="/member/certificates"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Award className="h-4 w-4" />
                  Sertifikat
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.name}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
