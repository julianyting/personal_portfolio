import { BOARD_ROWS, colorOf, formatMoney } from '../../utils/roulette'

// The three number rows map to the three column bets on the right rail:
// the top row (3, 6, 9 …) is column 3, the bottom row (1, 4, 7 …) is column 1.
const ROW_COLUMN_BET = [3, 2, 1]

const OUTSIDE_BETS = [
  { id: 'low', label: '1-18' },
  { id: 'even', label: 'Even' },
  { id: 'red', label: 'Red', swatch: 'bg-luck-red' },
  { id: 'black', label: 'Black', swatch: 'bg-felt-950' },
  { id: 'odd', label: 'Odd' },
  { id: 'high', label: '19-36' },
]

function Chip({ amount }) {
  if (!amount) return null
  return (
    <span
      className="absolute -top-1.5 -right-1.5 z-20 min-w-[1.15rem] h-[1.15rem] px-1
        rounded-full bg-luck-gold text-felt-950 text-[0.6rem] font-mono font-bold
        flex items-center justify-center shadow-neon-gold pointer-events-none"
    >
      {amount}
    </span>
  )
}

/**
 * Thin strip straddling the edge between two number cells. Placing a chip on
 * the line between numbers is how splits and streets work on a real felt, so
 * the hotspots live on the borders rather than in a separate menu.
 */
function EdgeBet({ id, amount, onPlace, onRemove, disabled, title, className }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onPlace(id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onRemove(id)
      }}
      className={`absolute z-10 rounded-sm transition-colors
        ${amount ? 'bg-luck-gold/70' : 'bg-transparent hover:bg-luck-gold/50'}
        disabled:pointer-events-none ${className}`}
    >
      {amount ? (
        <span className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-mono font-bold text-felt-950">
          {amount}
        </span>
      ) : null}
    </button>
  )
}

