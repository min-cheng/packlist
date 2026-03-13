import Dexie, { type EntityTable } from 'dexie'
import type { PackingList, PackingCategory, PackingItem } from '../types'

class PackListDB extends Dexie {
  lists!: EntityTable<PackingList, 'id'>
  categories!: EntityTable<PackingCategory, 'id'>
  items!: EntityTable<PackingItem, 'id'>

  constructor() {
    super('PackListDB')
    this.version(1).stores({
      lists: '++id, updatedAt, isPinned',
      categories: '++id, listId, sortOrder',
      items: '++id, listId, categoryId, sortOrder, isPacked',
    })
  }
}

export const db = new PackListDB()
