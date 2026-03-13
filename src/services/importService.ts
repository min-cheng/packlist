import { db } from '../db'
import type { PackingListPayload, PackingList, PackingCategory, PackingItem } from '../types'

export function parseURL(search: string): PackingListPayload | null {
  const params = new URLSearchParams(search)
  const raw = params.get('payload')
  if (!raw) return null
  try {
    const json = atob(raw.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as PackingListPayload
  } catch {
    return null
  }
}

export function parseText(text: string): PackingListPayload | null {
  // Try JSON first
  try {
    const parsed = JSON.parse(text)
    if (parsed.items) return parsed as PackingListPayload
  } catch { /* fall through */ }

  // Parse markdown checklist
  const lines = text.split('\n')
  let name = 'Imported List'
  let currentCategory: string | undefined
  const items: PackingListPayload['items'] = []

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('# ')) { name = t.slice(2); continue }
    if (t.startsWith('## ')) { currentCategory = t.slice(3); continue }
    const checked = t.startsWith('[x] ') || t.startsWith('[X] ')
    const unchecked = t.startsWith('[ ] ')
    const bullet = t.startsWith('- ')
    if (checked || unchecked || bullet) {
      const itemText = t.replace(/^\[.\] /, '').replace(/^- /, '').trim()
      if (itemText) items.push({ text: itemText, category: currentCategory, packed: checked })
    }
  }

  if (!items.length) return null
  return { schema: '1', name, source: 'imported', items }
}

export async function insertPayload(payload: PackingListPayload): Promise<number> {
  const now = new Date()

  const listId = await db.lists.add({
    name: payload.name,
    createdAt: now,
    updatedAt: now,
    tripDate: payload.tripDate ? new Date(payload.tripDate) : undefined,
    source: (payload.source as PackingList['source']) ?? 'claude',
    isPinned: false,
  })

  // Build categories
  const catNames = [...new Set(payload.items.map(i => i.category).filter(Boolean))] as string[]
  const colors = ['#4A90E2', '#E2844A', '#4AE290', '#E24A6E', '#9B4AE2', '#E2D44A']
  const categoryMap: Record<string, number> = {}

  for (let i = 0; i < catNames.length; i++) {
    const catId = await db.categories.add({
      listId,
      name: catNames[i],
      colorHex: colors[i % colors.length],
      sortOrder: i,
    } as PackingCategory)
    categoryMap[catNames[i]] = catId as number
  }

  // Insert items
  for (let i = 0; i < payload.items.length; i++) {
    const p = payload.items[i]
    await db.items.add({
      listId,
      categoryId: p.category ? categoryMap[p.category] : undefined,
      text: p.text,
      isPacked: p.packed ?? false,
      sortOrder: i,
      addedAt: now,
    } as PackingItem)
  }

  return listId as number
}
