import type { ListWithStats } from '../../types'

interface Props {
  list: ListWithStats
  onSelect: () => void
  onPin: () => void
  onDelete: () => void
}

export function ListRow({ list, onSelect, onPin, onDelete }: Props) {
  const pct = Math.round(list.progress * 100)

  return (
    <div className="list-row" onClick={onSelect}>
      <div className="list-row-header">
        <div className="list-row-title">
          {list.isPinned && <span className="pin">📌</span>}
          <span className="list-name">{list.name}</span>
          {list.source === 'claude' && <span className="badge badge-claude">Claude</span>}
        </div>
        <div className="list-row-actions" onClick={e => e.stopPropagation()}>
          <button className="icon-btn-sm" onClick={onPin} title={list.isPinned ? 'Unpin' : 'Pin'}>
            {list.isPinned ? '📍' : '📌'}
          </button>
          <button className="icon-btn-sm danger" onClick={onDelete} title="Delete">🗑</button>
        </div>
      </div>

      {list.tripDate && (
        <div className="list-date">📅 {new Date(list.tripDate).toLocaleDateString()}</div>
      )}

      <div className="progress-row">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6' }}
          />
        </div>
        <span className="progress-text">{list.packedCount}/{list.totalCount}</span>
      </div>
    </div>
  )
}
