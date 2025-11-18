import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, Brain, Award, Users } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin")
    } else {
      redirect("/member")
    }
  }

  const features = [
    {
      icon: ClipboardList,
      title: "Manajemen Soal Lengkap",
      description: "Kelola bank soal dengan kategori, import Excel, dan berbagai tipe soal"
    },
    {
      icon: Brain,
      title: "AI Question Generator",
      description: "Generate soal otomatis menggunakan AI OpenAI"
    },
    {
      icon: Award,
      title: "Ranking & Sertifikat",
      description: "Sistem peringkat otomatis dan sertifikat digital"
    },
    {
      icon: Users,
      title: "Face Recognition",
      description: "Verifikasi wajah untuk mencegah kecurangan"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Ujian Online</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Daftar Sekarang</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Platform Ujian Online Terlengkap
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistem ujian online dengan AI, face recognition, dan manajemen soal profesional
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Mulai Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-blue-600 text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Siap Memulai Ujian Online?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Daftar sekarang dan rasakan kemudahan sistem ujian online modern
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Daftar Gratis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2024 Sistem Ujian Online. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
