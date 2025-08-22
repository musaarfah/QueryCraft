'use client'

import { useState } from 'react'

interface Source {
  document_id: string
  source: string
  chunk_index: number
  score: number
}

interface UnstructuredResponse {
  answer: string
  sources: Source[]
  type?: 'unstructured'
}

interface StructuredResponse {
  type: 'structured'
  db: string
  sql: string
  rows: any[]
  params?: any[]
  error?: string
}

type QueryResponse = UnstructuredResponse | StructuredResponse

export default function QueryPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getResponseType = (resp: any): 'structured' | 'unstructured' => {
    if (resp.type === 'structured' || (resp.sql && resp.rows && resp.db)) return 'structured'
    if (resp.answer && resp.sources) return 'unstructured'
    return resp.type || 'unstructured'
  }

  const renderUnstructuredResponse = (data: UnstructuredResponse) => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Document-based Answer</h3>
        <p className="text-gray-800 leading-relaxed">{data.answer}</p>
      </div>

      {data.sources.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Sources ({data.sources.length})</h4>
          <div className="space-y-3">
            {data.sources.map((source, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-md p-4">
                <p className="font-medium text-gray-900">{source.source}</p>
                <p className="text-sm text-gray-600">
                  Document ID: {source.document_id} • Chunk: {source.chunk_index} • Score: {source.score.toFixed(3)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStructuredResponse = (data: StructuredResponse) => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-4">Database Query Result ({data.db})</h3>

        {data.error ? (
          <div className="text-red-600">{data.error}</div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">Generated SQL:</p>
            <code className="block bg-gray-100 p-3 rounded text-sm font-mono">{data.sql}</code>

            <p className="text-sm text-gray-600 mt-4 mb-2">Results ({data.rows?.length || 0} rows):</p>
            {data.rows && data.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data.rows[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm text-gray-800 border-b">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No results found</p>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-2">QUERYCRAFT</h1>
        <p className="text-gray-700 mb-6">
          Query your uploaded documents and generate query output from natural language statements against your databases.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full p-6 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            rows={4}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Query'}
          </button>
        </form>

        {error && <div className="text-red-600 mt-4 font-medium">{error}</div>}

        {response && (
          <div className="mt-8">
            {getResponseType(response) === 'unstructured'
              ? renderUnstructuredResponse(response as UnstructuredResponse)
              : renderStructuredResponse(response as StructuredResponse)}
          </div>
        )}
      </div>
    </div>
  )
}
