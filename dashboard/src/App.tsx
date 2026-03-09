import { useEffect, useState } from 'react'
import type { DashboardData, CalibrationRow, TimeseriesRow, BoroughHourRow, ConditionalProbRow } from './types'
import CalibrationChart from './components/CalibrationChart'
import TimeSeriesChart from './components/TimeSeriesChart'
import BoroughHeatmap from './components/BoroughHeatmap'
import ConditionalProbChart from './components/ConditionalProbChart'

async function load<T>(path: string): Promise<T> {
  const r = await fetch(path)
  if (!r.ok) throw new Error(`${path}: ${r.status}`)
  return r.json()
}

export default function App() {
  const [data, setData]   = useState<DashboardData | null>(null)
  const [err, setErr]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      load<CalibrationRow[]>('/data/calibration.json'),
      load<TimeseriesRow[]>('/data/timeseries.json'),
      load<BoroughHourRow[]>('/data/borough_hour.json'),
      load<ConditionalProbRow[]>('/data/conditional_probs.json'),
    ])
      .then(([calibration, timeseries, boroughHour, conditionalProbs]) =>
        setData({ calibration, timeseries, boroughHour, conditionalProbs })
      )
      .catch(e => setErr(String(e)))
  }, [])

  if (err)   return <div className="loading"><div style={{ color: 'var(--red)', fontWeight: 600 }}>Error: {err}</div></div>
  if (!data) return <div className="loading"><div className="spin" /><span>Loading market data…</span></div>

  /* ── derived stats ── */
  const total       = data.calibration.reduce((s, d) => s + d.count, 0)
  const avgFelony   = data.timeseries.reduce((s, d) => s + d.felony_rate, 0) / data.timeseries.length
  const avgPred     = data.calibration.reduce((s, d) => s + d.predicted * d.count, 0) / total
  const avgActual   = data.calibration.reduce((s, d) => s + d.actual    * d.count, 0) / total
  const bias        = ((avgPred - avgActual) / avgActual * 100)
  const peak        = Math.max(...data.timeseries.map(d => d.complaints))
  const over        = bias > 0

  return (
    <div>
      {/* ── Nav ── */}
      <nav className="nav">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-.3px' }}>
            NYPD Complaint Calibration
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
            Prediction Market Analysis
          </span>
        </div>
        <div className="nav-right">
          <span className="chip chip-gray">NYC Open Data</span>
          <span className="chip chip-blue">Chunk 1 / 10</span>
        </div>
      </nav>

      {/* ── Page ── */}
      <div className="page">

        {/* Header */}
        <div className="page-head">
          <div className="page-title">NYPD Crime Complaint Markets</div>
          <div className="page-sub">
            Calibration analysis of historical crime base rates as probability estimates &mdash; 7.4M records, 2006–present
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats">

          <div className="stat">
            <div className="stat-label">Avg Felony Rate</div>
            <div className="stat-value c-green">{(avgFelony * 100).toFixed(1)}%</div>
            <div className="stat-sub">of complaints classified as felony</div>
            <div className="pbar" style={{ marginTop: 12 }}>
              <div className="pbar-fill" style={{ width: `${avgFelony * 100}%`, background: 'var(--green)' }} />
            </div>
            <div className="stat-sub" style={{ marginTop: 5 }}>across all days in window</div>
          </div>

          <div className="stat">
            <div className="stat-label">Test Records</div>
            <div className="stat-value c-dark">{total.toLocaleString()}</div>
            <div className="stat-sub">held-out calibration set</div>
            <div className="pbar" style={{ marginTop: 12 }}>
              <div className="pbar-fill" style={{ width: '70%', background: 'var(--green)' }} />
            </div>
            <div className="stat-sub" style={{ marginTop: 5 }}>70 / 30 chrono split</div>
          </div>

          <div className="stat">
            <div className="stat-label">Calibration Bias</div>
            <div className={`stat-value ${over ? 'c-red' : 'c-blue'}`}>
              {over ? '+' : ''}{bias.toFixed(1)}%
            </div>
            <div className="stat-sub">{over ? 'overestimates felony rate' : 'underestimates felony rate'}</div>
            <div className="yes-no">
              <div className={`yn ${over ? 'yn-no' : 'yn-yes'}`} style={{ justifyContent: 'center' }}>
                {over ? '▼ Overconfident' : '▲ Underconfident'}
              </div>
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Peak Daily Volume</div>
            <div className="stat-value c-dark">{peak.toLocaleString()}</div>
            <div className="stat-sub">complaints in one day</div>
            <div className="pbar" style={{ marginTop: 12 }}>
              <div className="pbar-fill" style={{ width: `${Math.min(100, (peak / 2000) * 100)}%`, background: 'var(--blue)' }} />
            </div>
            <div className="stat-sub" style={{ marginTop: 5 }}>vs. 2,000 baseline</div>
          </div>

        </div>

        {/* Charts */}
        <div className="grid grid-2">

          {/* Calibration */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-top">
                <span className="panel-title">Calibration Curve</span>
                <span className="chip chip-green">Model Accuracy</span>
              </div>
              <div className="panel-desc">
                Predicted P(felony) from training window vs. actual rate in held-out test set.
                Points on the dashed diagonal = perfect calibration.
              </div>
            </div>
            <div className="panel-rule" />
            <CalibrationChart data={data.calibration} />
            <div className="note note-amber">
              Tail divergence reflects the midnight artifact: incidents with unknown times default
              to 00:00, inflating Night-bucket estimates in training.
            </div>
          </div>

          {/* Time series */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-top">
                <span className="panel-title">Daily Complaint Volume</span>
                <span className="chip chip-blue">Time Series</span>
              </div>
              <div className="panel-desc">
                Daily complaint count and 7-day rolling felony rate across the analysis window.
              </div>
            </div>
            <div className="panel-rule" />
            <TimeSeriesChart data={data.timeseries} />
            <div className="note note-green">
              Felony rate is a 7-day rolling average. Days with &lt;20 complaints excluded to
              prevent 100% rates from single-record days.
            </div>
          </div>

          {/* Heatmap — full width */}
          <div className="panel grid-full">
            <div className="panel-head">
              <div className="panel-top">
                <span className="panel-title">Complaint Density: Borough × Hour</span>
                <span className="chip chip-gray">Heatmap</span>
              </div>
              <div className="panel-desc">
                Color encodes complaint volume per borough per hour of day. Hover any cell for count and felony rate.
              </div>
            </div>
            <div className="panel-rule" />
            <BoroughHeatmap data={data.boroughHour} />
          </div>

          {/* Conditional probs — full width */}
          <div className="panel grid-full">
            <div className="panel-head">
              <div className="panel-top">
                <span className="panel-title">P(crime type | borough) — Base Rates</span>
                <span className="chip chip-gray">Conditional Probs</span>
              </div>
              <div className="panel-desc">
                Empirical base rates for the top 8 offense types by borough.
                These are the probability anchors for pricing borough-specific crime event contracts.
              </div>
            </div>
            <div className="panel-rule" />
            <ConditionalProbChart data={data.conditionalProbs} />
          </div>

        </div>

        <div className="footer">
          <span>NYPD Complaint Data Historic · NYC Open Data · Analysis by Vighnesh Hemnani</span>
          <span>Prediction Market Framing · Calibration Analysis · CS 439 Data Science</span>
        </div>

      </div>
    </div>
  )
}
