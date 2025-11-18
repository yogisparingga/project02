import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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
    })

    if (!examSession || examSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get question IDs from session data
    const questionIds = (examSession.sessionData as any)?.questionIds || []

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        category: true,
      },
    })

    // Sort questions in the same order as questionIds
    const sortedQuestions = questionIds
      .map((id: string) => questions.find((q) => q.id === id))
      .filter(Boolean)

    // For exam takers, don't send correct answers
    const sanitizedQuestions = sortedQuestions.map((q: any) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      category: q.category,
    }))

    return NextResponse.json(sanitizedQuestions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Gagal mengambil soal" },
      { status: 500 }
    )
  }
}
