"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Save,
  Check,
  Building2,
  User,
  Palette,
  ChevronsUpDown,
  Trash2,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSettings } from "@/hooks/use-supabase-data"
import { clearAllCalendarData } from "@/hooks/use-supabase-data" // Importação correta
import type { UserSettings } from "@/lib/supabase-store"
import { objectives } from "@/lib/odonto-utils"
import { cn } from "@/lib/utils"

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

const tones = [
  { value: "professional", label: "Profissional" },
  { value: "friendly", label: "Amigavel" },
  { value: "educational", label: "Educativo" },
  { value: "motivational", label: "Motivacional" },
  { value: "casual", label: "Descontraido" },
]

interface SettingsViewProps {
  userEmail: string
}

export function SettingsView({ userEmail }: SettingsViewProps) {
  const { settings, isLoading: isLoadingSettings, save } = useSettings(userEmail)
  const [specialtyOpen, setSpecialtyOpen] = useState(false)
  const [clinicName, setClinicName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [defaultTone, setDefaultTone] = useState("")
  const [defaultObjective, setDefaultObjective] = useState("")
  const [defaultScriptMode, setDefaultScriptMode] = useState<"complete" | "simple">("complete")
  const [dentistName, setDentistName] = useState("")
  const [cro, setCro] = useState("")
  const [bio, setBio] = useState("")
  const [instagram, setInstagram] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setClinicName(settings.clinicName)
      setSpecialty(settings.specialty)
      setDefaultTone(settings.defaultTone)
      setDefaultObjective(settings.defaultObjective || "")
      setDefaultScriptMode(settings.defaultScriptMode || "complete")
      setDentistName(settings.dentistName)
      setCro(settings.cro)
      setBio(settings.bio)
      setInstagram(settings.instagram)
    }
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    const updated: UserSettings = {
      clinicName,
      specialty,
      defaultTone,
      defaultObjective,
      defaultScriptMode,
      dentistName,
      cro,
      bio,
      instagram,
    }
    await save(updated)
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearData = async () => {
    await clearAllCalendarData(userEmail) // Função corrigida aqui
    setClinicName("")
    setSpecialty("")
    setDefaultTone("")
    setDefaultObjective("")
    setDefaultScriptMode("complete")
    setDentistName("")
    setCro("")
    setBio("")
    setInstagram("")
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Perfil da Clinica
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Informacoes da sua clinica que serao usadas nos roteiros e legendas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="clinic-name" className="text-foreground">Nome da Clinica</Label>
            <Input
              id="clinic-name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Ex: Clinica Odontologica Sorriso"
              className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
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
                            <Check className={cn("mr-2 h-4 w-4", specialty === spec ? "opacity-100" : "opacity-0")} />
                            {spec}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-foreground">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@suaclinica"
                className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
            <User className="h-5 w-5 text-primary" />
            Perfil Profissional
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Dados do dentista responsavel pelos conteudos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dentist-name" className="text-foreground">Nome Completo</Label>
              <Input
                id="dentist-name"
                value={dentistName}
                onChange={(e) => setDentistName(e.target.value)}
                placeholder="Dr. Joao Silva"
                className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cro" className="text-foreground">CRO</Label>
              <Input
                id="cro"
                value={cro}
                onChange={(e) => setCro(e.target.value)}
                placeholder="CRO-XX 00000"
                className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">Bio / Apresentacao</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Uma breve descricao sobre voce e sua experiencia..."
              className="min-h-[100px] bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta bio sera usada como referencia para personalizar os roteiros gerados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO ATUALIZADA COM O SEU NOVO TEXTO */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Estrategista de Conteúdo - Padrão
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure os roteiros de alta retenção focados na sua especialidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground">Tom de Voz Padrao</Label>
            <Select value={defaultTone} onValueChange={setDefaultTone}>
              <SelectTrigger className="h-11 bg-background border-input text-foreground">
                <SelectValue placeholder="Selecione um tom padrao..." />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Objetivo Padrao</Label>
            <Select value={defaultObjective} onValueChange={setDefaultObjective}>
              <SelectTrigger className="h-11 bg-background border-input text-foreground">
                <SelectValue placeholder="Selecione um objetivo padrao..." />
              </SelectTrigger>
              <SelectContent>
                {objectives.map((obj) => (
                  <SelectItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Modo do Roteiro Padrao</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDefaultScriptMode("complete")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
                  defaultScriptMode === "complete"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/30",
                )}
              >
                <span className="text-sm font-semibold text-foreground">Completo</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  Gancho, cenas, enquadramento, B-roll, legenda, hashtags
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDefaultScriptMode("simple")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
                  defaultScriptMode === "simple"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/30",
                )}
              >
                <span className="text-sm font-semibold text-foreground">Simplificado</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  Falas do profissional, topicos essenciais, CTA e hashtags
                </span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-border" />

      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Limpar todos os dados?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acao ira remover permanentemente todas as suas configuracoes, roteiros salvos, posts do calendario e preferencias do banco de dados. Esta acao nao pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-border text-foreground">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, limpar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleSave} disabled={isSaving} className="h-11 min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90">
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvo!
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alteracoes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}