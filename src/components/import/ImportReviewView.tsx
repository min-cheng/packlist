import { useState } from 'react'
import { insertPayload } from '../../services/importService'
import type { PackingListPayload } from '../../types'

interface Props {
  payload: PackingListPayload
  onImported: (listId: number) => void
  onCancel: () => void
}

export function ImportReviewView({ payload, onImported, onCancel }: Props) {
  const [name, setName] = useState(payload.name)

  const grouped: Record<string, string[]> = {}
  for (const item of payload.items) {
    const key = item.category ?? 'General'
    ;(grouped[key] ??= []).push(item.text)
  }

  async function doImport() {
    const modified = { ...payload, name }
    const id = await insertPayload(modified)
    onImported(id)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Import List</h2>

        <label className="field-label">List Name</label>
        <input
          className="field-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="import-preview">
          <p className="preview-count">{payload.items.length} items</p>
          {Object.entries(grouped).map(([cat, catItems]) => (
            <details key={cat} open>
              <summary>{cat} ({catItems.length})</summary>
              <ul>
                {catItems.slice(0, 20).map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
                {catItems.length > 20 && <li>+ {catItems.length - 20} more…</li>}
              </ul>
            </details>
          ))}
        </div>

        {payload.source === 'claude' && (
          <p className="claude-badge">✨ Sent from Claude</p>
        )}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={doImport}>Add to PackList</button>
        </div>
      </div>
    </div>
  )
}
