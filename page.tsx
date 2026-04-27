'use client'

import { useState } from "react"
import { Menu, Loader2, Trash2, Instagram } from "lucide-react"

// 1. Auth e Login
import { useAuth } from "@/lib/auth-context"
import { LoginScreen } from "@/components/dashboard/login-screen"

// 2. Componentes
import { Sidebar } from "@/components/dashboard/sidebar"
import { ScriptForm } from "@/components/dashboard/script-form"
import { ScriptResult } from "@/components/dashboard/script-result"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { LibraryView } from "@/components/dashboard/library-view"
import { CaptionsForm } from "@/components/dashboard/captions-form"
import { Calendar30Days } from "@/components/dashboard/calendar-30days"
import { SettingsView } from "@/components/dashboard/settings-view"

// 3. Hooks e Supabase
import { supabase } from "@/lib/supabase"
import { type SavedItem, type CalendarPost } from "@/lib/supabase-store"
import { useSettings, useLibrary, useCalendar } from "@/hooks/use-supabase-data"

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()

  const [activeMenuItem, setActiveMenuItem] = useState("scripts")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [lastScriptMeta, setLastScriptMeta] = useState<{
    specialty: string
    theme: string
    tone: string
    objective: string
  } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hooks do Supabase
  const { settings } = useSettings(user?.email || null)
  const library = useLibrary(user?.email || null)
  const calendar = useCalendar(user?.email || null)

  const scriptFormDefaults = settings
    ? {
      specialty: settings.specialty || undefined,
      tone: settings.defaultTone || undefined,
      objective: settings.defaultObjective || undefined,
      scriptMode: settings.defaultScriptMode || undefined,
    }
    : {}

  // --- FUNÇÃO AUXILIAR PARA GERAR UUID VÁLIDO ---
  function createUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const handleLogout = async () => {
    await signOut()
    setActiveMenuItem("scripts")
    setGeneratedScript(null)
    setLastScriptMeta(null)
  }

  const handleGenerate = async (data: {
    specialty: string
    theme: string
    correctedTheme: string
    tone: string
    objective: string
    scriptMode: "complete" | "simple"
  }) => {
    setIsLoading(true)
    try {
      if (user) {
        await supabase.from('preferences').upsert({
          user_id: user.id,
          default_specialty: data.specialty,
          default_tone: data.tone,
          default_objective: data.objective,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      }

      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Erro ao gerar roteiro")

      const result = await response.json()
      const script = result.script
      setGeneratedScript(script)
      setLastScriptMeta({
        specialty: data.specialty,
        theme: data.correctedTheme || data.theme,
        tone: data.tone,
        objective: data.objective,
      })

      if (user) {
        const item: SavedItem = {
          id: createUUID(),
          type: "roteiro",
          title: data.correctedTheme || data.theme,
          specialty: data.specialty,
          tone: data.tone,
          objective: data.objective,
          content: script,
          preview: script.slice(0, 150) + "...",
          createdAt: new Date().toISOString(),
        }
        await library.add(item)
      }
    } catch {
      setGeneratedScript("Erro ao gerar roteiro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!lastScriptMeta) return
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: lastScriptMeta.specialty,
          theme: lastScriptMeta.theme,
          correctedTheme: lastScriptMeta.theme,
          tone: lastScriptMeta.tone,
          objective: lastScriptMeta.objective,
          scriptMode: "complete",
          regenerate: true,
        }),
      })
      if (!response.ok) throw new Error("Erro ao regenerar roteiro")
      const result = await response.json()
      setGeneratedScript(result.script)
    } catch {
      setGeneratedScript("Erro ao regenerar roteiro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveScript = async () => {
    if (!generatedScript || !user || !lastScriptMeta) return
    const item: SavedItem = {
      id: createUUID(),
      type: "roteiro",
      title: lastScriptMeta.theme,
      specialty: lastScriptMeta.specialty,
      tone: lastScriptMeta.tone,
      objective: lastScriptMeta.objective,
      content: generatedScript,
      preview: generatedScript.slice(0, 150) + "...",
      createdAt: new Date().toISOString(),
    }
    await library.add(item)
  }

  const handleSaveCaption = async (data: {
    specialty: string
    theme: string
    tone: string
    content: string
  }) => {
    if (!user) return
    const item: SavedItem = {
      id: createUUID(),
      type: "legenda",
      title: data.theme,
      specialty: data.specialty,
      tone: data.tone,
      content: data.content,
      preview: data.content.slice(0, 150) + "...",
      createdAt: new Date().toISOString(),
    }
    await library.add(item)
  }

  const handleSaveCalendarToLibrary = async (calendarItems: any[]) => {
    if (!user) return
    const fullContent = calendarItems
      .map(item => `Dia ${item.day}: ${item.theme} | Formato: ${item.format}`)
      .join("\n")

    const saved: SavedItem = {
      id: createUUID(),
      type: "calendario30",
      title: "Calendário 30 Dias",
      specialty: "",
      tone: "",
      content: fullContent,
      preview: fullContent.slice(0, 200) + "...",
      createdAt: new Date().toISOString(),
    }
    await library.add(saved)
  }

  const handlePushToCalendar = async (items: any[]) => {
    if (!user?.email) {
      alert("Erro: Usuário não identificado. Faça login novamente.")
      return
    }

    setIsLoading(true)

    try {
      const now = new Date()
      const targetMonth = now.getMonth()
      const targetYear = now.getFullYear()

      const formatMap: Record<string, CalendarPost["type"]> = {
        video: "video", carrossel: "carrossel", reels: "reels",
        story: "story", foto: "carrossel", foto_estatica: "carrossel"
      }

      const newPosts = items.map((item) => {
        let safeDay = parseInt(String(item.day), 10)
        if (isNaN(safeDay)) safeDay = 1

        return {
          id: createUUID(),
          user_email: user.email,
          date: safeDay,
          month: targetMonth,
          year: targetYear,
          theme: String(item.theme || "Sem tema").substring(0, 200),
          type: formatMap[item.format?.toLowerCase().trim()] || "video",
          status: "rascunho",
          source: "ai",
          time: "10:00",
          notes: String(item.objective || "").substring(0, 500),
        }
      })

      await calendar.bulkInsert(newPosts as any)
      setActiveMenuItem("calendar")

    } catch (error: any) {
      console.error("Erro detalhado:", JSON.stringify(error, null, 2))
      alert(`Erro ao salvar. Verifique o console.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCalendar = async () => {
    if (!user?.email) return
    if (!confirm("Tem certeza que deseja apagar TODOS os posts do seu calendário? Essa ação não pode ser desfeita.")) {
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('calendar')
        .delete()
        .eq('user_email', user.email)

      if (error) throw error
      alert("Calendário limpo com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Erro ao limpar:", error)
      alert("Erro ao limpar calendário.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setGeneratedScript(null)
    setLastScriptMeta(null)
  }

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!user) return <LoginScreen />

  // --- ALTERAÇÕES DE TÍTULO E TAGLINE EXECUTADAS AQUI ---
  const pageConfig: Record<string, { title: string; description: string }> = {
    scripts: {
      title: "Gerador de Scripts",
      description: "Seu estrategista de conteudo com IA - roteiros de alta retencao"
    },
    captions: {
      title: "Legendas Estrategicas",
      description: "Do gancho ao CTA: legendas prontas para sua especialidade em um clique"
    },
    calendar: { title: "Calendario", description: "Organize, edite e visualize seus posts do mes" },
    calendar30: { title: "Planejamento 30 Dias", description: "Gere sugestoes de conteudo por IA e envie ao Calendario" },
    library: { title: "Minha Biblioteca", description: "Acesse, edite e organize todos os seus roteiros e legendas salvos" },
    settings: { title: "Configuracoes", description: "Configure seu perfil e preferencias da clinica" },
  }

  const currentPage = pageConfig[activeMenuItem] || pageConfig.scripts

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={setActiveMenuItem}
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Doutor(a)"}
        userEmail={user?.email || ""}
        onLogout={handleLogout}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-foreground hover:bg-accent lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl truncate">
                {currentPage.title}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                {currentPage.description}
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {activeMenuItem === "scripts" && (
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <ScriptForm onGenerate={handleGenerate} isLoading={isLoading} defaults={scriptFormDefaults} />
                <ScriptResult script={generatedScript} onSave={handleSaveScript} onRegenerate={handleRegenerate} isLoading={isLoading} />
            </div>
          )}
          {activeMenuItem === "captions" && <CaptionsForm onSaveToLibrary={handleSaveCaption} />}

          {activeMenuItem === "calendar" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleClearCalendar}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Limpar calendário inteiro
                </button>
              </div>
              <CalendarView userEmail={user?.email || ""} />
            </div>
          )}

          {activeMenuItem === "calendar30" && (
            <Calendar30Days onSaveToLibrary={handleSaveCalendarToLibrary} onPushToCalendar={handlePushToCalendar} />
          )}
          {activeMenuItem === "library" && <LibraryView userEmail={user?.email || ""} />}
          {activeMenuItem === "settings" && <SettingsView userEmail={user?.email || ""} />}
        </div>

        <footer className="border-t border-border px-4 py-3 sm:px-8">
          <div className="flex items-center justify-end gap-3">
            <p className="text-xs text-muted-foreground">
              {"Powered by "}
              <a
                href="https://bybmidia.digital/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                BYB Midia Digital
              </a>
            </p>
            <a
              href="https://www.instagram.com/bybmidia/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Instagram da BYB Midia"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}