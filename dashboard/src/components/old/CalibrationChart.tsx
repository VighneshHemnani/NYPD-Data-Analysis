import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts'
import type { CalibrationRow } from '../types'

interface Props {
  data: CalibrationRow[]
}

const CustomDot = (props: { cx?: number; cy?: number; payload?: CalibrationRow }) => {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#00e676" stroke="#080c10" strokeWidth={2} />
      <text
        x={cx + 10}
        y={cy - 6}
        fill="#586069"
        fontSize={9}
        fontFamily="IBM Plex Mono"
      >
        n={payload.count.toLocaleString()}
      </text>
    </g>
  )
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CalibrationRow }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#1c2430',
      border: '1px solid #2a3440',
      padding: '10px 14px',
      fontFamily: 'IBM Plex Mono',
      fontSize: 11,
    }}>
      <div style={{ color: '#c9d1d9', marginBottom: 4 }}>{d.bucket_label}</div>
      <div style={{ color: '#00e676' }}>Predicted: {(d.predicted * 100).toFixed(1)}%</div>
      <div style={{ color: '#ffb300' }}>Actual: {(d.actual * 100).toFixed(1)}%</div>
      <div style={{ color: '#586069' }}>n = {d.count.toLocaleString()}</div>
      <div style={{ color: d.predicted > d.actual ? '#ff4444' : '#4fc3f7', marginTop: 4 }}>
        {d.predicted > d.actual ? 'Overconfident' : 'Underconfident'}
      </div>
    </div>
  )
}

export default function CalibrationChart({ data }: Props) {
  // Build chart data with perfect calibration line
  const chartData = data.map(d => ({ ...d, perfect: d.predicted }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2430" />
          <XAxis
            dataKey="predicted"
            type="number"
            domain={[0, 1]}
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            label={{ value: 'Predicted P(felony)', position: 'insideBottom', offset: -10, fill: '#586069', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            label={{ value: 'Actual P(felony)', angle: -90, position: 'insideLeft', offset: 10, fill: '#586069', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Perfect calibration reference */}
          <Line
            dataKey="perfect"
            stroke="#2a3440"
            strokeDasharray="6 3"
            dot={false}
            strokeWidth={1}
            name="Perfect"
          />
          {/* Actual calibration */}
          <Line
            dataKey="actual"
            stroke="#00e676"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={false}
            name="Model"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="callout">
        Points below the dashed line indicate overconfidence (predicted probability exceeds actual rate).
        Divergence in the high-probability tail is consistent with the midnight data artifact:
        incidents defaulted to 00:00 inflate Night-bucket training estimates.
      </div>
    </div>
  )
}
