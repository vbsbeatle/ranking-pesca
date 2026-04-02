'use client'
import React, { useState } from 'react'

export default function AdminPage() {
  const [status, setStatus] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('Sistema pronto! No próximo passo ligaremos o banco de dados.')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-4 border-yellow-400">
        <div className="bg-black p-4">
          <h1 className="text-yellow-400 font-black uppercase italic">Painel de Recordes</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Área de cadastro em construção.</p>
          
          <button 
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded uppercase hover:bg-yellow-500 transition"
          >
            Testar Conexão
          </button>

          {status && (
            <p className="mt-4 p-2 bg-green-100 text-green-700 text-xs rounded border border-green-200">
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
