import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const examSchema = z.object({
  title: z.string().min(1, "Judul ujian harus diisi"),
  description: z.string().optional(),
  duration: z.number().min(1, "Durasi minimal 1 menit"),
  passingScore: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categories: z.array(
    z.object({
      categoryId: z.string(),
      questionCount: z.number().min(1),
    })
  ),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exams = await prisma.exam.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data ujian" },
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
    const data = examSchema.parse(body)

    // Create exam with categories
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        passingScore: data.passingScore,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: "DRAFT",
        categories: {
          create: data.categories,
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Gagal membuat paket ujian" },
      { status: 500 }
    )
  }
}
