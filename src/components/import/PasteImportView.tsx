import { useState } from 'react'
import { parseText } from '../../services/importService'
import type { PackingListPayload } from '../../types'

interface Props {
  onParsed: (payload: PackingListPayload) => void
  onCancel: () => void
}

const PLACEHOLDER = `# Japan Trip

## Documents
- Passport
- Travel insurance

## Clothing
- T-shirts x5
- Rain jacket

## Electronics
- Charger
- Headphones`

export function PasteImportView({ onParsed, onCancel }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  function handleImport() {
    const payload = parseText(text.trim())
    if (!payload) {
      setError('Could not parse a list from this text. Make sure it has at least a few items (lines starting with - or [ ]).')
      return
    }
    onParsed({ ...payload, source: 'claude' })
  }

  return (
    <div className="modal-overlay">
      <div className="modal paste-modal">
        <h2>Paste from Claude</h2>
        <p className="paste-hint">
          Ask Claude: <em>"Give me a packing list for…"</em> then copy and paste the response here.
        </p>
        <textarea
          className="paste-textarea"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          autoFocus
        />
        {error && <p className="paste-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleImport} disabled={!text.trim()}>
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
