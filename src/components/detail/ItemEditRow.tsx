import { useState } from 'react'
import type { PackingItem } from '../../types'

interface Props {
  item: PackingItem
  onSave: (text: string) => void
  onDelete: () => void
}

export function ItemEditRow({ item, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.text)

  function save() {
    const t = text.trim()
    if (t && t !== item.text) onSave(t)
    setEditing(false)
  }

  return (
    <div className="item-edit-row">
      {item.isPacked && <span className="packed-indicator">✓</span>}
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          className="item-edit-input"
        />
      ) : (
        <span
          className={`item-text ${item.isPacked ? 'packed' : ''}`}
          onDoubleClick={() => { setText(item.text); setEditing(true) }}
        >
          {item.text}
        </span>
      )}
      <div className="item-actions">
        <button className="icon-btn-sm" onClick={() => { setText(item.text); setEditing(true) }}>✏️</button>
        <button className="icon-btn-sm danger" onClick={onDelete}>🗑</button>
      </div>
    </div>
  )
}
