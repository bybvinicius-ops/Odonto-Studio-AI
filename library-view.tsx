"use client"

import { useState } from "react"
import {
  Search, Copy, Trash2, Check, FileText, Filter, Instagram,
  CalendarDays, Loader2, Eye, Pencil, Tag, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLibrary } from "@/hooks/use-supabase-data"
import type { SavedItem } from "@/lib/supabase-store"

const COLOR_TAGS = [
  { value: "", label: "Sem cor", class: "bg-muted" },
  { value: "red", label: "Vermelho", class: "bg-red-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
  { value: "yellow", label: "Amarelo", class: "bg-yellow-400" },
  { value: "green", label: "Verde", class: "bg-emerald-500" },
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "purple", label: "Roxo", class: "bg-violet-500" },
]

function getColorClass(tag?: string): string {
  return COLOR_TAGS.find((c) => c.value === tag)?.class || ""
}

const filterSpecialties = [
  "Todas",
  "Cirurgia e Traumatologia Buco-Maxilo-Faciais",
  "Dentistica",
  "Disfuncao Temporomandibular e Dor Orofacial",
  "Endodontia",
  "Estomatologia",
  "Harmonizacao Orofacial",
  "Homeopatia",
  "Implantodontia",
  "Odontogeriatria",
  "Odontologia do Esporte",
  "Odontologia do Trabalho",
  "Odontologia Hospitalar",
  "Odontologia Legal",
  "Odontologia para Pacientes com Necessidades Especiais",
  "Odontopediatria",
  "Ortodontia",
  "Ortopedia Funcional dos Maxilares",
  "Patologia Oral e Maxilo-Facial",
  "Periodontia",
  "Protese Buco-Maxilo-Facial",
  "Protese Dentaria",
  "Radiologia Odontologica e Imaginologia",
  "Saude Coletiva",
]

interface LibraryViewProps {
  userEmail: string
}

export function LibraryView({ userEmail }: LibraryViewProps) {
  const libraryHook = useLibrary(userEmail)
  const items = libraryHook.items
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("Todas")
  const [filterType, setFilterType] = useState<"todos" | "roteiro" | "legenda" | "calendario30">("todos")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal state
  const [viewItem, setViewItem] = useState<SavedItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  if (libraryHook.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = filterSpecialty === "Todas" || item.specialty === filterSpecialty
    const matchesType = filterType === "todos" || item.type === filterType
    return matchesSearch && matchesSpecialty && matchesType
  })

  const handleCopy = async (item: SavedItem) => {
    await navigator.clipboard.writeText(item.content)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    await libraryHook.remove(id)
    if (viewItem?.id === id) setViewItem(null)
  }

  const handleOpenView = (item: SavedItem) => {
    setViewItem(item)
    setIsEditing(false)
    setEditContent(item.content)
  }

  const handleSaveEdit = async () => {
    if (!viewItem) return
    await libraryHook.update(viewItem.id, { content: editContent })
    setViewItem({ ...viewItem, content: editContent, preview: editContent.slice(0, 150) + "..." })
    setIsEditing(false)
  }

  const handleColorTag = async (item: SavedItem, color: string) => {
    await libraryHook.update(item.id, { color_tag: color })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar roteiros e legendas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground h-11 text-base"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <SelectTrigger className="w-[130px] bg-background border-input text-foreground h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="roteiro">Roteiros</SelectItem>
                  <SelectItem value="legenda">Legendas</SelectItem>
                  <SelectItem value="calendario30">Calendarios</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background border-input text-foreground h-11">
                  <SelectValue placeholder="Filtrar por especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {filterSpecialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {filteredItems.length} {"item"}{filteredItems.length !== 1 ? "s" : ""} {"encontrado"}{filteredItems.length !== 1 ? "s" : ""}
      </p>

      {/* Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="group border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => handleOpenView(item)}
          >
            {/* Color tag strip */}
            {item.color_tag && (
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${getColorClass(item.color_tag)}`} />
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {item.type === "calendario30" ? (
                      <CalendarDays className="h-4 w-4 text-primary" />
                    ) : item.type === "roteiro" ? (
                      <FileText className="h-4 w-4 text-primary" />
                    ) : (
                      <Instagram className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-1 text-foreground">
                      {item.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                  {item.type === "calendario30" ? "Calendario" : item.type === "roteiro" ? "Roteiro" : "Legenda"}
                </Badge>
                <Badge variant="outline" className="border-border text-foreground text-xs">
                  {item.specialty.length > 18 ? item.specialty.slice(0, 18) + "..." : item.specialty}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-sm">{item.preview}</CardDescription>
              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(item)}
                  className="flex-1 bg-transparent hover:bg-accent border-border text-foreground h-9"
                >
                  {copiedId === item.id ? (
                    <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />{"Copiado!"}</>
                  ) : (
                    <><Copy className="mr-1.5 h-3.5 w-3.5" />{"Copiar"}</>
                  )}
                </Button>
                {/* Color tag picker */}
                <div className="relative group/tag">
                  <Button variant="outline" size="sm" className="bg-transparent border-border h-9 px-2">
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                  <div className="absolute bottom-full right-0 mb-1 hidden group-hover/tag:flex items-center gap-1 p-1.5 bg-popover border border-border rounded-lg shadow-lg z-10">
                    {COLOR_TAGS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleColorTag(item, c.value)}
                        className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${c.class} ${
                          (item.color_tag || "") === c.value ? "border-foreground ring-1 ring-foreground" : "border-transparent"
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border h-9 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif text-foreground">Deletar item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acao nao pode ser desfeita. O item sera permanentemente removido da sua biblioteca.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent text-foreground border-border">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="border-border/50 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">
              {items.length === 0 ? "Biblioteca vazia" : "Nenhum item encontrado"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {items.length === 0
                ? "Gere roteiros ou legendas e clique em \"Salvar na Biblioteca\" para armazena-los aqui."
                : "Tente ajustar sua busca ou filtros."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Full View / Edit Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) { setViewItem(null); setIsEditing(false) } }}>
        <DialogContent className="bg-card max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-serif text-foreground flex items-center gap-2">
              {viewItem?.type === "calendario30" ? (
                <CalendarDays className="h-5 w-5 text-primary" />
              ) : viewItem?.type === "roteiro" ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <Instagram className="h-5 w-5 text-primary" />
              )}
              {viewItem?.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {viewItem?.type === "calendario30" ? "Calendario" : viewItem?.type === "roteiro" ? "Roteiro" : "Legenda"}
              </Badge>
              <Badge variant="outline" className="border-border text-foreground">{viewItem?.specialty}</Badge>
              {viewItem?.tone && <Badge variant="outline" className="border-border text-foreground">{viewItem.tone}</Badge>}
              <span className="text-xs text-muted-foreground ml-auto">{viewItem && formatDate(viewItem.createdAt)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] bg-background border-input text-foreground text-sm font-mono leading-relaxed resize-none"
              />
            ) : (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 rounded-lg p-4 border border-border/50">
                {viewItem?.content}
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 flex-row gap-2 sm:justify-between">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-border text-foreground">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Salvar alteracoes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="bg-transparent border-border text-foreground">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {viewItem && (
                <Button
                  variant="outline"
                  onClick={() => handleCopy(viewItem)}
                  className="bg-transparent border-border text-foreground"
                >
                  {copiedId === viewItem.id ? (
                    <><Check className="mr-2 h-4 w-4 text-emerald-600" />{"Copiado!"}</>
                  ) : (
                    <><Copy className="mr-2 h-4 w-4" />{"Copiar tudo"}</>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
