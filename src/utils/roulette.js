// Pure roulette math — no React, no DOM. Everything the simulator claims about
// odds is derived here so the numbers on screen can't drift from the model.

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
])

// Physical pocket order around the rim, clockwise from the single zero.
export const AMERICAN_WHEEL = [
  '0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34',
  '15', '3', '24', '36', '13', '1', '00', '27', '10', '25', '29', '12', '8',
  '19', '31', '18', '6', '21', '33', '16', '4', '23', '35', '14', '2',
]

export const EUROPEAN_WHEEL = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13',
  '36', '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14',
  '31', '9', '22', '18', '29', '7', '28', '12', '35', '3', '26',
]

export const getWheel = (variant) =>
  variant === 'european' ? EUROPEAN_WHEEL : AMERICAN_WHEEL

export const pocketCount = (variant) => getWheel(variant).length

export function colorOf(pocket) {
  if (pocket === '0' || pocket === '00') return 'green'
  return RED_NUMBERS.has(Number(pocket)) ? 'red' : 'black'
}

export const spinWheel = (variant) => {
  const wheel = getWheel(variant)
  return wheel[Math.floor(Math.random() * wheel.length)]
}

// The felt is laid out in 12 columns of 3. Column c holds 3c+1 (bottom),
// 3c+2 (middle), 3c+3 (top) — which is why splits and streets index off c.
export const BOARD_ROWS = [
  Array.from({ length: 12 }, (_, c) => 3 * c + 3),
  Array.from({ length: 12 }, (_, c) => 3 * c + 2),
  Array.from({ length: 12 }, (_, c) => 3 * c + 1),
]

const range = (lo, hi) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => String(lo + i))

const numbersMatching = (pred) =>
  range(1, 36).filter((n) => pred(Number(n)))

export const PAYOUTS = {
  straight: 35,
  split: 17,
  street: 11,
  dozen: 2,
  column: 2,
  even: 1,
}

// A bet id is a self-describing string ('straight:17', 'split:17-20', 'red').
// Everything downstream — payout, EV, settlement — is decoded from it.
export function decodeBet(id) {
  const [kind, arg] = id.split(':')

  switch (kind) {
    case 'straight':
      return { kind, label: arg, payout: PAYOUTS.straight, numbers: [arg] }
    case 'split':
      return { kind, label: arg.replace('-', '/'), payout: PAYOUTS.split, numbers: arg.split('-') }
    case 'street': {
      const c = Number(arg)
      return {
        kind,
        label: `${3 * c + 1}-${3 * c + 3}`,
        payout: PAYOUTS.street,
        numbers: [String(3 * c + 1), String(3 * c + 2), String(3 * c + 3)],
      }
    }
    case 'dozen': {
      const d = Number(arg)
      const labels = ['1st 12', '2nd 12', '3rd 12']
      return { kind, label: labels[d - 1], payout: PAYOUTS.dozen, numbers: range(12 * (d - 1) + 1, 12 * d) }
    }
    case 'column': {
      const col = Number(arg)
      return {
        kind,
        label: `Column ${col}`,
        payout: PAYOUTS.column,
        numbers: numbersMatching((n) => n % 3 === col % 3),
      }
    }
    case 'red':
      return { kind, label: 'Red', payout: PAYOUTS.even, numbers: numbersMatching((n) => RED_NUMBERS.has(n)) }
    case 'black':
      return { kind, label: 'Black', payout: PAYOUTS.even, numbers: numbersMatching((n) => !RED_NUMBERS.has(n)) }
    case 'odd':
      return { kind, label: 'Odd', payout: PAYOUTS.even, numbers: numbersMatching((n) => n % 2 === 1) }
    case 'even':
      return { kind, label: 'Even', payout: PAYOUTS.even, numbers: numbersMatching((n) => n % 2 === 0) }
    case 'low':
      return { kind, label: '1-18', payout: PAYOUTS.even, numbers: range(1, 18) }
    case 'high':
      return { kind, label: '19-36', payout: PAYOUTS.even, numbers: range(19, 36) }
    default:
      throw new Error(`Unknown bet id: ${id}`)
  }
}

