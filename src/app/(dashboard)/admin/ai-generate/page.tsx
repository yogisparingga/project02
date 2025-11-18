"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain } from "lucide-react"

type Category = {
  id: string
  name: string
  code: string
}

export default function AIGeneratePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: "",
    questionType: "MULTIPLE_CHOICE",
    count: 5,
    topic: "",
  })
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const response = await fetch("/api/categories")
    const data = await response.json()
    setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        alert(data.message)
      } else {
        alert(data.error || "Terjadi kesalahan")
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      alert("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          Generate Soal dengan AI
        </h1>
        <p className="text-gray-600 mt-2">
          Gunakan AI untuk generate soal ujian secara otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Generate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Kategori Soal</Label>
                <select
                  id="categoryId"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="questionType">Tipe Soal</Label>
                <select
                  id="questionType"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                  value={formData.questionType}
                  onChange={(e) =>
                    setFormData({ ...formData, questionType: e.target.value })
                  }
                >
                  <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                  <option value="ESSAY">Essay</option>
                  <option value="LINEAR_SCALE">Skala Linier</option>
                </select>
              </div>

              <div>
                <Label htmlFor="count">Jumlah Soal</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData({ ...formData, count: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="topic">Topik (opsional)</Label>
                <Input
                  id="topic"
                  placeholder="Contoh: Matematika Dasar, Sejarah Indonesia"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Generating..." : "Generate Soal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hasil Generate</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && (
              <p className="text-center text-gray-500 py-8">
                Hasil generate akan muncul di sini
              </p>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">{result.message}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Soal yang di-generate:</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.questions?.map((q: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-medium">
                          {index + 1}. {q.question}
                        </p>
                        {q.options && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {q.options.map((opt: string, i: number) => (
                              <li
                                key={i}
                                className={
                                  i === q.correctAnswer
                                    ? "text-green-600 font-medium"
                                    : ""
                                }
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Catatan Penggunaan AI</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Pastikan OpenAI API key sudah dikonfigurasi di .env</li>
            <li>• AI akan generate soal dalam Bahasa Indonesia</li>
            <li>• Soal yang di-generate otomatis tersimpan ke bank soal</li>
            <li>• Review dan edit soal jika diperlukan sebelum digunakan</li>
            <li>• Biaya API berlaku sesuai penggunaan OpenAI</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
