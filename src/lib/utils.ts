import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(d)
}

export function calculateScore(answers: any[], questions: any[]): number {
  let totalPoints = 0
  let earnedPoints = 0

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) return

    totalPoints += question.points

    if (answer.isCorrect) {
      earnedPoints += question.points
    }
  })

  return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours} jam ${mins} menit`
  }
  return `${mins} menit`
}
