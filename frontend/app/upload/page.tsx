'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    setMessage('Uploading...')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/upload-doc`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Uploaded! Document ID: ${data.document_id}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (e) {
      setMessage('❌ Upload failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 text-white">
      <h1 className="text-4xl sm:text-5xl font-bold text-purple-400 mb-6">Upload Document</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="mb-4 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
      />
      <button
        onClick={handleUpload}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Upload
      </button>
      {message && <p className="mt-4 text-purple-300">{message}</p>}
    </div>
  )
}
