import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const examSession = await prisma.examSession.findUnique({
      where: { id: params.id },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        exam: true,
      },
    })

    if (!examSession || examSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    examSession.answers.forEach((answer) => {
      totalPoints += answer.question.points
      earnedPoints += answer.pointsEarned || 0
    })

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

    // Update session
    const updated = await prisma.examSession.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        score,
      },
    })

    // Calculate ranking for this exam
    const allScores = await prisma.examSession.findMany({
      where: {
        examId: examSession.examId,
        status: "COMPLETED",
      },
      orderBy: {
        score: "desc",
      },
    })

    const rank = allScores.findIndex((s) => s.id === params.id) + 1

    // Update ranking
    await prisma.ranking.upsert({
      where: {
        userId_examId: {
          userId: session.user.id,
          examId: examSession.examId,
        },
      },
      create: {
        userId: session.user.id,
        examId: examSession.examId,
        score,
        rank,
      },
      update: {
        score,
        rank,
      },
    })

    // Update global ranking
    await updateGlobalRanking()

    // Generate certificate if passed
    if (examSession.exam.passingScore && score >= examSession.exam.passingScore) {
      await prisma.certificate.create({
        data: {
          sessionId: params.id,
          userId: session.user.id,
          examTitle: examSession.exam.title,
          score,
          rank,
        },
      })
    }

    return NextResponse.json({ ...updated, rank })
  } catch (error) {
    console.error("Error completing session:", error)
    return NextResponse.json(
      { error: "Gagal menyelesaikan ujian" },
      { status: 500 }
    )
  }
}

async function updateGlobalRanking() {
  // Get all rankings sorted by score
  const allRankings = await prisma.ranking.findMany({
    orderBy: {
      score: "desc",
    },
  })

  // Update global rank
  for (let i = 0; i < allRankings.length; i++) {
    await prisma.ranking.update({
      where: { id: allRankings[i].id },
      data: { globalRank: i + 1 },
    })
  }
}
