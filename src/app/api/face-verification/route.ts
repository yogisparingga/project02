import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, imageData } = await req.json()

    // In production, you would use a real face recognition service here
    // For now, we'll simulate face verification

    // Simulate face matching (in real implementation, compare with stored user photo)
    const matched = Math.random() > 0.1 // 90% match rate for demo

    // Save verification record
    const verification = await prisma.faceVerification.create({
      data: {
        sessionId,
        userId: session.user.id,
        imageData,
        matched,
        confidence: matched ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5, // 70-100% or 0-50%
      },
    })

    return NextResponse.json({
      matched,
      confidence: verification.confidence,
      message: matched
        ? "Verifikasi wajah berhasil"
        : "Wajah tidak cocok - Admin akan mendapat notifikasi",
    })
  } catch (error) {
    console.error("Error in face verification:", error)
    return NextResponse.json(
      { error: "Gagal melakukan verifikasi wajah" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get failed verifications
    const failedVerifications = await prisma.faceVerification.findMany({
      where: {
        matched: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        session: {
          include: {
            exam: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json(failedVerifications)
  } catch (error) {
    console.error("Error fetching verifications:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data verifikasi" },
      { status: 500 }
    )
  }
}
