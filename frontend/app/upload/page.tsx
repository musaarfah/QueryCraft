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
      const res = await fetch('http://localhost:8000/upload-doc', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Uploaded! Document ID: ${data.document_id}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (e) {
      setMessage('Upload failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 px-4">
      <h1 className="text-4xl font-bold text-purple-900 mb-6">Upload Document</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-purple-400 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Upload
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
