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
      const res = await fetch(`${apiUrl}/list-docs`);

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
    <div className="min-h-screen flex flex-col items-center justify-start bg-purple-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-extrabold text-purple-900 mb-4">QUERYCRAFT</h1>
        <p className="text-gray-700 mb-6">
          All uploaded documents available for querying.
        </p>

        <div className="mb-4">
          <button
            onClick={fetchDocs}
            className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-gray-800">Loading documents...</p>}
        {error && <p className="text-red-600 font-medium">{error}</p>}

        {!loading && docs.length === 0 && !error && (
          <p className="text-gray-500 italic">No documents found.</p>
        )}

        {docs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Document ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, idx) => (
                  <tr key={doc.document_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-b">{doc.document_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-b">{doc.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-b">{doc.uploaded_at || '-'}</td>
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
