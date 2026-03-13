import { useState } from 'react'
import { db } from '../../db'
import { useAllLists } from '../../hooks/useList'
import { ListRow } from './ListRow'
import { PasteImportView } from '../import/PasteImportView'
import { insertPayload } from '../../services/importService'
import type { ListWithStats, PackingListPayload } from '../../types'

interface Props {
  onSelect: (id: number) => void
  onHistory: () => void
}

export function HomeView({ onSelect, onHistory }: Props) {
  const lists = useAllLists()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [pasting, setPasting] = useState(false)

  async function handlePasted(payload: PackingListPayload) {
    setPasting(false)
    const id = await insertPayload(payload)
    onSelect(id)
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const id = await db.lists.add({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'manual',
      isPinned: false,
    })
    setNewName('')
    setCreating(false)
    onSelect(id as number)
  }

  return (
    <div className="view">
      <header className="top-bar">
        <button className="icon-btn" onClick={onHistory} title="History">🕐</button>
        <h1>PackList</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={() => setPasting(true)} title="Paste from Claude">✨</button>
          <button className="icon-btn" onClick={() => setCreating(true)} title="New list">＋</button>
        </div>
      </header>

      {creating && (
        <form className="new-list-form" onSubmit={createList}>
          <input
            autoFocus
            placeholder="List name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setCreating(false)}>Cancel</button>
        </form>
      )}

      <div className="list-scroll">
        {!lists?.length && !creating && (
          <div className="empty-state">
            <div className="empty-icon">🎒</div>
            <p>No packing lists yet.</p>
            <p className="hint">
              Ask Claude for a packing list, then tap ✨ to paste it in.
            </p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPasting(true)}>
              ✨ Paste from Claude
            </button>
          </div>
        )}
        {lists?.map(list => (
          <ListRow
            key={list.id}
            list={list as ListWithStats}
            onSelect={() => onSelect(list.id!)}
            onPin={() => db.lists.update(list.id!, { isPinned: !list.isPinned })}
            onDelete={() => {
              db.items.where('listId').equals(list.id!).delete()
              db.categories.where('listId').equals(list.id!).delete()
              db.lists.delete(list.id!)
            }}
          />
        ))}
      </div>

      {pasting && (
        <PasteImportView
          onParsed={handlePasted}
          onCancel={() => setPasting(false)}
        />
      )}
    </div>
  )
}
