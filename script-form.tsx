"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Sparkles, Loader2, AlertTriangle, Check, Lightbulb, ChevronsUpDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  correctThemePtBr,
  isRiskyTheme,
  objectives,
} from "@/lib/odonto-utils"
import { cn } from "@/lib/utils"

interface ScriptFormDefaults {
  specialty?: string
  tone?: string
  objective?: string
  scriptMode?: "complete" | "simple"
}

interface ScriptFormProps {
  onGenerate: (data: {
    specialty: string
    theme: string
    correctedTheme: string
    tone: string
    objective: string
    scriptMode: "complete" | "simple"
  }) => void
  isLoading: boolean
  defaults?: ScriptFormDefaults
}

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

export function ScriptForm({ onGenerate, isLoading, defaults }: ScriptFormProps) {
  const [specialty, setSpecialty] = useState("")
  const [specialtyOpen, setSpecialtyOpen] = useState(false)
  const [scriptMode, setScriptMode] = useState<"complete" | "simple">("complete")
  const [theme, setTheme] = useState("")
  const [correctedTheme, setCorrectedTheme] = useState("")
  const [tone, setTone] = useState("")
  const [objective, setObjective] = useState("")
  const [riskWarning, setRiskWarning] = useState<{ warning: string; suggestion: string } | null>(null)
  const [showCorrectionHint, setShowCorrectionHint] = useState(false)
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false)

  useEffect(() => {
    if (defaults && !hasLoadedDefaults) {
      if (defaults.specialty) setSpecialty(defaults.specialty)
      if (defaults.tone) setTone(defaults.tone)
      if (defaults.objective) setObjective(defaults.objective)
      if (defaults.scriptMode) setScriptMode(defaults.scriptMode)
      setHasLoadedDefaults(true)
    }
  }, [defaults, hasLoadedDefaults])

  const processTheme = useCallback((input: string) => {
    if (!input.trim()) {
      setCorrectedTheme("")
      setRiskWarning(null)
      setShowCorrectionHint(false)
      return
    }

    const corrected = correctThemePtBr(input)
    setCorrectedTheme(corrected)
    setShowCorrectionHint(corrected.toLowerCase() !== input.toLowerCase())

    const riskCheck = isRiskyTheme(input)
    if (riskCheck.isRisky && riskCheck.warning && riskCheck.suggestion) {
      setRiskWarning({
        warning: riskCheck.warning,
        suggestion: riskCheck.suggestion,
      })
    } else {
      setRiskWarning(null)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      processTheme(theme)
    }, 500)
    return () => clearTimeout(timer)
  }, [theme, processTheme])

  const handleUseSuggestion = () => {
    if (riskWarning?.suggestion) {
      setTheme(riskWarning.suggestion)
      setCorrectedTheme(riskWarning.suggestion)
      setRiskWarning(null)
      setShowCorrectionHint(false)
    }
  }

  const handleUseCorrected = () => {
    setTheme(correctedTheme)
    setShowCorrectionHint(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (specialty && theme && tone && objective) {
      onGenerate({
        specialty,
        theme,
        correctedTheme: correctedTheme || theme,
        tone,
        objective,
        scriptMode,
      })
    }
  }

  const isFormValid = specialty && theme && tone && objective

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-2">
        {/* Título e Tagline removidos daqui para evitar repetição com o cabeçalho da page.tsx */}
        {hasLoadedDefaults && defaults && (defaults.specialty || defaults.tone || defaults.objective) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-primary">
            <Settings className="h-3.5 w-3.5" />
            <span>Usando preferencias salvas das Configuracoes</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Script Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Modo do Roteiro</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScriptMode("complete")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
                  scriptMode === "complete"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <span className="text-sm font-semibold text-foreground">Completo</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  Gancho, cenas, enquadramento, B-roll, legenda, hashtags e checklist
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScriptMode("simple")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
                  scriptMode === "simple"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <span className="text-sm font-semibold text-foreground">Simplificado</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  Falas do profissional, topicos essenciais, CTA e hashtags
                </span>
              </button>
            </div>
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Especialidade</Label>
            <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={specialtyOpen}
                  className="h-12 w-full justify-between bg-background border-input text-foreground hover:border-primary/50 transition-colors font-normal text-base"
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

          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="text-sm font-medium text-foreground">
              Objetivo
            </Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger
                id="objective"
                className="h-12 bg-background border-input text-foreground hover:border-primary/50 transition-colors text-base"
              >
                <SelectValue placeholder="Qual o objetivo do video?" />
              </SelectTrigger>
              <SelectContent>
                {objectives.map((obj) => (
                  <SelectItem key={obj.value} value={obj.value}>
                    <span className="font-medium">{obj.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{obj.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Idea Input */}
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-sm font-medium text-foreground">
              Qual sua ideia inicial?
            </Label>
            <Input
              id="theme"
              type="text"
              placeholder="Ex: Dicas para manter os dentes saudaveis"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground hover:border-primary/50 transition-colors text-base"
            />

            {showCorrectionHint && !riskWarning && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm">
                <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <span className="text-muted-foreground">{"Sugestao: "}</span>
                  <span className="font-medium text-foreground">{correctedTheme}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseCorrected}
                  className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Usar
                </Button>
              </div>
            )}

            {riskWarning && (
              <Alert className="mt-3 border-amber-500/50 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Atencao ao conteudo</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">{riskWarning.warning}</p>
                  <div className="flex items-center gap-2 rounded-md bg-amber-100 p-2">
                    <span className="text-sm">
                      {"Tema sugerido: "}
                      <strong>{riskWarning.suggestion}</strong>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseSuggestion}
                      className="ml-auto h-7 border-amber-600 text-amber-700 hover:bg-amber-200 bg-transparent"
                    >
                      Usar sugestao
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium text-foreground">
              Tom de Voz
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger
                id="tone"
                className="h-12 bg-background border-input text-foreground hover:border-primary/50 transition-colors text-base"
              >
                <SelectValue placeholder="Selecione o tom de voz" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!isFormValid || isLoading}
            className="h-14 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando Roteiro Estratégico...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Criar roteiro estratégico
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}