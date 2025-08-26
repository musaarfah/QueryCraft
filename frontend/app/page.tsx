'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [health, setHealth] = useState<string | null>(null)

  const checkHealth = async () => {
    setHealth('Checking...')
    try {
      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/health`)
      const data = await res.json()
      if (res.ok) {
        setHealth('✅ Health OK')
      } else {
        setHealth(`❌ Error`)
      }
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth('❌ Error connecting to backend')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-6">
      {/* Title */}
      <h1 className="text-7xl font-bold mb-12 tracking-wide text-purple-900" style={{ fontFamily: 'Times New Roman, serif' }}>
        QUERYCRAFT
      </h1>

      {/* Buttons Section */}
      <div className="bg-white shadow-xl rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full text-center">
        <button
          onClick={checkHealth}
          className="bg-purple-400 hover:bg-purple-500 text-white text-lg font-semibold py-4 rounded-lg transition-colors"
        >
          Health
        </button>

        <button
          onClick={() => router.push('/list-docs')}
          className="bg-purple-400 hover:bg-purple-500 text-white text-lg font-semibold py-4 rounded-lg transition-colors"
        >
          List
        </button>

        <button
          onClick={() => router.push('/upload')}
          className="bg-purple-400 hover:bg-purple-500 text-white text-lg font-semibold py-4 rounded-lg transition-colors"
        >
          Upload
        </button>

        <button
          onClick={() => router.push('/delete')}
          className="bg-purple-400 hover:bg-purple-500 text-white text-lg font-semibold py-4 rounded-lg transition-colors"
        >
          Delete
        </button>

        <button
          onClick={() => router.push('/query')}
          className="bg-purple-400 hover:bg-purple-500 text-white text-lg font-semibold py-4 rounded-lg transition-colors"
        >
          Query
        </button>
      </div>

      {/* Health Status */}
      {health && (
        <div className="mt-6 text-lg text-purple-800 font-semibold">
          {health}
        </div>
      )}
    </div>
  )
}