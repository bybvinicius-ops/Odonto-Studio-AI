// Per-user localStorage utility
// All data is keyed by user email for isolation between accounts

export interface SavedItem {
  id: string
  type: "script" | "caption"
  title: string
  specialty: string
  tone: string
  objective?: string
  content: string
  preview: string
  createdAt: string
}

export interface ClinicSettings {
  clinicName: string
  specialty: string
  defaultTone: string
  dentistName: string
  cro: string
  bio: string
  instagram: string
}

function userKey(email: string, namespace: string): string {
  return `studio_dentista_${email}_${namespace}`
}

// Library (saved scripts and captions)
export function getLibrary(email: string): SavedItem[] {
  try {
    const raw = localStorage.getItem(userKey(email, "library"))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToLibrary(email: string, item: SavedItem): void {
  const library = getLibrary(email)
  library.unshift(item)
  localStorage.setItem(userKey(email, "library"), JSON.stringify(library))
}

export function deleteFromLibrary(email: string, id: string): void {
  const library = getLibrary(email).filter((item) => item.id !== id)
  localStorage.setItem(userKey(email, "library"), JSON.stringify(library))
}

// Clinic Settings
export function getSettings(email: string): ClinicSettings {
  try {
    const raw = localStorage.getItem(userKey(email, "settings"))
    return raw
      ? JSON.parse(raw)
      : {
          clinicName: "",
          specialty: "",
          defaultTone: "friendly",
          dentistName: "",
          cro: "",
          bio: "",
          instagram: "",
        }
  } catch {
    return {
      clinicName: "",
      specialty: "",
      defaultTone: "friendly",
      dentistName: "",
      cro: "",
      bio: "",
      instagram: "",
    }
  }
}

export function saveSettings(email: string, settings: ClinicSettings): void {
  localStorage.setItem(userKey(email, "settings"), JSON.stringify(settings))
}
