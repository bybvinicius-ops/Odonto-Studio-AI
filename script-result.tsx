"use client"

import { useState } from "react"
import { Copy, Check, FileText, RefreshCw, Download, BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { jsPDF } from "jspdf"

interface ScriptResultProps {
  script: string | null
  onRegenerate?: () => void // Função para buscar novo ângulo
  isLoading?: boolean       // Estado de carregamento
  onSave?: () => void
}

export function ScriptResult({ script, onRegenerate, isLoading, onSave }: ScriptResultProps) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopy = async () => {
    if (script) {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleDownload = () => {
    if (!script) return
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(0, 122, 255)
    doc.text("ROTEIRO ESTRATEGICO - ODONTO STUDIO AI", margin, 20)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 28)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, 32, pageWidth - margin, 32)
    doc.setFontSize(11)
    doc.setTextColor(33, 33, 33)
    const splitText = doc.splitTextToSize(cleanMarkdown(script), pageWidth - (margin * 2))
    doc.text(splitText, margin, 40)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text("Powered by BYB Mídia Digital", margin, pageHeight - 10)
    doc.save(`roteiro-studio-dentista-${Date.now()}.pdf`)
  }

  function cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
  }

  if (!script) {
    return (
      <Card className="flex h-full flex-col border-border/50 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <FileText className="h-6 w-6 text-muted-foreground" />
            Roteiro com inteligência de nicho:
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            O resultado do seu roteiro aparecerá aqui
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              {"Preencha o formulário e clique em \"Criar roteiro estratégico\" para começar"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col border-border/50 bg-card shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            Roteiro com inteligência de nicho:
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Seu roteiro completo para gravação.
          </CardDescription>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="h-10 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-10 border-border text-foreground hover:bg-accent bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
            className="h-10 border-primary text-primary hover:bg-primary/5 bg-transparent col-span-2 sm:col-span-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Mudar angulo
          </Button>

          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saved}
              className={`h-10 col-span-2 sm:col-span-1 ${saved
                ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                : "border-primary text-primary hover:bg-primary/10 bg-transparent"
              }`}
            >
              {saved ? (
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
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden relative">
        {/* Overlay para mostrar que o texto está mudando */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/40 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="h-full overflow-y-auto rounded-xl bg-muted/50 p-4 sm:p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {script}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}