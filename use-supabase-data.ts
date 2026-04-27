"use client"

import useSWR, { mutate } from "swr"
import {
  getSettingsAsync,
  getLibraryAsync,
  getCalendarPostsAsync,
  addToLibraryAsync,
  removeFromLibraryAsync,
  updateInLibraryAsync,
  saveSettingsAsync,
  upsertCalendarPost,
  deleteCalendarPost,
  bulkInsertCalendarPosts,
  type UserSettings,
  type SavedItem,
  type CalendarPost,
} from "@/lib/supabase-store"
import { supabase } from "@/lib/supabase" // Importamos o supabase direto aqui

// ─── Settings ─────────────────────────────────────────────────────

export function useSettings(email: string | null) {
  const { data, error, isLoading } = useSWR(
    email ? `settings:${email}` : null,
    () => getSettingsAsync(email!),
  )

  const save = async (settings: UserSettings) => {
    if (!email) return
    await saveSettingsAsync(email, settings)
    await mutate(`settings:${email}`)
  }

  return { settings: data, isLoading, error, save }
}

// ─── Library ──────────────────────────────────────────────────────

export function useLibrary(email: string | null) {
  const { data, error, isLoading } = useSWR(
    email ? `library:${email}` : null,
    () => getLibraryAsync(email!),
  )

  const add = async (item: SavedItem) => {
    if (!email) return
    mutate(`library:${email}`, (current: SavedItem[] | undefined) => [item, ...(current || [])], false)
    await addToLibraryAsync(email, item)
    await mutate(`library:${email}`)
  }

  const update = async (id: string, updates: { content?: string; color_tag?: string }) => {
    if (!email) return
    mutate(
      `library:${email}`,
      (current: SavedItem[] | undefined) =>
        (current || []).map((i) =>
          i.id === id
            ? { ...i, ...updates, preview: updates.content ? updates.content.slice(0, 150) + "..." : i.preview }
            : i
        ),
      false,
    )
    await updateInLibraryAsync(email, id, updates)
    await mutate(`library:${email}`)
  }

  const remove = async (id: string) => {
    if (!email) return
    mutate(`library:${email}`, (current: SavedItem[] | undefined) => (current || []).filter((i) => i.id !== id), false)
    await removeFromLibraryAsync(email, id)
    await mutate(`library:${email}`)
  }

  return { items: data || [], isLoading, error, add, update, remove }
}

// ─── Calendar ─────────────────────────────────────────────────────

export function useCalendar(email: string | null) {
  const { data, error, isLoading } = useSWR(
    email ? `calendar:${email}` : null,
    () => getCalendarPostsAsync(email!),
  )

  const upsert = async (post: CalendarPost) => {
    if (!email) return

    // BLINDAGEM: Garantimos que date, month e year sejam números puros antes de enviar
    const cleanPost = {
      ...post,
      date: Number(post.date),
      month: Number(post.month),
      year: Number(post.year)
    }

    mutate(
      `calendar:${email}`,
      (current: CalendarPost[] | undefined) => {
        const list = current || []
        const exists = list.find((p) => p.id === cleanPost.id)
        if (exists) return list.map((p) => (p.id === cleanPost.id ? cleanPost : p))
        return [...list, cleanPost]
      },
      false,
    )
    await upsertCalendarPost(email, cleanPost)
    await mutate(`calendar:${email}`)
  }

  const remove = async (id: string) => {
    if (!email) return
    mutate(`calendar:${email}`, (current: CalendarPost[] | undefined) => (current || []).filter((p) => p.id !== id), false)
    await deleteCalendarPost(email, id)
    await mutate(`calendar:${email}`)
  }

  const bulkInsert = async (posts: CalendarPost[]) => {
    if (!email) return
    mutate(`calendar:${email}`, (current: CalendarPost[] | undefined) => [...(current || []), ...posts], false)
    await bulkInsertCalendarPosts(email, posts)
    await mutate(`calendar:${email}`)
  }

  const movePost = async (postId: string, targetDay: number, targetMonth: number, targetYear: number) => {
    if (!email) return
    const post = (data || []).find((p) => p.id === postId)
    if (!post) return

    // Usamos Number() para garantir que nada vire "Data" por acidente
    const updated = {
      ...post,
      date: Number(targetDay),
      month: Number(targetMonth),
      year: Number(targetYear)
    }
    await upsert(updated)
  }

  return { posts: data || [], isLoading, error, upsert, remove, bulkInsert, movePost }
}

// ─── FUNÇÃO DE LIMPAR TUDO (Agora funcionando de verdade) ──────────

export async function clearAllCalendarData(email: string) {
  if (!email) return

  // 1. Limpa no Banco de Dados Supabase
  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('user_email', email)

  if (error) throw error

  // 2. Limpa o cache local (SWR) para o calendário sumir na hora
  await mutate(`calendar:${email}`, [], false)
}
