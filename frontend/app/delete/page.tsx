'use client'

import { useState } from 'react'

export default function DeletePage() {
  const [docId, setDocId] = useState('')
  const [message, setMessage] = useState('')

  const handleDelete = async () => {
    if (!docId.trim()) return
    setMessage('Deleting...')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/delete-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Deleted Document: ${data.deleted_document_id}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (e) {
      setMessage('❌ Deletion failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 text-white">
      <h1 className="text-4xl sm:text-5xl font-bold text-purple-400 mb-6">Delete Document</h1>
      <input
        type="text"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
        placeholder="Enter Document ID"
        className="mb-4 p-3 bg-gray-900 border border-gray-700 rounded w-full max-w-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      <button
        onClick={handleDelete}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Delete
      </button>
      {message && <p className="mt-4 text-purple-300">{message}</p>}
    </div>
  )
}
