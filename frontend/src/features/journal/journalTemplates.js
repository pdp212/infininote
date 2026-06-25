import { formatJournalLabel } from './journalDate'

export function getDefaultJournalHeaderText(dateKey) {
  if (!dateKey) return 'Nhật ký'
  // Format to something like "Nhật ký — 25/06/2026"
  const label = formatJournalLabel(dateKey)
  return label.replace('Nhật ký ', 'Nhật ký — ')
}

export function getDefaultJournalPromptLines() {
  return [
    'Hôm nay bạn đang nghĩ gì?',
    '3 việc cần làm',
    'Điều cần nhớ'
  ]
}
