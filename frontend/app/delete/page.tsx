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
        setMessage(`Deleted Document: ${data.deleted_document_id}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (e) {
      setMessage('Deletion failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 px-4">
      <h1 className="text-4xl font-bold text-purple-900 mb-6">Delete Document</h1>
      <input
        type="text"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
        placeholder="Enter Document ID"
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      <button
        onClick={handleDelete}
        className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Delete
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
