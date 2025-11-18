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
    })

    if (!examSession || examSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updated = await prisma.examSession.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error starting session:", error)
    return NextResponse.json(
      { error: "Gagal memulai ujian" },
      { status: 500 }
    )
  }
}
