import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { ConditionalProbRow } from '../types'

interface Props { data: ConditionalProbRow[] }

const COLORS: Record<string, string> = {
  'BRONX':         '#00b852',
  'BROOKLYN':      '#2563eb',
  'MANHATTAN':     '#d97706',
  'QUEENS':        '#7c3aed',
  'STATEN ISLAND': '#db2777',
}

const TT = ({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e0', borderRadius: 8,
      padding: '10px 13px', fontSize: 12, fontFamily: 'Inter',
      boxShadow: '0 4px 12px rgba(0,0,0,.09)', maxWidth: 240,
    }}>
      <div style={{ color: '#78776f', fontSize: 11, marginBottom: 6, wordBreak: 'break-word' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {(p.value * 100).toFixed(2)}%
        </div>
      ))}
    </div>
  )
}

export default function ConditionalProbChart({ data }: Props) {
  const boroughs = [...new Set(data.map(d => d.borough))]
  const crimes   = [...new Set(data.map(d => d.crime))]

  const pivoted = crimes.map(crime => {
    const row: Record<string, string | number> = { crime }
    for (const b of boroughs) {
      const m = data.find(d => d.crime === crime && d.borough === b)
      row[b] = m?.probability ?? 0
    }
    return row
  })

  const short = (c: string) => c.length > 14 ? c.slice(0, 13) + '…' : c

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={pivoted} margin={{ top: 8, right: 16, bottom: 44, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eeede9" vertical={false} />
          <XAxis dataKey="crime" tickFormatter={short} interval={0}
            tick={{ fontSize: 9.5, fontFamily: 'Inter', fill: '#78776f' }}
            angle={-20} textAnchor="end" />
          <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
            label={{ value: 'P(crime | borough)', angle: -90, position: 'insideLeft', offset: 15, fill: '#78776f', fontSize: 10, fontFamily: 'Inter' }} />
          <Tooltip content={<TT />} />
          <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: 11, color: '#78776f', paddingTop: 8 }} />
          {boroughs.map(b => (
            <Bar key={b} dataKey={b} fill={COLORS[b] ?? '#888'} maxBarSize={14} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11, color: '#b0afa8', fontFamily: 'Inter', marginTop: 4 }}>
        Hover bars for full offense name and probability value.
      </div>
    </>
  )
}
