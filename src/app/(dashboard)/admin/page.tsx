import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileQuestion, ClipboardList, Trophy } from "lucide-react"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  // Fetch statistics
  const [totalUsers, totalQuestions, totalExams, totalSessions] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.examSession.count(),
  ])

  const stats = [
    {
      title: "Total Peserta",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Bank Soal",
      value: totalQuestions,
      icon: FileQuestion,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Paket Ujian",
      value: totalExams,
      icon: ClipboardList,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Sesi Ujian",
      value: totalSessions,
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Selamat datang, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Belum ada aktivitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesi Ujian Berlangsung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Tidak ada sesi yang sedang berlangsung</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
