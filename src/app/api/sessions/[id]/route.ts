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
        answers: true,
      },
    })

    if (!examSession) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 404 }
      )
    }

    // Only owner or admin can access
    if (
      examSession.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(examSession)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data sesi" },
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, sessionData } = body

    const examSession = await prisma.examSession.findUnique({
      where: { id: params.id },
    })

    if (!examSession || examSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
      if (status === "IN_PROGRESS" && !examSession.startedAt) {
        updateData.startedAt = new Date()
      } else if (status === "IN_PROGRESS") {
        updateData.resumedAt = new Date()
      }
    }

    if (sessionData) {
      updateData.sessionData = sessionData
    }

    const updated = await prisma.examSession.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate sesi" },
      { status: 500 }
    )
  }
}
