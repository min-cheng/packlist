import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useAllLists() {
  return useLiveQuery(async () => {
    const lists = await db.lists.orderBy('updatedAt').reverse().toArray()
    const withStats = await Promise.all(lists.map(async list => {
      const items = await db.items.where('listId').equals(list.id!).toArray()
      const packed = items.filter(i => i.isPacked).length
      return { ...list, packedCount: packed, totalCount: items.length, progress: items.length ? packed / items.length : 0 }
    }))
    // Pinned first
    return withStats.sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
  }, [])
}

export function useList(listId: number) {
  return useLiveQuery(() => db.lists.get(listId), [listId])
}

export function useItems(listId: number) {
  return useLiveQuery(
    () => db.items.where('listId').equals(listId).sortBy('sortOrder'),
    [listId]
  )
}

export function useCategories(listId: number) {
  return useLiveQuery(
    () => db.categories.where('listId').equals(listId).sortBy('sortOrder'),
    [listId]
  )
}
