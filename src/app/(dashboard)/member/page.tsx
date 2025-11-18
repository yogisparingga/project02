import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClipboardList, Trophy, Award, ArrowRight } from "lucide-react"

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) return null

  // Fetch member statistics
  const [totalSessions, completedSessions, totalCertificates, bestRanking] =
    await Promise.all([
      prisma.examSession.count({
        where: { userId: session.user.id },
      }),
      prisma.examSession.count({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
        },
      }),
      prisma.certificate.count({
        where: { userId: session.user.id },
      }),
      prisma.ranking.findFirst({
        where: { userId: session.user.id },
        orderBy: { globalRank: "asc" },
      }),
    ])

  // Get available published exams
  const availableExams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    take: 5,
  })

  const stats = [
    {
      title: "Total Ujian",
      value: totalSessions,
      icon: ClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ujian Selesai",
      value: completedSessions,
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sertifikat",
      value: totalCertificates,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Peringkat Terbaik",
      value: bestRanking?.globalRank || "-",
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat Datang, {session.user.name}
        </h1>
        <p className="text-gray-600 mt-2">Pantau progres ujian Anda di sini</p>
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

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ujian Tersedia</CardTitle>
            <Link href="/member/exams">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableExams.map((exam) => (
              <div
                key={exam.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  {exam.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {exam.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {cat.category.name}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/member/exams/${exam.id}`}>
                  <Button>Mulai Ujian</Button>
                </Link>
              </div>
            ))}

            {availableExams.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Belum ada ujian tersedia
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
