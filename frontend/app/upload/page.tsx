'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [message, setMessage] = useState('')

  const handleUpload = async () => {
    if (!files || files.length === 0) return
    if (files.length > 100) {
      setMessage('❌ Too many files. Max 100.')
      return
    }
    const formData = new FormData()
    // Use "files" key for batch endpoint
    Array.from(files).forEach(f => formData.append('files', f))

    setMessage('Uploading...')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/upload-docs`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        const ok = (data.results || []).filter((r: any) => r.ok)
        const errs = (data.results || []).filter((r: any) => !r.ok)
        const okMsg = ok.length ? `✅ ${ok.length} file(s) queued` : ''
        const errMsg = errs.length ? `❌ ${errs.length} failed` : ''
        setMessage([okMsg, errMsg].filter(Boolean).join(' · '))
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
        multiple
        onChange={(e) => setFiles(e.target.files)}
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
