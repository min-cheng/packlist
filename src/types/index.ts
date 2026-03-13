export interface PackingList {
  id?: number
  name: string
  createdAt: Date
  updatedAt: Date
  tripDate?: Date
  source: 'manual' | 'claude' | 'imported'
  isPinned: boolean
}

export interface PackingCategory {
  id?: number
  listId: number
  name: string
  colorHex: string
  sortOrder: number
}

export interface PackingItem {
  id?: number
  listId: number
  categoryId?: number
  text: string
  isPacked: boolean
  sortOrder: number
  addedAt: Date
  packedAt?: Date
  notes?: string
}

export interface PackingListPayload {
  schema: string
  name: string
  source?: string
  tripDate?: string
  items: PayloadItem[]
}

export interface PayloadItem {
  id?: string
  text: string
  category?: string
  packed?: boolean
}

// Rich view model used in components
export interface ListWithStats extends PackingList {
  packedCount: number
  totalCount: number
  progress: number
}
