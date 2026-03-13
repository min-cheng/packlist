import { useItems, useCategories, useList } from '../../hooks/useList'
import { useWakeLock } from '../../hooks/useWakeLock'
import { db } from '../../db'
import { PackingItemRow } from './PackingItemRow'
import { ProgressRing } from './ProgressRing'
import type { PackingItem, PackingCategory } from '../../types'

interface Props {
  listId: number
  onBack: () => void
  onEdit: () => void
}

export function PackingView({ listId, onBack, onEdit }: Props) {
  const list = useList(listId)
  const items = useItems(listId)
  const categories = useCategories(listId)
  const { isActive: packMode, toggle: togglePackMode } = useWakeLock()

  if (!list || !items || !categories) return <div className="loading">Loading…</div>

  const packed = items.filter(i => i.isPacked).length
  const total = items.length
  const progress = total ? packed / total : 0

  const grouped = groupItems(items, categories)

  async function toggleItem(item: PackingItem) {
    const now = !item.isPacked ? new Date() : undefined
    await db.items.update(item.id!, { isPacked: !item.isPacked, packedAt: now })
    await db.lists.update(listId, { updatedAt: new Date() })
  }

  async function resetAll() {
    if (!confirm(`Reset all ${total} items?`)) return
    await db.items.where('listId').equals(listId).modify({ isPacked: false, packedAt: undefined })
    await db.lists.update(listId, { updatedAt: new Date() })
  }

  return (
    <div className="view">
      {packMode && (
        <div className="pack-banner">🌙 Screen will stay on</div>
      )}
      <header className="top-bar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1>{list.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={onEdit} title="Edit">✏️</button>
          <button
            className={`pack-mode-btn ${packMode ? 'active' : ''}`}
            onClick={togglePackMode}
            title={packMode ? 'Disable pack mode' : 'Enable pack mode'}
          >
            {packMode ? '🌙' : '🌙'}
            <span>{packMode ? 'On' : 'Off'}</span>
          </button>
        </div>
      </header>

      <div className="packing-progress">
        <ProgressRing progress={progress} size={80} />
        <p className="progress-label">{packed} of {total} packed</p>
      </div>

      <div className="list-scroll">
        {grouped.map(({ category, items: groupItems }) => (
          <div key={category?.id ?? 'general'} className="category-group">
            <div className="category-header">
              {category && (
                <span className="cat-dot" style={{ background: category.colorHex }} />
              )}
              <span>{category?.name ?? 'General'}</span>
            </div>
            {groupItems.map(item => (
              <PackingItemRow key={item.id} item={item} onToggle={() => toggleItem(item)} />
            ))}
          </div>
        ))}
      </div>

      <div className="bottom-bar">
        <button className="btn-ghost" onClick={resetAll}>Reset All</button>
      </div>
    </div>
  )
}

function groupItems(items: PackingItem[], categories: PackingCategory[]) {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
  const grouped: { category: PackingCategory | null; items: PackingItem[] }[] = []
  const seen = new Set<number | undefined>()

  // Maintain category order
  for (const cat of [...categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const catItems = sorted.filter(i => i.categoryId === cat.id)
    if (catItems.length) {
      grouped.push({ category: cat, items: catItems })
      seen.add(cat.id)
    }
  }

  const uncategorized = sorted.filter(i => !i.categoryId)
  if (uncategorized.length) grouped.push({ category: null, items: uncategorized })

  return grouped
}