export const betCovers = (id, pocket) => decodeBet(id).numbers.includes(pocket)

/**
 * Per-unit expected value and volatility for a bet.
 *
 * X pays `payout` with probability p and loses the 1-unit stake otherwise, so
 * EV = p·payout − (1−p). On an American wheel every bet here lands on −2/38 =
 * −5.26%; only the standard deviation moves. That equality is the whole point
 * of the ranking table, so it is computed rather than hard-coded.
 */
export function betStats(id, variant) {
  const { numbers, payout } = decodeBet(id)
  const total = pocketCount(variant)
  const p = numbers.length / total

  const ev = p * payout - (1 - p)
  const secondMoment = p * payout * payout + (1 - p)
  const stdev = Math.sqrt(secondMoment - ev * ev)

  return { probability: p, payout, ev, stdev, coverage: numbers.length, pockets: total }
}

export const houseEdge = (variant) => (variant === 'european' ? 1 / 37 : 2 / 38)

/** Settle every active bet against one pocket. Amounts are absolute currency. */
export function settle(bets, pocket) {
  let wagered = 0
  let returned = 0
  const winners = []

  for (const [id, amount] of Object.entries(bets)) {
    if (!amount) continue
    wagered += amount
    if (betCovers(id, pocket)) {
      returned += amount * (decodeBet(id).payout + 1)
      winners.push(id)
    }
  }

  return { wagered, returned, net: returned - wagered, winners }
}

/** Blended per-unit edge across the current board — used for projections. */
export function blendedEv(bets, variant) {
  const total = Object.values(bets).reduce((sum, a) => sum + a, 0)
  if (!total) return 0

  const weighted = Object.entries(bets).reduce(
    (sum, [id, amount]) => sum + betStats(id, variant).ev * amount,
    0,
  )
  return weighted / total
}

/**
 * Monte Carlo a Martingale run: double after every loss, reset to base after a
 * win. Returns how often the stack is wiped out, which is the honest answer to
 * "why doesn't doubling up work".
 */
export function simulateMartingale({ bankroll, baseBet, spins, trials, variant }) {
  const winProb = (variant === 'european' ? 18 / 37 : 18 / 38)
  let ruined = 0
  let survivedTotal = 0
  let peakBet = 0
  let endingTotal = 0

  for (let t = 0; t < trials; t++) {
    let stack = bankroll
    let bet = baseBet
    let spin = 0

    for (; spin < spins; spin++) {
      if (bet > stack) break // can't cover the next double — the table wall
      stack -= bet
      if (Math.random() < winProb) {
        stack += bet * 2
        bet = baseBet
      } else {
        bet *= 2
      }
      if (bet > peakBet) peakBet = bet
    }

    if (spin < spins) ruined++
    survivedTotal += spin
    endingTotal += stack
  }

  return {
    ruinRate: ruined / trials,
    avgSpinsSurvived: survivedTotal / trials,
    avgEnding: endingTotal / trials,
    peakBet,
  }
}

/** One Martingale run with the bankroll recorded after every spin, for plotting. */
export function traceMartingale({ bankroll, baseBet, spins, variant }) {
  const winProb = variant === 'european' ? 18 / 37 : 18 / 38
  const curve = [bankroll]
  let stack = bankroll
  let bet = baseBet
  let peakBet = baseBet
  let bustedAt = null

  for (let spin = 0; spin < spins; spin++) {
    if (bet > stack) {
      bustedAt = spin
      break
    }
    stack -= bet
    if (Math.random() < winProb) {
      stack += bet * 2
      bet = baseBet
    } else {
      bet *= 2
      if (bet > peakBet) peakBet = bet
    }
    curve.push(stack)
  }

  return { curve, bustedAt, peakBet, ending: stack }
}

export const formatMoney = (value) => {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export const formatPct = (value, digits = 2) => `${(value * 100).toFixed(digits)}%`
