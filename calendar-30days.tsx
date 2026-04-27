"use client"

import { useState } from "react"
import { CalendarDays, Loader2, Download, RefreshCw, Video, FileText, Instagram, ChevronsUpDown, Check, BookmarkPlus, BookmarkCheck, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// PDF export is handled via dynamic import below

const specialties = [
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

interface ContentDay {
  day: number
  weekday: string
  theme: string
  format: string
  objective: string
  caption?: string
}

async function fetchCalendarFromAPI(specialty: string): Promise<ContentDay[]> {
  const response = await fetch("/api/generate-calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ specialty }),
  })

  if (!response.ok) {
    throw new Error("Erro ao gerar calendario")
  }

  const data = await response.json()
  return data.calendar
}

const formatIcons: Record<string, typeof Video> = {
  video: Video,
  carrossel: FileText,
  reels: Instagram,
  story: Instagram,
  foto: FileText,
}

const formatColors: Record<string, string> = {
  video: "bg-blue-100 text-blue-800 border-blue-200",
  carrossel: "bg-purple-100 text-purple-800 border-purple-200",
  reels: "bg-pink-100 text-pink-800 border-pink-200",
  story: "bg-amber-100 text-amber-800 border-amber-200",
  foto: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

function getFormatKey(format: string): string {
  return format.toLowerCase().trim()
}

interface Calendar30DaysProps {
  onSaveToLibrary?: (items: ContentDay[]) => void
  onPushToCalendar?: (items: ContentDay[]) => void
}

export function Calendar30Days({ onSaveToLibrary, onPushToCalendar }: Calendar30DaysProps) {
  const [specialty, setSpecialty] = useState("")
  const [specialtyOpen, setSpecialtyOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [calendar, setCalendar] = useState<ContentDay[] | null>(null)
  const [savedToLib, setSavedToLib] = useState(false)
  const [pushedToCal, setPushedToCal] = useState(false)

  const handleGenerate = async () => {
    if (specialty) {
      setIsLoading(true)
      try {
        const generated = await fetchCalendarFromAPI(specialty)
        setCalendar(generated)
        setSavedToLib(false)
      } catch {
        setCalendar(null)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSaveToLibrary = () => {
    if (calendar && onSaveToLibrary) {
      onSaveToLibrary(calendar)
      setSavedToLib(true)
      setTimeout(() => setSavedToLib(false), 3000)
    }
  }

  const handlePushToCalendar = () => {
    if (calendar && onPushToCalendar) {
      onPushToCalendar(calendar)
      setPushedToCal(true)
      setTimeout(() => setPushedToCal(false), 3000)
    }
  }

  const handleReset = () => {
    setCalendar(null)
    setSpecialty("")
    setSavedToLib(false)
    setPushedToCal(false)
  }

  // --- EXPORTAR COMO PDF VIA DYNAMIC IMPORT ---
  const handleExportPDF = async () => {
    if (!calendar) return

    const { default: jsPDF } = await import("jspdf")
    const autoTableModule = await import("jspdf-autotable")
    const autoTable = autoTableModule.default || autoTableModule

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Planejamento de Conteudo - 30 Dias", 14, 22)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Especialidade: ${specialty}`, 14, 30)

    const tableColumn = ["Dia", "Semana", "Tema", "Formato", "Objetivo"]
    const tableRows = calendar.map((day) => [
      day.day.toString(),
      day.weekday,
      day.theme,
      day.format.charAt(0).toUpperCase() + day.format.slice(1),
      day.objective,
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [63, 63, 70] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 20 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: "auto" },
      },
    })

    const fileName = `calendario-30dias-${specialty.toLowerCase().replace(/\s/g, "-")}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          {/* TÍTULOS ATUALIZADOS AQUI */}
          <CardTitle className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <CalendarDays className="h-6 w-6 text-primary" />
            Gerador de ideias - 30 dias
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Receba sugestões inteligentes de posts e organize seu calendário automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-foreground">Especialidade Principal</Label>
              <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={specialtyOpen}
                    className="h-11 w-full justify-between bg-background border-input text-foreground hover:border-primary/50 transition-colors font-normal"
                  >
                    {specialty || "Buscar especialidade..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar especialidade..." />
                    <CommandList>
                      <CommandEmpty>Especialidade nao encontrada.</CommandEmpty>
                      <CommandGroup>
                        {specialties.map((spec) => (
                          <CommandItem
                            key={spec}
                            value={spec}
                            onSelect={(value) => {
                              setSpecialty(value === specialty ? "" : value)
                              setSpecialtyOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                specialty === spec ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {spec}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* BOTÃO ATUALIZADO AQUI */}
            <Button
              onClick={handleGenerate}
              disabled={!specialty || isLoading}
              className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[180px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Planejar meu mês agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {calendar && (
        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl text-foreground">Seu Calendario de Conteudo</CardTitle>
                <CardDescription className="text-muted-foreground">
                  30 dias de sugestoes para {specialty}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveToLibrary}
                  disabled={savedToLib}
                  className={savedToLib
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-50"
                    : "border-primary text-primary hover:bg-primary/10 bg-transparent"
                  }
                >
                  {savedToLib ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Salvar na Biblioteca
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePushToCalendar}
                  disabled={pushedToCal}
                  className={pushedToCal
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-50"
                    : "border-primary text-primary hover:bg-primary/10 bg-transparent"
                  }
                >
                  {pushedToCal ? (
                    <>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Enviado!
                    </>
                  ) : (
                    <>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Enviar ao Calendario
                    </>
                  )}
                </Button>
                {/* BOTÃO EXPORTAR PDF AQUI */}
                <Button variant="outline" onClick={handleExportPDF} className="bg-transparent border-border text-foreground">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Novo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16 font-semibold text-foreground">Dia</TableHead>
                    <TableHead className="w-20 font-semibold text-foreground">Semana</TableHead>
                    <TableHead className="font-semibold text-foreground">Tema</TableHead>
                    <TableHead className="w-32 font-semibold text-foreground">Formato</TableHead>
                    <TableHead className="w-28 font-semibold text-foreground">Objetivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendar.map((day, index) => {
                    const fmtKey = getFormatKey(day.format)
                    const FormatIcon = formatIcons[fmtKey] || FileText
                    return (
                      <TableRow key={`${day.day}-${index}`} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground">{day.day}</TableCell>
                        <TableCell>
                          <span className={`text-sm ${day.weekday === "Dom" || day.weekday === "Sab" ? "text-muted-foreground" : "text-foreground"}`}>
                            {day.weekday}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">{day.theme}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${formatColors[fmtKey] || "bg-muted text-foreground border-border"} flex items-center gap-1 w-fit`}>
                            <FormatIcon className="h-3 w-3" />
                            {day.format.charAt(0).toUpperCase() + day.format.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{day.objective}</span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!calendar && (
        <Card className="border-border/50 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <CalendarDays className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">Planeje seu mes de conteudo</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Selecione sua especialidade acima para gerar automaticamente 30 dias de sugestoes de conteudo personalizadas para sua clinica.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}