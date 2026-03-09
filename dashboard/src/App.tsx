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

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />

          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Vighnesh Hemnani</span>

          <a href="https://www.linkedin.com/in/vighnesh-hemnani/" target="_blank" rel="noreferrer"
            className="link-btn link-btn-linkedin">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.45 20.45h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.354V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>

          <a href="https://github.com/VighneshHemnani/NYPD-Data-Analysis" target="_blank" rel="noreferrer"
            className="link-btn link-btn-github">
            Repo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
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
          <span>NYPD Complaint Data Historic · NYC Open Data · Calibration Analysis · CS 439 Data Science</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-3)', fontSize: 11 }}>Vighnesh Hemnani</span>

            <a href="https://www.linkedin.com/in/vighnesh-hemnani/" target="_blank" rel="noreferrer"
              className="link-btn link-btn-linkedin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.45 20.45h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.354V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
              LinkedIn
            </a>

            <a href="https://github.com/VighneshHemnani/NYPD-Data-Analysis" target="_blank" rel="noreferrer"
              className="link-btn link-btn-github">
              Repo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
