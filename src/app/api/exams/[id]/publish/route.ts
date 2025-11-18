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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if exam has categories and questions
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            category: {
              include: {
                _count: {
                  select: { questions: true },
                },
              },
            },
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json(
        { error: "Ujian tidak ditemukan" },
        { status: 404 }
      )
    }

    // Validate each category has enough questions
    for (const examCategory of exam.categories) {
      if (examCategory.category._count.questions < examCategory.questionCount) {
        return NextResponse.json(
          {
            error: `Kategori ${examCategory.category.name} hanya memiliki ${examCategory.category._count.questions} soal, dibutuhkan ${examCategory.questionCount} soal`,
          },
          { status: 400 }
        )
      }
    }

    // Publish exam
    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: { status: "PUBLISHED" },
    })

    return NextResponse.json(updatedExam)
  } catch (error) {
    console.error("Error publishing exam:", error)
    return NextResponse.json(
      { error: "Gagal mempublish ujian" },
      { status: 500 }
    )
  }
}
