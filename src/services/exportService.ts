import type { PackingList, PackingItem, PackingCategory, PackingListPayload } from '../types'

export function toPlainText(
  list: PackingList,
  items: PackingItem[],
  categories: PackingCategory[]
): string {
  const lines = [`# ${list.name}`]
  if (list.tripDate) {
    lines.push(`Trip: ${new Date(list.tripDate).toLocaleDateString()}`)
  }
  lines.push('')

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const grouped: Record<string, PackingItem[]> = {}
  for (const item of [...items].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const key = item.categoryId ? (catMap[item.categoryId]?.name ?? 'General') : 'General'
    ;(grouped[key] ??= []).push(item)
  }

  for (const [key, groupItems] of Object.entries(grouped)) {
    lines.push(`## ${key}`)
    for (const item of groupItems) {
      lines.push(`${item.isPacked ? '[x]' : '[ ]'} ${item.text}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function toPayload(
  list: PackingList,
  items: PackingItem[],
  categories: PackingCategory[]
): PackingListPayload {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))
  return {
    schema: '1',
    name: list.name,
    source: list.source,
    tripDate: list.tripDate ? new Date(list.tripDate).toISOString() : undefined,
    items: [...items]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        id: String(item.id),
        text: item.text,
        category: item.categoryId ? catMap[item.categoryId] : undefined,
        packed: item.isPacked,
      })),
  }
}
