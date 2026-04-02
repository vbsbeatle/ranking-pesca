'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  
  // Lista de espécies que você forneceu
  const especies = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    
    // Aqui o código enviaria os dados para o Supabase (vamos refinar no próximo passo)
    alert("Formulário pronto para enviar! No próximo passo vamos conectar o salvamento de fotos.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden border-b-8 border-yellow-400">
        <header className="bg-black text-yellow-400 p-6">
          <h1 className="text-2xl font-black italic uppercase">Cadastrar Novo Recorde</h1>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500">Nome do Pescador</label>
            <input name="pescador" required className="w-full p-2 border-2 border-gray-200 rounded focus:border-yellow-400 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Espécie</label>
              <select name="grupo" className="w-full p-2 border-2 border-gray-200 rounded">
                {Object.keys(especies).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Tamanho (cm)</label>
              <input name="tamanho" type="number" step="0.1" required className="w-full p-2 border-2 border-gray-200 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Foto da Captura</label>
              <input type="file" accept="image/*" className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Foto da Medição</label>
              <input type="file" accept="image/*" className="text-sm" />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-black text-yellow-400 font-black py-4 rounded hover:bg-gray-900 transition tracking-widest uppercase"
          >
            {loading ? 'Enviando...' : 'Registrar Recorde'}
          </button>
        </form>
      </div>
    </div>
  )
}
