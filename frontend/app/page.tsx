'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [health, setHealth] = useState<string | null>(null)

  const checkHealth = async () => {
    setHealth('Checking...')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/health`)
      const data = await res.json()
      if (res.ok) {
        setHealth('✅ System Healthy')
      } else {
        setHealth('❌ System Error')
      }
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth('❌ Cannot connect to backend')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 sm:px-6 relative">
      {/* Title */}
      <div className="text-center mb-12">
        <h1
          className="text-5xl sm:text-8xl font-bold mb-6 tracking-wide text-purple-400 drop-shadow-2xl"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          QUERYCRAFT
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Your intelligent assistant for document search and database queries. 
          Upload documents, configure databases, and ask questions in natural language.
        </p>
      </div>

      {/* Main Action - Query */}
      <div className="mb-8 w-full max-w-md">
        <button
          onClick={() => router.push('/query')}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl sm:text-2xl font-bold py-5 rounded-2xl transition-all duration-300 shadow-2xl transform hover:scale-105 hover:shadow-purple-500/25"
        >
          🚀 Start Querying
        </button>
      </div>

      {/* Management Section */}
      <div className="w-full max-w-4xl">
        <h2 className="text-center text-2xl font-semibold text-purple-300 mb-6">Management Tools</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Document Management */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-xl font-semibold text-purple-300 mb-2">Documents</h3>
              <p className="text-gray-400 text-sm">Manage your document collection</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/upload')}
                className="w-full bg-purple-600/80 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Upload
              </button>
              <button
                onClick={() => router.push('/list-docs')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                View All
              </button>
              <button
                onClick={() => router.push('/delete')}
                className="w-full bg-red-600/80 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🗄️</div>
              <h3 className="text-xl font-semibold text-purple-300 mb-2">Databases</h3>
              <p className="text-gray-400 text-sm">Configure database connections</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/add-db')}
                className="w-full bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Add Database
              </button>
              <button
                onClick={() => router.push('/list-dbs')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                List Databases
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold text-purple-300 mb-2">System</h3>
              <p className="text-gray-400 text-sm">Monitor system health</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={checkHealth}
                className="w-full bg-green-600/80 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Check Health
              </button>
              {health && (
                <div className="text-center text-sm font-medium p-2 rounded-lg bg-gray-900/50">
                  {health}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>QueryCraft - Intelligent Document & Database Assistant</p>
      </div>
    </div>
  )
}