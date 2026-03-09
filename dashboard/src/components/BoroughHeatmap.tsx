import type { BoroughHourRow } from '../types'

interface Props { data: BoroughHourRow[] }

const BOROUGHS = ['BRONX', 'BROOKLYN', 'MANHATTAN', 'QUEENS', 'STATEN ISLAND']
const HOURS    = Array.from({ length: 24 }, (_, i) => i)

function color(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // White -> Kalshi green
  const r = Math.round(255 - t * 255)
  const g = Math.round(255 - t * (255 - 180))
  const b = Math.round(255 - t * 255)
  return `rgb(${r},${g},${b})`
}

export default function BoroughHeatmap({ data }: Props) {
  const lookup: Record<string, Record<number, BoroughHourRow>> = {}
  for (const row of data) {
    if (!lookup[row.borough]) lookup[row.borough] = {}
    lookup[row.borough][row.hour] = row
  }
  const counts  = data.map(d => d.complaints)
  const minC    = Math.min(...counts)
  const maxC    = Math.max(...counts)

  return (
    <div className="hmap-scroll">
      {/* Hour labels */}
      <div style={{ display: 'flex', marginLeft: 106, gap: 3, marginBottom: 5 }}>
        {HOURS.map(h => (
          <div key={h} style={{
            width: 30, textAlign: 'center', fontSize: 9.5,
            color: '#b0afa8', fontFamily: 'Inter', flexShrink: 0, fontWeight: 500,
          }}>
            {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
          </div>
        ))}
      </div>

      {BOROUGHS.map(boro => (
        <div key={boro} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{
            width: 103, fontSize: 10.5, color: '#78776f', fontFamily: 'Inter',
            fontWeight: 600, flexShrink: 0, paddingRight: 8, textAlign: 'right',
            letterSpacing: '.01em',
          }}>
            {boro}
          </div>
          {HOURS.map(h => {
            const row      = lookup[boro]?.[h]
            const count    = row?.complaints ?? 0
            const felony   = row?.felony_rate ?? 0
            const bg       = color(count, minC, maxC)
            const tip      = `${boro} ${h}:00 · ${count.toLocaleString()} complaints · ${(felony * 100).toFixed(1)}% felony`
            return (
              <div key={h} className="hmap-cell"
                style={{ width: 30, background: bg }}
                data-tip={tip} title={tip} />
            )
          })}
        </div>
      ))}

      <div className="hmap-legend" style={{ marginLeft: 106 }}>
        <span>Low</span>
        <div className="hmap-legend-bar"
          style={{ background: 'linear-gradient(to right, #fff, #00d964)' }} />
        <span>High volume</span>
      </div>
    </div>
  )
}
