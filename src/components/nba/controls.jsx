// Shared form and table primitives for the NBA app.
//
// The portfolio has no input styling of its own — roulette only ever needed
// buttons — so the field styles live here rather than in index.css, where they
// would be dead weight for every other page.

const FIELD_BASE =
  'w-full bg-felt-900 border border-felt-600 rounded-card px-3 py-2 text-sm ' +
  'text-text-primary placeholder:text-text-muted transition-colors ' +
  'focus:outline-none focus:border-luck-gold focus:ring-1 focus:ring-luck-gold ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.65rem] uppercase tracking-widest font-mono text-text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="text-[0.65rem] font-mono text-text-muted">{hint}</span>}
    </label>
  )
}

export function TextInput({ ...props }) {
  return <input type="text" className={FIELD_BASE} {...props} />
}

export function NumberInput({ ...props }) {
  return <input type="number" className={`${FIELD_BASE} tabular-nums`} {...props} />
}

export function DateInput({ ...props }) {
  return <input type="date" className={`${FIELD_BASE} tabular-nums`} {...props} />
}

export function Select({ options, placeholder, ...props }) {
  return (
    <select className={FIELD_BASE} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const { value, label } = typeof opt === 'string' ? { value: opt, label: opt } : opt
        return (
          <option key={value} value={value}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-outline'
  return <button type="button" className={`${base} !px-4 !py-2 !text-sm ${className}`} {...props} />
}

/** Destructive actions read red rather than gold, so they don't invite a click. */
export function DangerButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`border border-luck-red/60 text-luck-redLight font-semibold px-4 py-2
        text-sm rounded-card hover:bg-luck-red hover:text-text-primary hover:border-luck-red
        transition-all duration-200 active:scale-95 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        disabled:hover:text-luck-redLight ${className}`}
      {...props}
    />
  )
}

/** Result of the last write — green on success, red when the database refused. */
export function Notice({ notice }) {
  if (!notice) return null
  const good = notice.type === 'success'
  return (
    <p
      role="status"
      className={`text-sm font-mono rounded-card px-3 py-2 border ${
        good
          ? 'text-odds border-odds-muted bg-odds-muted/20'
          : 'text-luck-redLight border-luck-red/50 bg-luck-red/10'
      }`}
    >
      {notice.message}
    </p>
  )
}

export function Panel({ title, description, children }) {
  return (
    <section className="card-panel flex flex-col gap-4">
      <div>
        <h3 className="font-display text-lg text-luck-goldLight font-semibold">{title}</h3>
        {description && (
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

/**
 * Table with a horizontal scroller of its own, so a wide box score never makes
 * the whole page scroll sideways on a phone.
 */
export function DataTable({ columns, rows, empty = 'No rows.', onRowClick, rowKey }) {
  if (!rows.length) {
    return <p className="text-text-muted text-sm font-mono py-6 text-center">{empty}</p>
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-luck-goldMuted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`text-[0.65rem] uppercase tracking-widest font-mono text-text-muted
                  font-normal pb-2 px-2 whitespace-nowrap ${
                    col.numeric ? 'text-right' : 'text-left'
                  }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row) : i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-felt-600/60 last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-felt-600/40' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-2 px-2 whitespace-nowrap ${
                    col.numeric
                      ? 'text-right font-mono tabular-nums text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** One big number with a caption — used for season averages. */
export function StatTile({ label, value, tone = 'neutral' }) {
  const toneClass = {
    neutral: 'text-text-primary',
    gold: 'text-luck-gold',
    good: 'text-odds',
  }[tone]

  return (
    <div className="bg-felt-900 border border-felt-600 rounded-card px-3 py-2 text-center">
      <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted">
        {label}
      </p>
      <p className={`font-mono text-lg font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}
