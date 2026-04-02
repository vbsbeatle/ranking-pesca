'use client'
import React, { useState } from 'react'

export default function AdminPage() {
  const [status, setStatus] = useState('')

  const handleTest = () => {
    setStatus('O painel de administrador está funcionando! No próximo passo faremos o envio das fotos.')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-4 border-yellow-400">
        <div className="bg-black p-4">
          <h1 className="text-yellow-400 font-black uppercase italic">Painel do Capitão</h1>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Área de cadastro do Trilhas do Rio Fishing Team.</p>
          
          <button 
            onClick={handleTest}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded uppercase hover:bg-yellow-500 transition shadow-md"
          >
            Testar Sistema
          </button>

          {status && (
            <p className="mt-4 p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200 font-bold">
              ✅ {status}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
