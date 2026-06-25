/**
 * journalDate.js
 * Utilities for local journal date handling
 */

// Returns "YYYY-MM-DD" based on local time
export function getLocalTodayKey() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Returns "Nhật ký DD/MM/YYYY" or similar format
export function formatJournalLabel(dateKey) {
  if (!dateKey) return 'Nhật ký'
  const [year, month, day] = dateKey.split('-')
  return `Nhật ký ${day}/${month}/${year}`
}

export function isTodayJournal(board) {
  if (!board) return false
  return board.boardType === 'journal' && board.journalDate === getLocalTodayKey()
}

export function isJournalBoard(board) {
  if (!board) return false
  return board.boardType === 'journal'
}
