'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarRecordes() {
      try {
        const { data, error } = await supabase
          .from('recordes')
          .select('*')
          .order('tamanho_cm', { ascending: false })
        
        if (data) setRecordes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    carregarRecordes()
  }, [])

  // Lógica de filtro simplificada para evitar erros de compilação
  const filtrados = recordes.filter((r) => {
    const nome = r.nome_pescador?.toLowerCase() || ''
    const cidade = r.cidade?.toLowerCase() || ''
    const termo = busca.toLowerCase()
    
    const bateBusca = nome.includes(termo) || cidade.includes(termo)
    const bateEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    
    return bateBusca && bateEspecie
  })

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* TOPO PRETO E AMARELO */}
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          Ranking de Recordes
        </h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-75">
          TRILHAS DO RIO FISHING TEAM
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        {/* BUSCA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <input 
            type="text" 
            placeholder="🔍 Nome ou Cidade..." 
            className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg outline-none focus:border-yellow-400"
            onChange={(e) => setBusca(e.target.value)}
          />
          <select 
            className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg font-bold"
            onChange={(e) => setFiltroEspecie(e.target.value)}
          >
            <option value="Todas">Todas as Espécies</option>
            <option value="Tucunaré">Tucunaré</option>
            <option value="Dourado">Dourado</option>
            <option value="Traíra">Traíra</option>
            <option value="Trairão">Trairão</option>
          </select>
          <div className="bg-yellow-400 p-4 rounded-xl shadow-lg flex items-center justify-center font-black uppercase text-sm">
            {filtrados.length} Recordes
          </div>
        </div>

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 font-bold text-gray-400 animate-pulse">CARREGANDO...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtrados.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="relative h-64 bg-gray-200">
                  <img 
                    src={item.url_foto_captura} 
                    alt="Peixe" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black text-yellow-400 px-4 py-2 rounded-full font-black text-xl border-2 border-yellow-400">
                    {item.tamanho_cm}cm
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-yellow-400 text-[10px] font-black px-2 py-1 rounded uppercase">
                      {item.subespecie}
                    </span>
                    <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-1 rounded uppercase">
                      {item.modalidade_tipo}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase italic">{item.nome_pescador}</h3>
                  <p className="text-gray-500 text-sm mt-1">📍 {item.cidade}, {item.estado}</p>

                  <button 
                    onClick={() => window.open(item.url_foto_medicao, '_blank')}
                    className="w-full mt-6 bg-black text-yellow-400 font-bold py-3 rounded-lg text-xs uppercase hover:bg-gray-800 transition"
                  >
                    Ver Prova (Medição)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-bold italic uppercase border-4 border-dashed rounded-3xl">
            Nenhum registro encontrado
          </div>
        )}
      </main>

      <footer className="bg-black text-gray-600 py-10 text-center text-[10px] font-bold tracking-widest uppercase">
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
