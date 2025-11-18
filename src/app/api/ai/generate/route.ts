import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, questionType, count, topic } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key tidak dikonfigurasi" },
        { status: 500 }
      )
    }

    // Get category info
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      )
    }

    // Create prompt based on question type
    let prompt = `Generate ${count} ${questionType} questions for ${category.name} category`
    if (topic) {
      prompt += ` about ${topic}`
    }

    if (questionType === "MULTIPLE_CHOICE") {
      prompt += `. For each question, provide:
1. The question text
2. 5 options (A, B, C, D, E)
3. The correct answer (0-4 index)
4. An explanation

Format as JSON array with structure: [{ question, options: [], correctAnswer: number, explanation }]`
    } else if (questionType === "ESSAY") {
      prompt += `. Format as JSON array with structure: [{ question, explanation }]`
    } else if (questionType === "LINEAR_SCALE") {
      prompt += ` with answer range 1-5. Format as JSON array with structure: [{ question, correctAnswer: number (1-5), explanation }]`
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert exam question generator. Generate high-quality, educational questions in Indonesian language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0].message.content
    const generated = JSON.parse(content || "{}")

    // Save to AI generations log
    await prisma.aIGeneration.create({
      data: {
        categoryId,
        prompt,
        response: generated,
        questionCount: count,
      },
    })

    // Create questions
    const questions = generated.questions || []
    const created = []

    for (const q of questions) {
      const question = await prisma.question.create({
        data: {
          categoryId,
          type: questionType,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: 1,
        },
      })
      created.push(question)
    }

    return NextResponse.json({
      message: `Berhasil generate ${created.length} soal`,
      questions: created,
    })
  } catch (error: any) {
    console.error("Error generating questions:", error)
    return NextResponse.json(
      { error: error.message || "Gagal generate soal" },
      { status: 500 }
    )
  }
}
