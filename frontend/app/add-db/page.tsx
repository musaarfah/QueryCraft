'use client'

import { useState, useEffect } from 'react'

interface DatabaseConfig {
  name: string
  host: string
  port: number
  dbname: string
  user: string
  password: string
}

export default function AddDbPage() {
  const [config, setConfig] = useState<DatabaseConfig>({
    name: '',
    host: '',
    port: 5432,
    dbname: '',
    user: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [existingDbs, setExistingDbs] = useState<string[]>([])

  // Load existing databases on component mount
  useEffect(() => {
    const fetchExistingDbs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/list_dbs`)
        const data = await res.json()
        if (res.ok && Array.isArray(data.databases)) {
          setExistingDbs(data.databases)
        }
      } catch (err) {
        console.error('Failed to fetch existing databases', err)
      }
    }
    fetchExistingDbs()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!config.name.trim()) {
      setError('Database name is required')
      setLoading(false)
      return
    }
    if (!config.host.trim()) {
      setError('Host is required')
      setLoading(false)
      return
    }
    if (!config.dbname.trim()) {
      setError('Database name is required')
      setLoading(false)
      return
    }
    if (!config.user.trim()) {
      setError('Username is required')
      setLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/add_db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add database')
      }

      setSuccess(`Database "${config.name}" added successfully!`)
      setExistingDbs(data.databases || [])
      
      // Reset form
      setConfig({
        name: '',
        host: '',
        port: 5432,
        dbname: '',
        user: '',
        password: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // You can implement a test connection endpoint in your backend
      // For now, just validate required fields
      if (!config.host.trim() || !config.dbname.trim() || !config.user.trim()) {
        throw new Error('Please fill in host, database name, and username to test connection')
      }
      
      setSuccess('Connection parameters look valid (implement actual test in backend)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-12 text-white">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-4">
            ADD DATABASE
          </h1>
          <p className="text-gray-300">
            Configure a new database connection for SQL queries.
          </p>
        </div>

        {/* Existing Databases */}
        {existingDbs.length > 0 && (
          <div className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-purple-400 font-semibold mb-3">
              Existing Databases ({existingDbs.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {existingDbs.map((db) => (
                <span
                  key={db}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full"
                >
                  {db}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Database Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Database Display Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={config.name}
                onChange={handleInputChange}
                placeholder="e.g., HR, Sales, Inventory"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                A friendly name to identify this database
              </p>
            </div>

            {/* Host */}
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-300 mb-2">
                Host *
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={config.host}
                onChange={handleInputChange}
                placeholder="localhost or IP address"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
            </div>

            {/* Port */}
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                id="port"
                name="port"
                value={config.port}
                onChange={handleInputChange}
                placeholder="5432"
                min="1"
                max="65535"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Default: 5432 (PostgreSQL)
              </p>
            </div>

            {/* Database Name */}
            <div>
              <label htmlFor="dbname" className="block text-sm font-medium text-gray-300 mb-2">
                Database Name *
              </label>
              <input
                type="text"
                id="dbname"
                name="dbname"
                value={config.dbname}
                onChange={handleInputChange}
                placeholder="database_name"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={config.user}
                onChange={handleInputChange}
                placeholder="username"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={config.password}
                onChange={handleInputChange}
                placeholder="password (optional)"
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Adding...' : 'Add Database'}
              </button>
              
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Test Connection
              </button>
            </div>
          </form>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-4 bg-green-900/50 border border-green-600 rounded-lg">
              <p className="text-green-300 font-medium">{success}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            ← Back to Query Page
          </a>
        </div>
      </div>
    </div>
  )
}