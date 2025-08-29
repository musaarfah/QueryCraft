'use client'

import { useEffect, useState } from 'react'

interface Document {
  document_id: string
  name: string
  uploaded_at?: string
}

export default function ListDocsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDocs = async () => {
    setLoading(true)
    setError('')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/list-docs`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch documents')
      setDocs((data.documents || []).map((doc: string) => ({
        document_id: doc,
        name: doc,
        uploaded_at: '-'
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-12 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-4">QUERYCRAFT</h1>
        <p className="text-gray-300 mb-6">All uploaded documents available for querying.</p>
        <div className="mb-4">
          <button
            onClick={fetchDocs}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Refresh
          </button>
        </div>
        {loading && <p className="text-gray-300">Loading documents...</p>}
        {error && <p className="text-red-400 font-medium">{error}</p>}
        {!loading && docs.length === 0 && !error && (
          <p className="text-gray-500 italic">No documents found.</p>
        )}
        {docs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-purple-300 border-b border-gray-700">Document ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-purple-300 border-b border-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-purple-300 border-b border-gray-700">Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, idx) => (
                  <tr key={doc.document_id} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                    <td className="px-4 py-2 text-sm border-b border-gray-700">{doc.document_id}</td>
                    <td className="px-4 py-2 text-sm border-b border-gray-700">{doc.name}</td>
                    <td className="px-4 py-2 text-sm border-b border-gray-700">{doc.uploaded_at || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
