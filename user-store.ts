"use client"

// Per-user localStorage store for Studio Dentista
// Each email gets its own data namespace

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

const KEY_PREFIX = "studio_dentista"

function userKey(email: string, section: string): string {
  return `${KEY_PREFIX}:${email}:${section}`
}

// Library
export function getLibrary(email: string): SavedItem[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(userKey(email, "library"))
  return raw ? JSON.parse(raw) : []
}

export function saveToLibrary(email: string, item: SavedItem): void {
  const library = getLibrary(email)
  library.unshift(item)
  localStorage.setItem(userKey(email, "library"), JSON.stringify(library))
}

export function removeFromLibrary(email: string, id: string): void {
  const library = getLibrary(email).filter((item) => item.id !== id)
  localStorage.setItem(userKey(email, "library"), JSON.stringify(library))
}

// Settings
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

// Clear all user data
export function clearAllUserData(email: string): void {
  const keys = [
    userKey(email, "library"),
    userKey(email, "settings"),
    userKey(email, "calendar"),
    userKey(email, "subscriber"),
    `${KEY_PREFIX}:${email}:name`,
  ]
  for (const key of keys) {
    localStorage.removeItem(key)
  }
}

export function getSettings(email: string): UserSettings {
  if (typeof window === "undefined") return defaultSettings
  const raw = localStorage.getItem(userKey(email, "settings"))
  return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
}

export function saveSettings(email: string, settings: UserSettings): void {
  localStorage.setItem(userKey(email, "settings"), JSON.stringify(settings))
}

// Calendar Posts
export function getCalendarPosts(email: string): CalendarPost[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(userKey(email, "calendar"))
  if (!raw) return []
  const parsed = JSON.parse(raw) as CalendarPost[]
  // Migrate old posts without 'source' field
  return parsed.map((p) => ({ ...p, source: p.source || "manual" }))
}

export function saveCalendarPosts(email: string, posts: CalendarPost[]): void {
  localStorage.setItem(userKey(email, "calendar"), JSON.stringify(posts))
}

// Subscriber Profile
export interface SubscriberProfile {
  email: string
  name: string
  isSubscriber: boolean
  lastCheckedAt?: string
}

export function getSubscriberProfile(email: string): SubscriberProfile | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(userKey(email, "subscriber"))
  return raw ? JSON.parse(raw) : null
}

export function saveSubscriberProfile(email: string, profile: SubscriberProfile): void {
  localStorage.setItem(userKey(email, "subscriber"), JSON.stringify(profile))
}

// Session
export function getSession(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(`${KEY_PREFIX}:session`)
  return raw ? JSON.parse(raw) : null
}

export function setSession(email: string, name: string): void {
  localStorage.setItem(`${KEY_PREFIX}:session`, JSON.stringify({ email, name }))
  localStorage.setItem(`${KEY_PREFIX}:${email}:name`, name)
}

export function getStoredName(email: string): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(`${KEY_PREFIX}:${email}:name`) || ""
}

export function clearSession(): void {
  localStorage.removeItem(`${KEY_PREFIX}:session`)
}
