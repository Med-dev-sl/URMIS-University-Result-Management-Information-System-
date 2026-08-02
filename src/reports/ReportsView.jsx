import { useMemo, useState } from 'react'
import ReportChartCard from './components/ReportChartCard.jsx'
import ReportFilterBar from './components/ReportFilterBar.jsx'
import ReportTable from './components/ReportTable.jsx'
import { getReportLabel, summarizeReportOverview } from './reportsModuleUtils.js'

const reportRows = {
  students: [
    { name: 'Amina Hassan', status: 'Active', cohort: '2024' },
    { name: 'Kwame Boateng', status: 'Probation', cohort: '2024' },
  ],
  courses: [
    { name: 'CSC401', status: 'Active', cohort: '2024/25' },
    { name: 'BUS221', status: 'Review', cohort: '2024/25' },
  ],
  departments: [
    { name: 'Computing', status: 'Healthy', cohort: '12 programmes' },
    { name: 'Business', status: 'Stable', cohort: '8 programmes' },
  ],
  faculties: [
    { name: 'Science', status: 'Strong', cohort: '96% pass rate' },
    { name: 'Arts', status: 'Monitor', cohort: '87% pass rate' },
  ],
  results: [
    { name: 'Semester 1', status: 'Published', cohort: '82% avg' },
    { name: 'Semester 2', status: 'Pending', cohort: '79% avg' },
  ],
  graduation: [
    { name: '2024 Graduates', status: 'Ready', cohort: '184 candidates' },
    { name: '2023 Graduates', status: 'Archived', cohort: '201 candidates' },
  ],
  carryOver: [
    { name: 'Carry over cases', status: 'Action required', cohort: '14 students' },
  ],
  probation: [
    { name: 'Probation list', status: 'Monitor', cohort: '9 students' },
  ],
  performance: [
    { name: 'Faculty performance', status: 'Trending up', cohort: '91% completion' },
  ],
  teachingLoad: [
    { name: 'Lecturer load', status: 'Balanced', cohort: '24 teaching hours' },
  ],
  auditLogs: [
    { name: 'Result publication', status: 'Logged', cohort: '2026-08-01' },
  ],
}

const reportMeta = {
  students: { columns: ['Name', 'Status', 'Cohort'], title: 'Student reports', subtitle: 'Monitor enrolment and student standing.' },
  courses: { columns: ['Name', 'Status', 'Cohort'], title: 'Course reports', subtitle: 'Review course activity and delivery health.' },
  departments: { columns: ['Name', 'Status', 'Cohort'], title: 'Department reports', subtitle: 'Track department-level performance.' },
  faculties: { columns: ['Name', 'Status', 'Cohort'], title: 'Faculty reports', subtitle: 'Compare faculty outcomes and completions.' },
  results: { columns: ['Name', 'Status', 'Cohort'], title: 'Result reports', subtitle: 'Review publication status and averages.' },
  graduation: { columns: ['Name', 'Status', 'Cohort'], title: 'Graduation reports', subtitle: 'Follow graduation readiness and completion volumes.' },
  carryOver: { columns: ['Name', 'Status', 'Cohort'], title: 'Carry over reports', subtitle: 'View recurring carry-over cases.' },
  probation: { columns: ['Name', 'Status', 'Cohort'], title: 'Probation reports', subtitle: 'Track at-risk students and interventions.' },
  performance: { columns: ['Name', 'Status', 'Cohort'], title: 'Performance reports', subtitle: 'Summarize institutional performance trends.' },
  teachingLoad: { columns: ['Name', 'Status', 'Cohort'], title: 'Teaching load reports', subtitle: 'Understand academic workload distribution.' },
  auditLogs: { columns: ['Name', 'Status', 'Cohort'], title: 'Audit logs', subtitle: 'Review record changes and approvals.' },
}

export default function ReportsView() {
  const [activeSection, setActiveSection] = useState('students')
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-08-02' })

  const summary = useMemo(() => summarizeReportOverview(reportRows[activeSection] || []), [activeSection])
  const meta = reportMeta[activeSection] || reportMeta.students
  const rows = reportRows[activeSection] || reportRows.students

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Reports module</p>
          <h2>Institution-wide reporting dashboard</h2>
          <p className="panel-subtitle">Explore academic and administrative reports with filters, charts, tables, and export controls.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{summary.totalReports}</strong>
          <span>Active report entries</span>
        </div>
      </div>

      <div className="stats-grid">
        <ReportChartCard title="Ready reports" subtitle="Prepared for distribution" value={summary.activeReports} />
        <ReportChartCard title="Needs review" subtitle="Require validation" value={summary.flaggedReports} />
        <ReportChartCard title="Archived" subtitle="Historical records" value={summary.archiveCount} />
        <ReportChartCard title="Date range" subtitle={`${dateRange.start} → ${dateRange.end}`} value="Filtered" />
      </div>

      <ReportFilterBar activeSection={activeSection} onChangeSection={setActiveSection} dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>{meta.title}</h3>
            <div className="student-tools-row">
              <button className="secondary-button">Export PDF</button>
              <button className="secondary-button">Export Excel</button>
              <button className="secondary-button">Export CSV</button>
              <button className="secondary-button">Print</button>
            </div>
          </div>
          <p className="panel-subtitle">{meta.subtitle}</p>
          <div className="student-grid">
            <div className="panel">
              <h4>Overview</h4>
              <p className="panel-subtitle">Selected section: {getReportLabel(activeSection)}</p>
              <div className="pill-list">
                <span className="pill">Charts</span>
                <span className="pill">Tables</span>
                <span className="pill">Filters</span>
              </div>
            </div>
            <div className="panel">
              <h4>Snapshot</h4>
              <p className="panel-subtitle">The current view is responsive, export-ready, and designed for quick review.</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Report summary</h3>
            <span className="pill">Charts</span>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item"><strong>Student trend</strong><span>Enrollment remains healthy</span><small>+8%</small></li>
            <li className="timeline-item"><strong>Result publication</strong><span>Most reports are ready</span><small>Ready</small></li>
            <li className="timeline-item"><strong>Audit logs</strong><span>Recent changes are captured</span><small>Tracked</small></li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Report table</h3>
          <span className="pill">Export ready</span>
        </div>
        <ReportTable rows={rows} columns={meta.columns} />
      </div>
    </section>
  )
}
