'use client'

import { useEffect, useState } from 'react'

interface ListResponse {
  databases: string[]
}

export default function ListDbsPage() {
  const [dbs, setDbs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch DBs
  const fetchDbs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/list_dbs`)
      const data: ListResponse = await res.json()
      if (res.ok) {
        setDbs(data.databases)
      } else {
        setError('Failed to fetch databases')
      }
    } catch (err) {
      console.error(err)
      setError('❌ Cannot connect to backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDbs()
  }, [])

  // Delete DB
  const handleDelete = async (dbName: string) => {
    if (!confirm(`Are you sure you want to delete database "${dbName}"?`)) return

    try {
      const res = await fetch(`${apiUrl}/delete_db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dbName }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || `Database ${dbName} deleted.`)
        fetchDbs() // refresh list
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err) {
      console.error(err)
      alert('❌ Error deleting database')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6 text-white">
      <h1 className="text-4xl font-bold text-purple-400 mb-8 text-center">
        Connected Databases
      </h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : dbs.length === 0 ? (
        <p className="text-center text-gray-400">No databases connected yet.</p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {dbs.map((db) => (
            <div
              key={db}
              className="flex items-center justify-between bg-gray-800/60 border border-purple-500/30 p-4 rounded-xl"
            >
              <span className="text-lg font-medium">{db}</span>
              <button
                onClick={() => handleDelete(db)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
