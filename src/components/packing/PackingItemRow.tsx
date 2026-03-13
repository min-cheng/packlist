import type { PackingItem } from '../../types'

interface Props {
  item: PackingItem
  onToggle: () => void
}

export function PackingItemRow({ item, onToggle }: Props) {
  return (
    <button className={`packing-item ${item.isPacked ? 'packed' : ''}`} onClick={onToggle}>
      <span className={`checkbox ${item.isPacked ? 'checked' : ''}`}>
        {item.isPacked && '✓'}
      </span>
      <span className="item-text">{item.text}</span>
    </button>
  )
}
