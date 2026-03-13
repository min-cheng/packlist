import { useState } from 'react'
import { useAllLists } from '../../hooks/useList'
import { ListRow } from '../home/ListRow'
import { db } from '../../db'
import type { ListWithStats } from '../../types'

interface Props {
  onSelect: (id: number) => void
  onBack: () => void
}

export function HistoryView({ onSelect, onBack }: Props) {
  const lists = useAllLists()
  const [search, setSearch] = useState('')

  const filtered = lists?.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="view">
      <header className="top-bar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1>History</h1>
        <div />
      </header>

      <div className="search-bar">
        <input
          placeholder="Search lists…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="list-scroll">
        {filtered?.map(list => (
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
        {filtered?.length === 0 && (
          <div className="empty-state">No lists found.</div>
        )}
      </div>
    </div>
  )
}
