import { useState, useEffect } from 'react'
import { HomeView } from './components/home/HomeView'
import { DetailView } from './components/detail/DetailView'
import { PackingView } from './components/packing/PackingView'
import { HistoryView } from './components/history/HistoryView'
import { ImportReviewView } from './components/import/ImportReviewView'
import { parseURL } from './services/importService'
import type { PackingListPayload } from './types'

type Screen =
  | { name: 'home' }
  | { name: 'detail'; listId: number }
  | { name: 'packing'; listId: number }
  | { name: 'history' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [pendingImport, setPendingImport] = useState<PackingListPayload | null>(null)

  // Handle URL scheme on load and navigation
  useEffect(() => {
    function checkURL() {
      const payload = parseURL(window.location.search)
      if (payload) {
        setPendingImport(payload)
        // Clean URL without reloading
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
    checkURL()
    window.addEventListener('popstate', checkURL)
    return () => window.removeEventListener('popstate', checkURL)
  }, [])

  function goDetail(listId: number) { setScreen({ name: 'detail', listId }) }
  function goPacking(listId: number) { setScreen({ name: 'packing', listId }) }

  return (
    <>
      {screen.name === 'home' && (
        <HomeView
          onSelect={goDetail}
          onHistory={() => setScreen({ name: 'history' })}
        />
      )}
      {screen.name === 'detail' && (
        <DetailView
          listId={screen.listId}
          onBack={() => setScreen({ name: 'home' })}
          onPack={() => goPacking(screen.listId)}
        />
      )}
      {screen.name === 'packing' && (
        <PackingView
          listId={screen.listId}
          onBack={() => goDetail(screen.listId)}
          onEdit={() => goDetail(screen.listId)}
        />
      )}
      {screen.name === 'history' && (
        <HistoryView
          onSelect={goDetail}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}
      {pendingImport && (
        <ImportReviewView
          payload={pendingImport}
          onImported={(id) => { setPendingImport(null); goDetail(id) }}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </>
  )
}
