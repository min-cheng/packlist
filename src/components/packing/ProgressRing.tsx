interface Props {
  progress: number
  size?: number
}

export function ProgressRing({ progress, size = 80 }: Props) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  const color = progress === 1 ? '#22c55e' : '#3b82f6'

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#333" strokeWidth={8} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
      <text
        x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size/2}px ${size/2}px`, fill: '#fff', fontSize: 14, fontWeight: 600 }}
      >
        {Math.round(progress * 100)}%
      </text>
    </svg>
  )
}
