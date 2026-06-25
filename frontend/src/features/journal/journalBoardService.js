/**
 * journalBoardService.js
 * Manages journal boards metadata via local storage recent boards list
 */

import { getLocalTodayKey, getLocalYesterdayKey, formatJournalLabel } from './journalDate'

const STORAGE_KEY = 'infininote-recent-boards'

function getBoards() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      return []
    }
  }
  return []
}

function saveBoards(boards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
}

export function findJournalBoardByDate(dateKey) {
  const boards = getBoards()
  return boards.find(b => b.boardType === 'journal' && b.journalDate === dateKey)
}

export function createJournalBoardForDate(dateKey) {
  const boards = getBoards()
  const id = `board_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const newBoard = { 
    id, 
    title: formatJournalLabel(dateKey), 
    lastAccessed: Date.now(),
    boardType: 'journal',
    journalDate: dateKey,
    journalLabel: formatJournalLabel(dateKey)
  }
  
  const updated = [newBoard, ...boards]
  saveBoards(updated)
  return newBoard
}

export function getOrCreateTodayJournalBoard() {
  let board = findJournalBoardByDate(getLocalTodayKey())
  if (!board) {
    board = createJournalBoardForDate(getLocalTodayKey())
  }
  return board
}

export function getOrCreateYesterdayJournalBoard() {
  let board = findJournalBoardByDate(getLocalYesterdayKey())
  if (!board) {
    board = createJournalBoardForDate(getLocalYesterdayKey())
  }
  return board
}

export function getRecentJournalBoards(limit = 7) {
  const boards = getBoards()
  const journals = boards.filter(b => b.boardType === 'journal')
  // Sort descending by date (using journalDate string works because YYYY-MM-DD is lexicographically sortable)
  journals.sort((a, b) => b.journalDate.localeCompare(a.journalDate))
  return journals.slice(0, limit)
}
