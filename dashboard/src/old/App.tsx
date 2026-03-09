import { useEffect, useState } from 'react'
import type { DashboardData, CalibrationRow, TimeseriesRow, BoroughHourRow, ConditionalProbRow } from './types'
import CalibrationChart from './components/CalibrationChart'
import TimeSeriesChart from './components/TimeSeriesChart'
import BoroughHeatmap from './components/BoroughHeatmap'
import ConditionalProbChart from './components/ConditionalProbChart'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json()
}

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchJSON<CalibrationRow[]>('/data/calibration.json'),
      fetchJSON<TimeseriesRow[]>('/data/timeseries.json'),
      fetchJSON<BoroughHourRow[]>('/data/borough_hour.json'),
      fetchJSON<ConditionalProbRow[]>('/data/conditional_probs.json'),
    ])
      .then(([calibration, timeseries, boroughHour, conditionalProbs]) =>
        setData({ calibration, timeseries, boroughHour, conditionalProbs })
      )
      .catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ color: '#ff4444' }}>ERROR</div>
        <div>{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>LOADING DATA</div>
      </div>
    )
  }

  // Compute summary stats
  const avgPredicted = data.calibration.reduce((s, d) => s + d.predicted * d.count, 0) /
    data.calibration.reduce((s, d) => s + d.count, 0)
  const avgActual = data.calibration.reduce((s, d) => s + d.actual * d.count, 0) /
    data.calibration.reduce((s, d) => s + d.count, 0)
  const totalRecords = data.calibration.reduce((s, d) => s + d.count, 0)
  const avgFelonyRate = data.timeseries.reduce((s, d) => s + d.felony_rate, 0) / data.timeseries.length
  const maxComplaints = Math.max(...data.timeseries.map(d => d.complaints))

  const biasPct = ((avgPredicted - avgActual) / avgActual * 100)

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="header-tag">PREDICTION MARKET ANALYSIS</span>
          <span className="header-title">NYPD COMPLAINT CALIBRATION</span>
        </div>
        <div className="header-meta">
          SOURCE: NYC OPEN DATA &nbsp;/&nbsp; CHUNK 1 OF 10 &nbsp;/&nbsp; CS 439 DATA SCIENCE
        </div>
      </header>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="stat-cell">
          <span className="stat-label">Test Records</span>
          <span className="stat-value">{totalRecords.toLocaleString()}</span>
          <span className="stat-sub">held-out calibration set</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Avg Felony Rate</span>
          <span className="stat-value">{(avgFelonyRate * 100).toFixed(1)}%</span>
          <span className="stat-sub">across all days in window</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Calibration Bias</span>
          <span className="stat-value" style={{ color: biasPct > 0 ? '#ff4444' : '#4fc3f7' }}>
            {biasPct > 0 ? '+' : ''}{biasPct.toFixed(1)}%
          </span>
          <span className="stat-sub">{biasPct > 0 ? 'overconfident' : 'underconfident'} on average</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Peak Daily</span>
          <span className="stat-value">{maxComplaints}</span>
          <span className="stat-sub">complaints in one day</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid">

        {/* Calibration chart - half width */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Calibration Curve</span>
            <span className="panel-desc">Predicted vs. actual P(felony) on held-out data</span>
          </div>
          <CalibrationChart data={data.calibration} />
        </div>

        {/* Time Series - half width */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Daily Complaint Volume</span>
            <span className="panel-desc">Daily complaint count and felony rate over the analysis window</span>
          </div>
          <TimeSeriesChart data={data.timeseries} />
        </div>

        {/* Borough x Hour Heatmap - full width */}
        <div className="panel grid-full">
          <div className="panel-header">
            <span className="panel-title">Complaint Density: Borough x Hour</span>
            <span className="panel-desc">
              Color encodes complaint volume. Hover for felony rate. Midnight (00:00) spike is a data artifact from unknown-time incidents.
            </span>
          </div>
          <BoroughHeatmap data={data.boroughHour} />
        </div>

        {/* Conditional probabilities - full width */}
        <div className="panel grid-full">
          <div className="panel-header">
            <span className="panel-title">Conditional Probabilities: P(crime | borough)</span>
            <span className="panel-desc">
              Base rate of each offense type conditioned on borough. These are the empirical anchors for pricing a
              borough-specific crime prediction market contract.
            </span>
          </div>
          <ConditionalProbChart data={data.conditionalProbs} />
        </div>

      </div>
    </div>
  )
}
