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

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
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
    })

    if (!exam) {
      return NextResponse.json(
        { error: "Ujian tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data ujian" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: { status },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate ujian" },
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

    await prisma.exam.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Ujian berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json(
      { error: "Gagal menghapus ujian" },
      { status: 500 }
    )
  }
}
