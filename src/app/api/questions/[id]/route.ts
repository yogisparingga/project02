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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = questionSchema.parse(body)

    const question = await prisma.question.update({
      where: { id: params.id },
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating question:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate soal" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.question.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Soal berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { error: "Gagal menghapus soal" },
      { status: 500 }
    )
  }
}
