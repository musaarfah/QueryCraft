'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [health, setHealth] = useState<string | null>(null)

  const checkHealth = async () => {
    setHealth('Checking...')
    try {
      const res = await fetch('http://localhost:8000/health')
      const data = await res.json()
      if (res.ok) {
        setHealth(`OK - Collection: ${data.collection}`)
      } else {
        setHealth(`Error: ${data.error}`)
      }
    } catch {
      setHealth('Error connecting to backend')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
      <h1 className="text-6xl font-extrabold text-purple-900 mb-12 tracking-wide">
        QUERYCRAFT
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-xl w-full">
        <button
          onClick={checkHealth}
          className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Health
        </button>

        <button
          onClick={() => router.push('/list-docs')}
          className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          List
        </button>

        <button
          onClick={() => router.push('/upload')}
          className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Upload
        </button>

        <button
          onClick={() => router.push('/delete')}
          className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Delete
        </button>

        <button
          onClick={() => router.push('/query')}
          className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Query
        </button>
      </div>

      {health && (
        <div className="mt-6 text-gray-800 font-medium">
          {health}
        </div>
      )}
    </div>
  )
}
