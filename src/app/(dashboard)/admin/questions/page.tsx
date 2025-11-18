"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, Trash2, FileDown } from "lucide-react"

type Category = {
  id: string
  name: string
  code: string
}

type Question = {
  id: string
  question: string
  type: string
  points: number
  category: Category
}

export default function QuestionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: "",
    type: "MULTIPLE_CHOICE",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: 0,
    explanation: "",
    points: 1,
  })
  const [importFile, setImportFile] = useState<File | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchQuestions()
  }, [selectedCategory])

  const fetchCategories = async () => {
    const response = await fetch("/api/categories")
    const data = await response.json()
    setCategories(data)
  }

  const fetchQuestions = async () => {
    const url = selectedCategory
      ? `/api/questions?categoryId=${selectedCategory}`
      : "/api/questions"
    const response = await fetch(url)
    const data = await response.json()
    setQuestions(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const questionData: any = {
      categoryId: formData.categoryId,
      type: formData.type,
      question: formData.question,
      points: formData.points,
    }

    if (formData.type === "MULTIPLE_CHOICE") {
      questionData.options = [
        formData.optionA,
        formData.optionB,
        formData.optionC,
        formData.optionD,
        formData.optionE,
      ].filter(Boolean)
      questionData.correctAnswer = formData.correctAnswer
    } else if (formData.type === "LINEAR_SCALE") {
      questionData.correctAnswer = formData.correctAnswer
    }

    if (formData.explanation) {
      questionData.explanation = formData.explanation
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      })

      if (response.ok) {
        fetchQuestions()
        setShowAddForm(false)
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error("Error saving question:", error)
      alert("Terjadi kesalahan")
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!importFile || !selectedCategory) {
      alert("Pilih file dan kategori terlebih dahulu")
      return
    }

    const formDataObj = new FormData()
    formDataObj.append("file", importFile)
    formDataObj.append("categoryId", selectedCategory)

    try {
      const response = await fetch("/api/questions/import", {
        method: "POST",
        body: formDataObj,
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        fetchQuestions()
        setShowImportForm(false)
        setImportFile(null)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("Error importing questions:", error)
      alert("Terjadi kesalahan")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      categoryId: "",
      type: "MULTIPLE_CHOICE",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
      correctAnswer: 0,
      explanation: "",
      points: 1,
    })
  }

  const downloadTemplate = () => {
    // Create a simple template download
    const csvContent = "question,type,option_a,option_b,option_c,option_d,option_e,correct_answer,points,explanation\n" +
      "Contoh soal pilihan ganda?,MULTIPLE_CHOICE,Opsi A,Opsi B,Opsi C,Opsi D,Opsi E,0,1,Penjelasan jawaban\n" +
      "Contoh soal essay?,ESSAY,,,,,,,1,\n" +
      "Contoh soal skala linier?,LINEAR_SCALE,,,,,3,1,"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_soal.csv"
    a.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Soal</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => setShowImportForm(!showImportForm)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Soal
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Soal
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Label>Filter Kategori</Label>
        <select
          className="w-full md:w-64 mt-2 h-10 rounded-md border border-gray-300 bg-white px-3"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {showImportForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Import Soal dari Excel/CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <Label>Pilih Kategori</Label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                <Label>File Excel/CSV</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Import</Button>
                <Button type="button" variant="outline" onClick={() => setShowImportForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tambah Soal Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                  <Label>Tipe Soal</Label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                    <option value="ESSAY">Essay</option>
                    <option value="LINEAR_SCALE">Skala Linier (1-5)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Pertanyaan</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              {formData.type === "MULTIPLE_CHOICE" && (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <Label>Pilihan Jawaban</Label>
                    <Input
                      placeholder="Opsi A"
                      value={formData.optionA}
                      onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Opsi B"
                      value={formData.optionB}
                      onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Opsi C"
                      value={formData.optionC}
                      onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    />
                    <Input
                      placeholder="Opsi D"
                      value={formData.optionD}
                      onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    />
                    <Input
                      placeholder="Opsi E"
                      value={formData.optionE}
                      onChange={(e) => setFormData({ ...formData, optionE: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Jawaban Benar (index 0-4)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </>
              )}

              {formData.type === "LINEAR_SCALE" && (
                <div>
                  <Label>Nilai Benar (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}

              <div>
                <Label>Pembahasan (opsional)</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              <div>
                <Label>Poin</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Soal ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.category.name}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {question.type === "MULTIPLE_CHOICE"
                        ? "Pilihan Ganda"
                        : question.type === "ESSAY"
                        ? "Essay"
                        : "Skala Linier"}
                    </span>
                    <span className="text-xs text-gray-600">{question.points} poin</span>
                  </div>
                  <p className="text-gray-900">{question.question}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(question.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-center text-gray-500 py-8">Belum ada soal</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
