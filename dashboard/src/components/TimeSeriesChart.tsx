import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { TimeseriesRow } from '../types'

interface Props { data: TimeseriesRow[] }

const TT = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e0', borderRadius: 8,
      padding: '10px 13px', fontSize: 12, fontFamily: 'Inter',
      boxShadow: '0 4px 12px rgba(0,0,0,.09)',
    }}>
      <div style={{ color: '#78776f', marginBottom: 6, fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Felony Rate' ? `${(p.value * 100).toFixed(1)}%` : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function TimeSeriesChart({ data }: Props) {
  const stride  = Math.max(1, Math.floor(data.length / 90))
  const sampled = data.filter((_, i) => i % stride === 0)
  const fmtDate = (d: string) => { const [,m,day] = d.split('-'); return `${m}/${day}` }

  return (
    <ResponsiveContainer width="100%" height={typeof window !== "undefined" && window.innerWidth < 768 ? 220 : 280}>
      <ComposedChart data={sampled} margin={{ top: 8, right: 42, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eeede9" />
        <XAxis
          dataKey="date" tickFormatter={fmtDate}
          interval={Math.floor(sampled.length / 7)}
          tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
        />
        <YAxis yAxisId="l" tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
          label={{ value: 'Complaints', angle: -90, position: 'insideLeft', offset: 14, fill: '#78776f', fontSize: 10, fontFamily: 'Inter' }} />
        <YAxis yAxisId="r" orientation="right" domain={[0, 0.7]}
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
          label={{ value: 'Felony Rate', angle: 90, position: 'insideRight', offset: 12, fill: '#78776f', fontSize: 10, fontFamily: 'Inter' }} />
        <Tooltip content={<TT />} />
        <Area yAxisId="l" type="monotone" dataKey="complaints"
          fill="#2563eb18" stroke="#2563eb" strokeWidth={1.5} name="Complaints" dot={false} />
        <Line yAxisId="r" type="monotone" dataKey="felony_rate"
          stroke="#00b852" strokeWidth={2} dot={false} name="Felony Rate" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
