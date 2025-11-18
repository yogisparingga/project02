"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Eye, CheckCircle } from "lucide-react"
import { formatDuration } from "@/lib/utils"

type Category = {
  id: string
  name: string
  code: string
}

type Exam = {
  id: string
  title: string
  description: string | null
  duration: number
  status: string
  passingScore: number | null
  categories: {
    category: Category
    questionCount: number
  }[]
  _count: {
    sessions: number
  }
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 90,
    passingScore: 70,
    startDate: "",
    endDate: "",
  })
  const [selectedCategories, setSelectedCategories] = useState<
    Array<{ categoryId: string; questionCount: number }>
  >([])

  useEffect(() => {
    fetchExams()
    fetchCategories()
  }, [])

  const fetchExams = async () => {
    const response = await fetch("/api/exams")
    const data = await response.json()
    setExams(data)
  }

  const fetchCategories = async () => {
    const response = await fetch("/api/categories")
    const data = await response.json()
    setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCategories.length === 0) {
      alert("Pilih minimal 1 kategori")
      return
    }

    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categories: selectedCategories,
        }),
      })

      if (response.ok) {
        fetchExams()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error("Error saving exam:", error)
      alert("Terjadi kesalahan")
    }
  }

  const handlePublish = async (examId: string) => {
    if (!confirm("Yakin ingin mempublish ujian ini?")) return

    try {
      const response = await fetch(`/api/exams/${examId}/publish`, {
        method: "POST",
      })

      if (response.ok) {
        fetchExams()
        alert("Ujian berhasil dipublish")
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error("Error publishing exam:", error)
      alert("Terjadi kesalahan")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ujian ini?")) return

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchExams()
      }
    } catch (error) {
      console.error("Error deleting exam:", error)
    }
  }

  const addCategory = () => {
    setSelectedCategories([
      ...selectedCategories,
      { categoryId: "", questionCount: 10 },
    ])
  }

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...selectedCategories]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedCategories(updated)
  }

  const removeCategory = (index: number) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 90,
      passingScore: 70,
      startDate: "",
      endDate: "",
    })
    setSelectedCategories([])
    setShowForm(false)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      ARCHIVED: "bg-red-100 text-red-800",
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Paket Ujian</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Paket Ujian
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buat Paket Ujian Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Judul Ujian</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="contoh: Ujian CPNS 2024"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[80px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi ujian"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Durasi (menit)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="passingScore">Nilai Lulus (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Tanggal Selesai</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Kategori Soal</Label>
                  <Button type="button" size="sm" onClick={addCategory}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Kategori
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedCategories.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3"
                        value={item.categoryId}
                        onChange={(e) => updateCategory(index, "categoryId", e.target.value)}
                        required
                      >
                        <option value="">Pilih kategori...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min="1"
                        className="w-32"
                        placeholder="Jumlah soal"
                        value={item.questionCount}
                        onChange={(e) =>
                          updateCategory(index, "questionCount", parseInt(e.target.value))
                        }
                        required
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCategory(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}

                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Belum ada kategori dipilih
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Simpan Draft</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusBadge(exam.status)}`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="text-sm text-gray-600">{exam.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {exam.status === "DRAFT" && (
                    <Button size="sm" onClick={() => handlePublish(exam.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(exam.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Durasi</p>
                  <p className="font-medium">{formatDuration(exam.duration)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nilai Lulus</p>
                  <p className="font-medium">{exam.passingScore || "-"}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <p className="font-medium">{exam.categories.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sesi</p>
                  <p className="font-medium">{exam._count.sessions}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Kategori Soal:</p>
                <div className="flex flex-wrap gap-2">
                  {exam.categories.map((cat, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded"
                    >
                      {cat.category.name}: {cat.questionCount} soal
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {exams.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Belum ada paket ujian</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
