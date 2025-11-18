import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const categoryId = formData.get("categoryId") as string

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Kategori harus dipilih" },
        { status: 400 }
      )
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Import questions
    const questions = []

    for (const row of data as any[]) {
      const questionData: any = {
        categoryId,
        question: row.question || row.pertanyaan || row.soal,
        type: row.type || row.tipe || "MULTIPLE_CHOICE",
        points: parseFloat(row.points || row.poin || "1"),
      }

      // Handle different question types
      if (questionData.type === "MULTIPLE_CHOICE") {
        questionData.options = [
          row.option_a || row.opsi_a,
          row.option_b || row.opsi_b,
          row.option_c || row.opsi_c,
          row.option_d || row.opsi_d,
          row.option_e || row.opsi_e,
        ].filter(Boolean)

        questionData.correctAnswer = parseInt(row.correct_answer || row.jawaban_benar || "0")
      } else if (questionData.type === "LINEAR_SCALE") {
        questionData.correctAnswer = parseInt(row.correct_answer || row.jawaban_benar || "3")
      }

      if (row.explanation || row.pembahasan) {
        questionData.explanation = row.explanation || row.pembahasan
      }

      if (questionData.question) {
        questions.push(questionData)
      }
    }

    // Bulk create
    const created = await prisma.question.createMany({
      data: questions,
    })

    return NextResponse.json({
      message: `Berhasil import ${created.count} soal`,
      count: created.count,
    })
  } catch (error) {
    console.error("Error importing questions:", error)
    return NextResponse.json(
      { error: "Gagal import soal" },
      { status: 500 }
    )
  }
}
