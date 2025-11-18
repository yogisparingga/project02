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

    const { questionId, answer } = await req.json()

    const examSession = await prisma.examSession.findUnique({
      where: { id: params.id },
    })

    if (!examSession || examSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (examSession.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Sesi ujian sudah selesai" },
        { status: 400 }
      )
    }

    // Get question to check correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if answer is correct
    let isCorrect = false
    let pointsEarned = 0

    if (question.type === "MULTIPLE_CHOICE") {
      isCorrect = answer === question.correctAnswer
      pointsEarned = isCorrect ? question.points : 0
    } else if (question.type === "LINEAR_SCALE") {
      isCorrect = answer === question.correctAnswer
      pointsEarned = isCorrect ? question.points : 0
    } else if (question.type === "ESSAY") {
      // Essay questions need manual grading
      isCorrect = false
      pointsEarned = 0
    }

    // Save or update answer
    const savedAnswer = await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: params.id,
          questionId,
        },
      },
      create: {
        sessionId: params.id,
        questionId,
        userId: session.user.id,
        answer,
        isCorrect,
        pointsEarned,
      },
      update: {
        answer,
        isCorrect,
        pointsEarned,
      },
    })

    return NextResponse.json(savedAnswer)
  } catch (error) {
    console.error("Error saving answer:", error)
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban" },
      { status: 500 }
    )
  }
}
