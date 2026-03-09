import type { BoroughHourRow } from '../types'

interface Props {
  data: BoroughHourRow[]
}

const BOROUGHS = ['BRONX', 'BROOKLYN', 'MANHATTAN', 'QUEENS', 'STATEN ISLAND']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function interpolateColor(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // Dark blue -> electric green
  const r = Math.round(0 + t * 0)
  const g = Math.round(20 + t * (230 - 20))
  const b = Math.round(40 + t * (118 - 40))
  return `rgb(${r},${g},${b})`
}

export default function BoroughHeatmap({ data }: Props) {
  // Build lookup: borough -> hour -> row
  const lookup: Record<string, Record<number, BoroughHourRow>> = {}
  for (const row of data) {
    if (!lookup[row.borough]) lookup[row.borough] = {}
    lookup[row.borough][row.hour] = row
  }

  const allCounts = data.map(d => d.complaints)
  const minCount = Math.min(...allCounts)
  const maxCount = Math.max(...allCounts)

  return (
    <div className="heatmap-container">
      {/* Hour labels */}
      <div style={{ display: 'flex', marginLeft: 102, gap: 2, marginBottom: 4 }}>
        {HOURS.map(h => (
          <div
            key={h}
            style={{
              width: 28,
              textAlign: 'center',
              fontFamily: 'IBM Plex Mono',
              fontSize: 9,
              color: '#586069',
              flexShrink: 0,
            }}
          >
            {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
          </div>
        ))}
      </div>

      {/* Rows per borough */}
      {BOROUGHS.map(boro => (
        <div key={boro} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
          <div
            style={{
              width: 100,
              fontFamily: 'IBM Plex Mono',
              fontSize: 9,
              color: '#586069',
              letterSpacing: '0.04em',
              flexShrink: 0,
              paddingRight: 8,
              textAlign: 'right',
            }}
          >
            {boro}
          </div>
          {HOURS.map(h => {
            const row = lookup[boro]?.[h]
            const complaints = row?.complaints ?? 0
            const felonyRate = row?.felony_rate ?? 0
            const bg = interpolateColor(complaints, minCount, maxCount)
            const tip = `${boro} | ${h}:00 — ${complaints} complaints, ${(felonyRate * 100).toFixed(1)}% felony`
            return (
              <div
                key={h}
                className="heatmap-cell"
                data-tip={tip}
                style={{ width: 28, background: bg, flexShrink: 0 }}
                title={tip}
              />
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="legend" style={{ marginLeft: 102 }}>
        <span>Low</span>
        <div
          className="legend-gradient"
          style={{
            background: 'linear-gradient(to right, rgb(0,20,40), rgb(0,230,118))',
          }}
        />
        <span>High complaint volume</span>
      </div>
    </div>
  )
}
