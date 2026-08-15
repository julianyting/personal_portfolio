import { useCallback, useState } from 'react'

/**
 * Runs a write against the API and turns the outcome into a notice.
 *
 * Every DML form needs the same three things — a pending flag, the resulting
 * message, and a nudge to the rest of the page that the data moved — so they
 * share this instead of each re-implementing it.
 */
export default function useWriter(onMutate) {
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (action, successMessage, onSuccess) => {
      setBusy(true)
      try {
        await action()
        setNotice({ type: 'success', message: successMessage })
        onSuccess?.()
        onMutate?.()
      } catch (err) {
        // Both backends throw with a human-readable message, including the
        // foreign-key refusals — those are the interesting ones to show.
        setNotice({ type: 'error', message: err.message })
      } finally {
        setBusy(false)
      }
    },
    [onMutate],
  )

  return { notice, busy, run, clearNotice: () => setNotice(null) }
}
