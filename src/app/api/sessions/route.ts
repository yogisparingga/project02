import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || session.user.id

    const sessions = await prisma.examSession.findMany({
      where: { userId },
      include: {
        exam: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data sesi" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await req.json()

    // Check if exam exists and is published
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        categories: {
          include: {
            category: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    })

    if (!exam || exam.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Ujian tidak tersedia" },
        { status: 400 }
      )
    }

    // Select random questions from each category
    const selectedQuestions: string[] = []

    for (const examCategory of exam.categories) {
      const questions = examCategory.category.questions
      const shuffled = questions.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, examCategory.questionCount)
      selectedQuestions.push(...selected.map((q) => q.id))
    }

    // Create exam session
    const examSession = await prisma.examSession.create({
      data: {
        userId: session.user.id,
        examId,
        status: "NOT_STARTED",
        sessionData: {
          questionIds: selectedQuestions,
          currentQuestionIndex: 0,
        },
      },
      include: {
        exam: true,
      },
    })

    return NextResponse.json(examSession, { status: 201 })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json(
      { error: "Gagal membuat sesi ujian" },
      { status: 500 }
    )
  }
}
