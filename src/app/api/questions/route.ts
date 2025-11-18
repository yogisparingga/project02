import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const questionSchema = z.object({
  categoryId: z.string(),
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY", "LINEAR_SCALE"]),
  question: z.string().min(1, "Pertanyaan harus diisi"),
  options: z.any().optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
  points: z.number().default(1),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")

    const where = categoryId ? { categoryId } : {}

    const questions = await prisma.question.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data soal" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = questionSchema.parse(body)

    const question = await prisma.question.create({
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Gagal membuat soal" },
      { status: 500 }
    )
  }
}
