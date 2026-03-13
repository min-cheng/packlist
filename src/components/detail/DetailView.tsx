import { useState } from 'react'
import { db } from '../../db'
import { useList, useItems, useCategories } from '../../hooks/useList'
import { ItemEditRow } from './ItemEditRow'
import type { PackingCategory } from '../../types'

interface Props {
  listId: number
  onBack: () => void
  onPack: () => void
}

const COLORS = ['#4A90E2', '#E2844A', '#4AE290', '#E24A6E', '#9B4AE2', '#E2D44A']

export function DetailView({ listId, onBack, onPack }: Props) {
  const list = useList(listId)
  const items = useItems(listId)
  const categories = useCategories(listId)
  const [newItemTexts, setNewItemTexts] = useState<Record<string | 'general', string>>({})
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  if (!list || !items || !categories) return <div className="loading">Loading…</div>

  async function addItem(categoryId?: number) {
    const key = categoryId ?? 'general'
    const text = (newItemTexts[key] ?? '').trim()
    if (!text) return
    const sortOrder = items!.filter(i => i.categoryId === categoryId).length
    await db.items.add({
      listId,
      categoryId,
      text,
      isPacked: false,
      sortOrder,
      addedAt: new Date(),
    })
    await db.lists.update(listId, { updatedAt: new Date() })
    setNewItemTexts(prev => ({ ...prev, [key]: '' }))
  }

  async function addCategory() {
    const names = ['Documents', 'Clothing', 'Toiletries', 'Electronics', 'Misc', 'Other']
    const existing = new Set(categories!.map(c => c.name))
    const name = names.find(n => !existing.has(n)) ?? `Category ${categories!.length + 1}`
    await db.categories.add({
      listId,
      name,
      colorHex: COLORS[categories!.length % COLORS.length],
      sortOrder: categories!.length,
    })
  }

  async function saveName() {
    const name = nameValue.trim()
    if (name) await db.lists.update(listId, { name, updatedAt: new Date() })
    setEditingName(false)
  }

  const groupedCategories: (PackingCategory | null)[] = [...categories, null]

  return (
    <div className="view">
      <header className="top-bar">
        <button className="icon-btn" onClick={onBack}>←</button>
        {editingName ? (
          <input
            autoFocus
            className="title-input"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
          />
        ) : (
          <h1 onClick={() => { setNameValue(list.name); setEditingName(true) }}>{list.name}</h1>
        )}
        <button className="btn-primary" onClick={onPack}>Pack</button>
      </header>

      <div className="list-scroll">
        {groupedCategories.map(cat => {
          const catItems = [...items]
            .filter(i => (cat ? i.categoryId === cat.id : !i.categoryId))
            .sort((a, b) => a.sortOrder - b.sortOrder)
          const key = cat?.id ?? 'general'

          return (
            <div key={key} className="category-group">
              <div className="category-header editable">
                {cat && <span className="cat-dot" style={{ background: cat.colorHex }} />}
                <span>{cat?.name ?? 'General'}</span>
              </div>
              {catItems.map(item => (
                <ItemEditRow
                  key={item.id}
                  item={item}
                  onSave={(text) => db.items.update(item.id!, { text })}
                  onDelete={() => db.items.delete(item.id!)}
                />
              ))}
              <div className="add-item-row">
                <input
                  placeholder="Add item…"
                  value={newItemTexts[key] ?? ''}
                  onChange={e => setNewItemTexts(prev => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addItem(cat?.id)}
                />
                <button onClick={() => addItem(cat?.id)}>+</button>
              </div>
            </div>
          )
        })}

        <button className="btn-ghost add-category-btn" onClick={addCategory}>
          + Add Category
        </button>
      </div>
    </div>
  )
}
