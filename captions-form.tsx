"use client"

import React, { useState } from "react"
import { Instagram, Loader2, Copy, Check, RefreshCw, ChevronsUpDown, BookmarkPlus, BookmarkCheck, Sparkles } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  { value: "motivational", label: "Inspirador" },
  { value: "casual", label: "Descontraido" },
]

async function fetchCaptionFromAPI(data: { theme: string; specialty: string; tone: string }): Promise<{ caption: string; hashtags: string }> {
  const response = await fetch("/api/generate-caption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Erro ao gerar legenda")
  }

  return response.json()
}

interface CaptionsFormProps {
  onSaveToLibrary?: (data: { specialty: string; theme: string; tone: string; content: string }) => void
}

export function CaptionsForm({ onSaveToLibrary }: CaptionsFormProps) {
  const [specialty, setSpecialty] = useState("")
  const [specialtyOpen, setSpecialtyOpen] = useState(false)
  const [theme, setTheme] = useState("")
  const [tone, setTone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ caption: string; hashtags: string } | null>(null)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  const [savedToLib, setSavedToLib] = useState(false)

  // Função auxiliar para garantir que as hashtags tenham "#"
  const formatHashtags = (tagsString: string) => {
    if (!tagsString) return "";
    return tagsString
      .split(/[\s,]+/) // Separa por espaços ou vírgulas
      .filter(tag => tag.length > 0) // Remove vazios
      .map(tag => tag.startsWith("#") ? tag : `#${tag}`) // Adiciona # se não tiver
      .join(" "); // Junta com espaço
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (specialty && theme && tone) {
      setIsLoading(true)
      setSavedToLib(false)
      try {
        const generated = await fetchCaptionFromAPI({ theme, specialty, tone })

        // Aplica a formatação nas hashtags antes de salvar no estado
        const formattedHashtags = formatHashtags(generated.hashtags);

        setResult({
          caption: generated.caption,
          hashtags: formattedHashtags
        })

        if (onSaveToLibrary) {
          onSaveToLibrary({
            specialty,
            theme,
            tone,
            content: generated.caption + "\n\n" + formattedHashtags,
          })
        }
      } catch {
        setResult({
          caption: "Erro ao gerar legenda. Verifique sua conexao e tente novamente.",
          hashtags: "",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCopyCaption = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.caption)
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    }
  }

  const handleCopyHashtags = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.hashtags)
      setCopiedHashtags(true)
      setTimeout(() => setCopiedHashtags(false), 2000)
    }
  }

  const handleSave = () => {
    if (result && onSaveToLibrary) {
      onSaveToLibrary({
        specialty,
        theme,
        tone,
        content: result.caption + "\n\n" + result.hashtags,
      })
      setSavedToLib(true)
      setTimeout(() => setSavedToLib(false), 3000)
    }
  }

  const handleReset = () => {
    setResult(null)
    setSavedToLib(false)
  }

  const isFormValid = specialty && theme && tone

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <Card className="border-border/50 bg-card shadow-sm pt-6">
        {/* Título repetido foi removido daqui! */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Specialty Combobox */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Sua especialidade</Label>
              <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={specialtyOpen}
                    className="h-11 w-full justify-between bg-background border-input text-foreground hover:border-primary/50 transition-colors font-normal"
                  >
                    {specialty || "Selecionar especialidade..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar especialidade..." />
                    <CommandList>
                      <CommandEmpty>Não encontrado.</CommandEmpty>
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

            <div className="space-y-2">
              <Label htmlFor="caption-theme" className="text-foreground">Qual o tema do post?</Label>
              <Input
                id="caption-theme"
                placeholder="Ex: Importância da Periodontia"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-tone" className="text-foreground">Tom de Voz</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="caption-tone" className="h-11 bg-background border-input text-foreground">
                  <SelectValue placeholder="Selecione o tom desejado" />
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

            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isLoading}
              className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando sua estratégia...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Criar legenda estratégica
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-xl text-foreground italic">
              Legenda estratégica construída!
            </CardTitle>
            {result && (
              <div className="flex gap-2">
                {onSaveToLibrary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={savedToLib}
                    className={savedToLib
                      ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-50"
                      : "border-primary text-primary hover:bg-primary/10 bg-transparent"
                    }
                  >
                    {savedToLib ? (
                      <>
                        <BookmarkCheck className="mr-1 h-4 w-4" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="mr-1 h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Novo ângulo
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Copy da Legenda</Label>
                  <Button variant="ghost" size="sm" onClick={handleCopyCaption} className="h-8 text-xs">
                    {copiedCaption ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copiar texto
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={result.caption}
                  readOnly
                  className="min-h-[250px] bg-muted/30 border-border text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground italic">Hashtags selecionadas</Label>
                  <Button variant="ghost" size="sm" onClick={handleCopyHashtags} className="h-8 text-xs">
                    {copiedHashtags ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copiar tags
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={result.hashtags}
                  readOnly
                  className="min-h-[80px] bg-muted/30 border-border text-primary font-medium resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs font-medium">
                Sua legenda estratégica aparecerá aqui em instantes após o preenchimento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}