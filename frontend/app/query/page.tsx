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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/query`, {
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
      <div className="bg-gray-800 border border-purple-600 rounded-lg p-6">
        <h3 className="font-semibold text-purple-400 mb-4">Document-based Answer</h3>
        <p className="text-gray-200 leading-relaxed">{data.answer}</p>
      </div>
      {data.sources.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h4 className="font-semibold text-purple-300 mb-4">Sources ({data.sources.length})</h4>
          <div className="space-y-3">
            {data.sources.map((source, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <p className="font-medium text-gray-200">{source.source}</p>
                <p className="text-sm text-gray-400">
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
      <div className="bg-gray-800 border border-purple-600 rounded-lg p-6">
        <h3 className="font-semibold text-purple-400 mb-4">Database Query Result ({data.db})</h3>
        {data.error ? (
          <div className="text-red-400">{data.error}</div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-2">Generated SQL:</p>
            <code className="block bg-gray-900 p-3 rounded text-sm font-mono text-gray-200">{data.sql}</code>
            <p className="text-sm text-gray-400 mt-4 mb-2">Results ({data.rows?.length || 0} rows):</p>
            {data.rows && data.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(data.rows[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-sm font-semibold text-purple-300 border-b border-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm border-b border-gray-700">{String(value)}</td>
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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-12 text-white">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-4">QUERYCRAFT</h1>
        <p className="text-gray-300 mb-6">
          Query your uploaded documents and generate query output from natural language statements against your databases.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full p-6 text-lg bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-white"
            disabled={loading}
            rows={4}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Query'}
          </button>
        </form>
        {error && <div className="text-red-400 mt-4 font-medium">{error}</div>}
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
