import { supabase } from "./supabase"

// ─── Types ────────────────────────────────────────────────────────

export interface SavedItem {
  id: string
  type: "roteiro" | "legenda" | "calendario30"
  title: string
  specialty: string
  tone: string
  objective?: string
  content: string
  preview: string
  createdAt: string
  color_tag?: string
}

export interface UserSettings {
  clinicName: string
  specialty: string
  defaultTone: string
  defaultObjective: string
  defaultScriptMode: "complete" | "simple"
  dentistName: string
  cro: string
  bio: string
  instagram: string
}

export interface CalendarPost {
  id: string
  date: number
  month: number
  year: number
  theme: string
  type: "video" | "carrossel" | "reels" | "story"
  status: "rascunho" | "agendado" | "publicado"
  source: "manual" | "ai"
  time?: string
  notes?: string
}

export interface SubscriberProfile {
  email: string
  name: string
  isSubscriber: boolean
}

const defaultSettings: UserSettings = {
  clinicName: "",
  specialty: "",
  defaultTone: "",
  defaultObjective: "",
  defaultScriptMode: "complete",
  dentistName: "",
  cro: "",
  bio: "",
  instagram: "",
}

// ─── Helper: Get current user ID (Real Auth) ─────────────────────

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id || null
  } catch (err) {
    console.error("[supabase-store] getCurrentUserId error:", err)
    return null
  }
}

// ─── Profiles ────────────────────────────────────────────────────

export async function upsertProfile(email: string, name: string): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) return

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: userId,
      dentist_name: name || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) {
    console.error("[supabase-store] upsertProfile error:", error)
  }
}

export async function getProfile(email?: string): Promise<SubscriberProfile | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  try {
    const { data } = await supabase
      .from("preferences")
      .select("dentist_name")
      .eq("user_id", userId)
      .single()

    const user = (await supabase.auth.getUser())?.data?.user
    const userEmail = user?.email || email || ""

    return {
      email: userEmail,
      name: data?.dentist_name || userEmail.split("@")[0] || "Doutor(a)",
      isSubscriber: true,
    }
  } catch (err) {
    return null
  }
}

// ─── Settings ─────────────────────────────────────────────────────

export async function getSettingsAsync(email: string): Promise<UserSettings> {
  const userId = await getCurrentUserId()
  if (!userId) return defaultSettings

  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return defaultSettings
  }

  return {
    clinicName: data.clinic_name || "",
    specialty: data.default_specialty || "",
    defaultTone: data.default_tone || "",
    defaultObjective: data.default_objective || "",
    defaultScriptMode: (data.default_script_mode as "complete" | "simple") || "complete",
    dentistName: data.dentist_name || "",
    cro: data.cro || "",
    bio: data.bio || "",
    instagram: data.instagram || "",
  }
}

export async function saveSettingsAsync(email: string, settings: UserSettings): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Usuário não autenticado")

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: userId,
      clinic_name: settings.clinicName,
      default_specialty: settings.specialty,
      default_tone: settings.defaultTone,
      default_objective: settings.defaultObjective,
      default_script_mode: settings.defaultScriptMode,
      dentist_name: settings.dentistName,
      cro: settings.cro,
      bio: settings.bio,
      instagram: settings.instagram,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) throw error
}

// ─── Library (Scripts) ───────────────────────────────────────────

export async function getLibraryAsync(email: string): Promise<SavedItem[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    type: "roteiro" as SavedItem["type"],
    title: row.theme_original,
    specialty: row.specialty || "",
    tone: row.tone || "",
    objective: row.objective || "",
    content: row.script_text,
    preview: row.script_text?.slice(0, 150) + "...",
    createdAt: row.created_at,
    color_tag: row.color_tag || undefined,
  }))
}