export default function BetBoard({ variant, bets, onPlace, onRemove, disabled }) {
  const zeros = variant === 'european' ? ['0'] : ['0', '00']
  const totalWagered = Object.values(bets).reduce((sum, a) => sum + a, 0)

  const cellBase =
    `relative flex-1 h-10 flex items-center justify-center font-mono text-xs font-bold
     text-text-primary border border-luck-goldMuted/50 transition-colors
     disabled:pointer-events-none`

  const place = (id) => onPlace(id)
  const remove = (id) => onRemove(id)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[560px] space-y-1">
          <div className="flex gap-1">
            {/* Zero pocket(s) */}
            <div className="flex flex-col gap-1 w-10 shrink-0">
              {zeros.map((z) => (
                <button
                  key={z}
                  type="button"
                  disabled={disabled}
                  onClick={() => place(`straight:${z}`)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    remove(`straight:${z}`)
                  }}
                  className={`relative flex-1 flex items-center justify-center font-mono text-xs
                    font-bold text-text-primary bg-odds-dim/70 border border-luck-goldMuted/50
                    rounded-sm hover:bg-odds-dim disabled:pointer-events-none`}
                  style={{ minHeight: zeros.length === 1 ? '7.25rem' : '3.5rem' }}
                >
                  {z}
                  <Chip amount={bets[`straight:${z}`]} />
                </button>
              ))}
            </div>

            {/* 3 × 12 number grid */}
            <div className="flex-1 flex flex-col gap-1">
              {BOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {row.map((n, colIndex) => {
                    const id = `straight:${n}`
                    const isRed = colorOf(String(n)) === 'red'
                    return (
                      <div key={n} className="relative flex-1 flex">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => place(id)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            remove(id)
                          }}
                          className={`${cellBase} rounded-sm
                            ${isRed ? 'bg-luck-red/80 hover:bg-luck-red' : 'bg-felt-950 hover:bg-felt-800'}`}
                        >
                          {n}
                          <Chip amount={bets[id]} />
                        </button>

                        {/* Split with the number to the right (n + 3) */}
                        {colIndex < 11 && (
                          <EdgeBet
                            id={`split:${n}-${n + 3}`}
                            amount={bets[`split:${n}-${n + 3}`]}
                            onPlace={place}
                            onRemove={remove}
                            disabled={disabled}
                            title={`Split ${n}/${n + 3} — pays 17:1`}
                            className="top-1 bottom-1 -right-1.5 w-3"
                          />
                        )}

                        {/* Split with the number below (n − 1) */}
                        {rowIndex < 2 && (
                          <EdgeBet
                            id={`split:${n - 1}-${n}`}
                            amount={bets[`split:${n - 1}-${n}`]}
                            onPlace={place}
                            onRemove={remove}
                            disabled={disabled}
                            title={`Split ${n - 1}/${n} — pays 17:1`}
                            className="left-1 right-1 -bottom-1.5 h-3"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Streets sit on the outer edge of each vertical trio */}
              <div className="flex gap-1 pt-0.5">
                {Array.from({ length: 12 }, (_, c) => {
                  const id = `street:${c}`
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={disabled}
                      title={`Street ${3 * c + 1}-${3 * c + 3} — pays 11:1`}
                      aria-label={`Street ${3 * c + 1} to ${3 * c + 3}, pays 11 to 1`}
                      onClick={() => place(id)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        remove(id)
                      }}
                      className={`relative flex-1 h-4 rounded-sm border border-luck-goldMuted/40
                        text-[0.55rem] font-mono text-felt-950 transition-colors
                        ${bets[id] ? 'bg-luck-gold/70' : 'bg-felt-700 hover:bg-luck-gold/40'}
                        disabled:pointer-events-none`}
                    >
                      {bets[id] || ''}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Column bets */}
            <div className="flex flex-col gap-1 w-14 shrink-0">
              {ROW_COLUMN_BET.map((col) => {
                const id = `column:${col}`
                return (
                  <button
                    key={col}
                    type="button"
                    disabled={disabled}
                    title={`Column ${col} — pays 2:1`}
                    onClick={() => place(id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      remove(id)
                    }}
                    className="relative h-10 rounded-sm border border-luck-goldMuted/50 bg-felt-700
                      hover:bg-felt-600 font-mono text-[0.6rem] text-luck-gold
                      disabled:pointer-events-none"
                  >
                    2:1
                    <Chip amount={bets[id]} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dozens */}
          <div className="flex gap-1 pl-11 pr-[3.75rem]">
            {[1, 2, 3].map((d) => {
              const id = `dozen:${d}`
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => place(id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    remove(id)
                  }}
                  className="relative flex-1 h-9 rounded-sm border border-luck-goldMuted/50
                    bg-felt-700 hover:bg-felt-600 font-mono text-[0.65rem] text-luck-gold
                    disabled:pointer-events-none"
                >
                  {['1st 12', '2nd 12', '3rd 12'][d - 1]}
                  <Chip amount={bets[id]} />
                </button>
              )
            })}
          </div>

          {/* Even-money bets */}
          <div className="flex gap-1 pl-11 pr-[3.75rem]">
            {OUTSIDE_BETS.map(({ id, label, swatch }) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => place(id)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  remove(id)
                }}
                className="relative flex-1 h-9 rounded-sm border border-luck-goldMuted/50
                  bg-felt-700 hover:bg-felt-600 font-mono text-[0.65rem] text-text-primary
                  flex items-center justify-center gap-1 disabled:pointer-events-none"
              >
                {swatch && <span className={`w-2.5 h-2.5 rotate-45 ${swatch} border border-luck-goldMuted/60`} />}
                {label}
                <Chip amount={bets[id]} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[0.7rem] font-mono text-text-muted">
        Click to add a chip · right-click to take one back · thin gold strips between numbers are
        splits (17:1) and streets (11:1) · total on the felt:{' '}
        <span className="text-luck-gold">{formatMoney(totalWagered)}</span>
      </p>
    </div>
  )
}
