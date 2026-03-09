import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { CalibrationRow } from '../types'

interface Props { data: CalibrationRow[] }

const Dot = (props: { cx?: number; cy?: number; payload?: CalibrationRow }) => {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  const over = payload.predicted > payload.actual
  return (
    <g>
      <circle cx={cx} cy={cy} r={6}
        fill={over ? '#ff3300' : '#00d964'}
        stroke="#fff" strokeWidth={2} />
    </g>
  )
}

const TT = ({ active, payload }: { active?: boolean; payload?: { payload: CalibrationRow }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const over = d.predicted > d.actual
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e0',
      borderRadius: 8, padding: '10px 13px', fontSize: 12,
      fontFamily: 'Inter', boxShadow: '0 4px 12px rgba(0,0,0,.09)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#111' }}>{d.bucket_label}</div>
      <div style={{ color: '#009640' }}>Predicted: {(d.predicted * 100).toFixed(1)}%</div>
      <div style={{ color: '#2563eb' }}>Actual: &nbsp;&nbsp;{(d.actual * 100).toFixed(1)}%</div>
      <div style={{ color: '#b0afa8', marginTop: 4, fontSize: 11 }}>n = {d.count.toLocaleString()}</div>
      <div style={{
        marginTop: 7, padding: '3px 8px', borderRadius: 4, display: 'inline-block', fontSize: 11, fontWeight: 700,
        background: over ? '#fff0f0' : '#e8faf2',
        color: over ? '#ff3300' : '#009640',
      }}>
        {over ? '▼ Overconfident' : '▲ Underconfident'}
      </div>
    </div>
  )
}

export default function CalibrationChart({ data }: Props) {
  const chartData = data.map(d => ({ ...d, perfect: d.predicted }))
  return (
    <ResponsiveContainer width="100%" height={typeof window !== "undefined" && window.innerWidth < 768 ? 220 : 280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 28, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eeede9" />
        <XAxis
          dataKey="predicted" type="number" domain={[0, 1]}
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          label={{ value: 'Predicted P(felony)', position: 'insideBottom', offset: -14, fill: '#78776f', fontSize: 11, fontFamily: 'Inter' }}
          tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
        />
        <YAxis
          domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          label={{ value: 'Actual P(felony)', angle: -90, position: 'insideLeft', offset: 16, fill: '#78776f', fontSize: 11, fontFamily: 'Inter' }}
          tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#78776f' }}
        />
        <Tooltip content={<TT />} />
        {/* Perfect calibration line */}
        <Line dataKey="perfect" stroke="#e5e4e0" strokeDasharray="5 4"
          dot={false} strokeWidth={1.5} name="Perfect" />
        {/* Actual */}
        <Line dataKey="actual" stroke="#00d964" strokeWidth={2}
          dot={<Dot />} activeDot={false} name="Model" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