export async function addToLibraryAsync(email: string, item: SavedItem): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Usuário não autenticado")

  const row = {
    user_id: userId,
    specialty: item.specialty,
    tone: item.tone,
    objective: item.objective || "",
    script_mode: "complete",
    theme_original: item.title,
    theme_corrected: item.title,
    script_text: item.content,
    created_at: item.createdAt,
  }

  const { error } = await supabase.from("scripts").insert(row)
  if (error) throw error
}

export async function updateInLibraryAsync(email: string, id: string, updates: { content?: string; color_tag?: string }): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Usuario nao autenticado")

  const row: Record<string, string | undefined> = {}
  if (updates.content !== undefined) {
    row.script_text = updates.content
  }
  if (updates.color_tag !== undefined) {
    row.color_tag = updates.color_tag
  }

  const { error } = await supabase.from("scripts").update(row).eq("id", id).eq("user_id", userId)
  if (error) throw error
}

export async function removeFromLibraryAsync(email: string, id: string): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) return

  const { error } = await supabase.from("scripts").delete().eq("id", id).eq("user_id", userId)
  if (error) throw error
}

// ─── Calendar (CORREÇÃO DE FUSO HORÁRIO AQUI) ─────────────────────

export async function getCalendarPostsAsync(email: string): Promise<CalendarPost[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from("calendar_posts")
    .select("*")
    .eq("user_id", userId)
    .order("post_date", { ascending: true })

  if (error || !data) return []

  return data.map((row) => {
    // Adicionamos T12:00:00 para evitar que o fuso mude o dia ao ler
    const dateObj = row.post_date ? new Date(`${row.post_date}T12:00:00`) : new Date()

    return {
      id: row.id,
      date: dateObj.getDate(),
      month: dateObj.getMonth(),
      year: dateObj.getFullYear(),
      theme: row.theme,
      type: (row.content_type || "video") as CalendarPost["type"],
      status: (row.status || "rascunho") as CalendarPost["status"],
      source: (row.source || "manual") as CalendarPost["source"],
      time: row.post_time || "",
      notes: row.notes || "",
    }
  })
}

export async function upsertCalendarPost(email: string, post: CalendarPost): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Usuário não autenticado")

  // FORMATANDO DATA MANUALMENTE: Evita o erro do .toISOString()
  const postDate = `${post.year}-${String(post.month + 1).padStart(2, '0')}-${String(post.date).padStart(2, '0')}`

  const { error } = await supabase.from("calendar_posts").upsert(
    {
      id: post.id,
      user_id: userId,
      post_date: postDate,
      post_time: post.time || null,
      content_type: post.type,
      theme: post.theme,
      notes: post.notes || "",
      status: post.status,
    },
    { onConflict: "id" },
  )

  if (error) throw error
}

export async function deleteCalendarPost(email: string, id: string): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) return

  const { error } = await supabase.from("calendar_posts").delete().eq("id", id).eq("user_id", userId)
  if (error) throw error
}

export async function bulkInsertCalendarPosts(email: string, posts: CalendarPost[]): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId || posts.length === 0) return

  const rows = posts.map((p) => {
    // FORMATANDO DATA MANUALMENTE: Evita o erro do .toISOString()
    const postDate = `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.date).padStart(2, '0')}`
    return {
      id: p.id,
      user_id: userId,
      post_date: postDate,
      post_time: p.time || null,
      content_type: p.type,
      theme: p.theme,
      notes: p.notes || "",
      status: p.status,
    }
  })

  const { error } = await supabase.from("calendar_posts").insert(rows)
  if (error) throw error
}

// ─── Aliases ──────────────────────────────────────────────────────

export const getSettings = getSettingsAsync
export const saveSettings = saveSettingsAsync
export const getLibrary = getLibraryAsync
export const addToLibrary = addToLibraryAsync
export const updateInLibrary = updateInLibraryAsync
export const removeFromLibrary = removeFromLibraryAsync
export const getCalendarPosts = getCalendarPostsAsync
export const bulkInsertCalendar = bulkInsertCalendarPosts
