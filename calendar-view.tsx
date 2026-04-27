"use client"

import React, { useState, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  FileText,
  Instagram,
  Trash2,
  Clock,
  Download,
  Filter,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCalendar } from "@/hooks/use-supabase-data"
import type { CalendarPost } from "@/lib/supabase-store"

const typeStyles: Record<string, { bg: string, border: string, text: string, icon: React.ElementType }> = {
  video: { bg: "bg-purple-600/15", border: "border-purple-400", text: "text-purple-700 dark:text-purple-300", icon: Video },
  carrossel: { bg: "bg-blue-600/15", border: "border-blue-400", text: "text-blue-700 dark:text-blue-300", icon: FileText },
  reels: { bg: "bg-pink-600/15", border: "border-pink-400", text: "text-pink-700 dark:text-pink-300", icon: Instagram },
  story: { bg: "bg-orange-600/15", border: "border-orange-400", text: "text-orange-700 dark:text-orange-300", icon: Instagram },
}

const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

export function CalendarView({ userEmail }: { userEmail: string }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const calendarHook = useCalendar(userEmail)
  const posts = calendarHook.posts

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null)
  const [dialogDay, setDialogDay] = useState<number | null>(null)
  const [formData, setFormData] = useState({ theme: "", type: "video" as CalendarPost["type"], status: "rascunho" as CalendarPost["status"], time: "10:00", notes: "" })
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "ai">("all")

  const dragItem = useRef<string | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getPostsForDay = (day: number) =>
    posts
      .filter(p => p.date === day && p.month === month && p.year === year && (sourceFilter === "all" || p.source === sourceFilter))
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))

  const onDragStart = (postId: string) => { dragItem.current = postId }

  const onDrop = async (e: React.DragEvent, targetDay: number) => {
    e.preventDefault()
    if (!dragItem.current) return
    const postToMove = posts.find(p => p.id === dragItem.current)
    if (postToMove) {
      await calendarHook.upsert({
        ...postToMove,
        date: Number(targetDay),
        month: Number(month),
        year: Number(year)
      })
    }
    dragItem.current = null
  }

  const handleOpenNew = (day: number) => {
    setEditingPost(null)
    setDialogDay(day)
    setFormData({ theme: "", type: "video", status: "rascunho", time: "10:00", notes: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (post: CalendarPost) => {
    setEditingPost(post)
    setDialogDay(post.date)
    setFormData({ theme: post.theme, type: post.type, status: post.status, time: post.time || "", notes: post.notes || "" })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.theme || dialogDay === null) return
    await calendarHook.upsert({
      id: editingPost?.id || `post-${Date.now()}`,
      user_email: userEmail,
      date: dialogDay,
      month,
      year,
      theme: formData.theme,
      type: formData.type,
      status: formData.status,
      source: editingPost?.source || "manual",
      time: formData.time,
      notes: formData.notes,
    } as CalendarPost & { user_email: string })
    setIsDialogOpen(false)
  }

  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(0, 122, 255)
    doc.text(`Calendario - ${months[month]} ${year}`, 14, 18)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Exportado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 25)

    doc.setDrawColor(200, 200, 200)
    doc.line(14, 28, 283, 28)

    let yPos = 35
    const pageWidth = 283
    const colWidth = pageWidth / 7
    const margin = 14

    // Header row
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPos - 5, pageWidth, 10, "F")
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(80, 80, 80)
    weekDays.forEach((d, i) => {
      doc.text(d, margin + i * colWidth + colWidth / 2, yPos, { align: "center" })
    })
    yPos += 12

    // Calendar grid
    let col = 0
    const rowStartY = yPos

    days.forEach((day) => {
      if (col === 0 && day !== null && days.indexOf(day) > 0 && days.indexOf(day) >= 7) {
        // nothing, handle row breaks below
      }

      const x = margin + col * colWidth
      const cellY = yPos

      doc.setDrawColor(220, 220, 220)
      doc.rect(x, cellY, colWidth, 22)

      if (day !== null) {
        const dayPosts = getPostsForDay(day)

        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(50, 50, 50)
        doc.text(String(day), x + 2, cellY + 5)

        if (dayPosts.length > 0) {
          doc.setFontSize(6)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(100, 100, 100)
          dayPosts.slice(0, 2).forEach((p, i) => {
            const label = `${p.type.charAt(0).toUpperCase()}${p.type.slice(1)}: ${p.theme}`
            const truncated = label.length > 25 ? label.slice(0, 22) + "..." : label
            doc.text(truncated, x + 2, cellY + 10 + i * 5)
          })
          if (dayPosts.length > 2) {
            doc.text(`+${dayPosts.length - 2} mais`, x + 2, cellY + 20)
          }
        }
      }

      col++
      if (col >= 7) {
        col = 0
        yPos += 22
        if (yPos > 180) {
          doc.addPage()
          yPos = 20
        }
      }
    })

    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text("Powered by BYB Midia Digital | Odonto Studio AI", 14, doc.internal.pageSize.getHeight() - 8)

    doc.save(`Calendario_${months[month]}_${year}.pdf`)
  }

  if (calendarHook.isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[150px]">
            <h2 className="text-xl font-bold text-foreground">{months[month]} {year}</h2>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={sourceFilter} onValueChange={(v: "all" | "manual" | "ai") => setSourceFilter(v)}>
            <SelectTrigger className="w-[160px] bg-background">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os posts</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="ai">Gerado por IA</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={() => handleOpenNew(new Date().getDate())}>
            <Plus className="mr-2 h-4 w-4" /> Novo Post
          </Button>
        </div>
      </div>

      {/* Calendar grid with horizontal scroll on mobile */}
      <Card className="border-none shadow-2xl bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div ref={calendarRef} className="bg-background p-4 min-w-[700px]">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
                {weekDays.map(d => (
                  <div key={d} className="text-center text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest py-2 border-b-2 border-primary/10">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {days.map((day, index) => {
                  const dayPosts = day ? getPostsForDay(day) : []
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

                  return (
                    <div
                      key={`day-${index}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => day && onDrop(e, day)}
                      className={`min-h-[100px] sm:min-h-[140px] lg:min-h-[170px] flex flex-col rounded-lg sm:rounded-xl border p-1.5 sm:p-2 transition-all ${
                        day
                          ? "bg-card/40 border-border hover:border-primary/40 group"
                          : "bg-muted/5 border-transparent"
                      } ${isToday ? "ring-2 ring-primary bg-primary/5" : ""}`}
                    >
                      {day && (
                        <>
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className={`text-xs sm:text-sm font-black ${
                              isToday
                                ? "h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                                : "text-muted-foreground/60"
                            }`}>
                              {day}
                            </span>
                            <button
                              onClick={() => handleOpenNew(day)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 sm:p-1 hover:bg-primary/10 rounded-full transition-all"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </button>
                          </div>
                          <div className="flex-1 space-y-1 sm:space-y-1.5">
                            {dayPosts.map(post => {
                              const style = typeStyles[post.type] || typeStyles.video
                              const Icon = style.icon
                              return (
                                <div
                                  key={post.id}
                                  draggable
                                  onDragStart={() => onDragStart(post.id)}
                                  onClick={() => handleOpenEdit(post)}
                                  className={`p-1 sm:p-2 rounded-md sm:rounded-lg border-l-[3px] shadow-sm cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all ${style.bg} ${style.border} ${style.text}`}
                                >
                                  <div className="flex items-start gap-1">
                                    <Icon className="h-3 w-3 mt-0.5 shrink-0" />
                                    <p className="text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-2 uppercase">
                                      {post.theme}
                                    </p>
                                  </div>
                                  {post.time && (
                                    <div className="flex items-center gap-1 mt-0.5 opacity-70">
                                      <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                      <span className="text-[8px] sm:text-[9px] font-bold">{post.time}</span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit/New Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingPost ? "Editar" : "Novo"} Post - Dia {dialogDay}
            </DialogTitle>
            <DialogDescription>Preencha os dados do post para este dia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Input value={formData.theme} onChange={e => setFormData({ ...formData, theme: e.target.value })} className="text-base" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as CalendarPost["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="text-base" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as CalendarPost["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="text-base" />
            </div>
          </div>
          <DialogFooter className="flex justify-between w-full">
            {editingPost && (
              <Button
                variant="ghost"
                onClick={async () => {
                  await calendarHook.remove(editingPost.id)
                  setIsDialogOpen(false)
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
