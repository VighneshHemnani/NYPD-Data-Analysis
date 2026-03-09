import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TimeseriesRow } from '../types'

interface Props {
  data: TimeseriesRow[]
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
    }}>
      <div style={{ color: '#c9d1d9', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === 'Felony Rate' ? `${(p.value * 100).toFixed(1)}%` : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function TimeSeriesChart({ data }: Props) {
  // Sample every nth point to avoid clutter if large
  const stride = Math.max(1, Math.floor(data.length / 90))
  const sampled = data.filter((_, i) => i % stride === 0)

  // Format x-axis: show month/day
  const formatDate = (d: string) => {
    const [, m, day] = d.split('-')
    return `${m}/${day}`
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={sampled} margin={{ top: 10, right: 40, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2430" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          interval={Math.floor(sampled.length / 8)}
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#586069' }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#586069' }}
          label={{ value: 'Complaints', angle: -90, position: 'insideLeft', offset: 10, fill: '#586069', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 0.7]}
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#586069' }}
          label={{ value: 'Felony Rate', angle: 90, position: 'insideRight', offset: 10, fill: '#586069', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: '#586069' }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="complaints"
          fill="#4fc3f720"
          stroke="#4fc3f7"
          strokeWidth={1.5}
          name="Complaints"
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="felony_rate"
          stroke="#ffb300"
          strokeWidth={1.5}
          dot={false}
          name="Felony Rate"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
