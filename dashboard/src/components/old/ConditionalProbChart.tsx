import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { ConditionalProbRow } from '../types'

interface Props {
  data: ConditionalProbRow[]
}

const BOROUGH_COLORS: Record<string, string> = {
  'BRONX':         '#00e676',
  'BROOKLYN':      '#4fc3f7',
  'MANHATTAN':     '#ffb300',
  'QUEENS':        '#ce93d8',
  'STATEN ISLAND': '#ef9a9a',
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c2430',
      border: '1px solid #2a3440',
      padding: '10px 14px',
      fontFamily: 'IBM Plex Mono',
      fontSize: 11,
      maxWidth: 220,
    }}>
      <div style={{ color: '#c9d1d9', marginBottom: 6, fontSize: 10, wordBreak: 'break-word' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {(p.value * 100).toFixed(2)}%
        </div>
      ))}
    </div>
  )
}

export default function ConditionalProbChart({ data }: Props) {
  const boroughs = [...new Set(data.map(d => d.borough))]
  const crimes = [...new Set(data.map(d => d.crime))]

  // Pivot: [{ crime, BRONX: 0.04, BROOKLYN: 0.07, ... }, ...]
  const pivoted = crimes.map(crime => {
    const row: Record<string, string | number> = { crime }
    for (const boro of boroughs) {
      const match = data.find(d => d.crime === crime && d.borough === boro)
      row[boro] = match?.probability ?? 0
    }
    return row
  })

  // Short crime labels for x-axis
  const shortLabel = (c: string) => c.split(' ').map(w => w[0]).join('').slice(0, 5)

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={pivoted} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2430" vertical={false} />
          <XAxis
            dataKey="crime"
            tickFormatter={shortLabel}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#586069' }}
            interval={0}
          />
          <YAxis
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#586069' }}
            label={{ value: 'P(crime | borough)', angle: -90, position: 'insideLeft', offset: 14, fill: '#586069', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: '#586069' }}
          />
          {boroughs.map(boro => (
            <Bar key={boro} dataKey={boro} fill={BOROUGH_COLORS[boro] ?? '#888'} maxBarSize={16} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: '#586069', marginTop: 8 }}>
        X-axis labels abbreviated. Hover bars for full offense name and probability.
      </div>
    </div>
  )
}
