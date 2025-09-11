"use client"

import { useEffect, useState } from "react"

interface Prompts {
  [key: string]: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompts>({})
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [newValue, setNewValue] = useState("")

  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!  // put same as .env backend

  // Fetch prompts from backend
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prompts`, {
          headers: { "X-ADMIN-KEY": ADMIN_KEY }
        })
        const data = await res.json()
        setPrompts(data)
      } catch (err) {
        console.error("Error fetching prompts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [])

  const handleUpdate = async (key: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update_prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ADMIN-KEY": ADMIN_KEY,
        },
        body: JSON.stringify({ key, value: newValue }),
      })

      if (res.ok) {
        const updated = await res.json()
        setPrompts(updated.prompts)
        setEditKey(null)
      } else {
        alert("Failed to update prompt")
      }
    } catch (err) {
      console.error("Error updating prompt:", err)
    }
  }

  if (loading) return <p>Loading prompts...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Prompts Admin</h1>
      <ul className="space-y-4">
        {Object.entries(prompts).map(([key, value]) => (
          <li key={key} className="p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold">{key}</h2>
            {editKey === key ? (
              <div>
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleUpdate(key)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditKey(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {value}
                </pre>
                <button
                  onClick={() => {
                    setEditKey(key)
                    setNewValue(value)
                  }}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  Update
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
