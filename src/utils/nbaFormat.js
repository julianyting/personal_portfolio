// Display formatters for the NBA app.
//
// These live outside controls.jsx so that file only exports components, which
// is what keeps Fast Refresh working during development.

/** Height is stored in inches; nobody reads a basketball player as "83". */
export const formatHeight = (inches) =>
  inches ? `${Math.floor(inches / 12)}'${inches % 12}"` : '—'

export const formatMoney = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('en-US')}` : '—'

export const formatStat = (n) => (typeof n === 'number' ? n.toFixed(1) : '—')
