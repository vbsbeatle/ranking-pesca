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
      const { data, error } = await supabase
        .from('recordes')
        .select('*')
        .order('tamanho_cm', { ascending: false })
      
      if (!error && data) setRecordes(data)
      setLoading(false)
    }
    carregarRecordes()
  }, [])

  const recordesFiltrados = recordes.filter((r) => {
    const matchesBusca = r.nome_pescador.toLowerCase().includes(busca.toLowerCase()) || 
                         r.cidade.toLowerCase().includes(busca.toLowerCase())
    const matchesEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    return matchesBusca && matchesEspecie
  })

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* CABEÇALHO */}
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 shadow-2xl text-center">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          Ranking de Recordes
        </h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-80">
          TRILHAS DO RIO FISHING TEAM
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        {/* BUSCA E FILTROS */}
        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="🔍 Buscar Pescador ou Cidade..." 
            className="w-full p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-medium"
            onChange={(e) => setBusca(e.target.value)}
          />
          <select 
            onChange={(e) => setFiltroEspecie(e.target.value)}
            className="w-full p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-bold"
          >
            <option value="Todas">Todas as Espécies</option>
            <option value="Tucunaré">Tucunaré</option>
            <option value="Dourado">Dourado</option>
            <option value="Traíra">Traíra</option>
            <option value="Trairão">Trairão</option>
          </select>
          <div className="flex items-center justify-center bg-yellow-400 rounded-lg font-black text-sm uppercase p-3 shadow-inner">
            {recordesFiltrados.length} Registros
          </div>
        </section>

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 font-black text-gray-400 animate-pulse uppercase tracking-widest">
            Carregando Ranking...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recordesFiltrados.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 group">
                <div className="relative h-64">
                  <img 
                    src={r.url_foto_captura} 
                    alt="Peixe" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black text-yellow-400 px-4 py-2 rounded-full font-black text-xl border-2 border-yellow-400 shadow-2xl">
                    {r.tamanho_cm} <span className="text-xs italic">cm</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-yellow-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                      {r.subespecie}
                    </span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded uppercase">
                      {r.modalidade_tipo}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase italic leading-none">{r.nome_pescador}</h3>
                  <p className="text-gray-500 text-sm mt-2 font-medium">
                    📍 {r.cidade}, {r.estado}
                  </p>
                  <p className="text-gray-400 text-[10px] uppercase font-bold mt-1">
                    Ambiente: {r.modalidade_ambiente}
                  </p>

                  <button 
                    onClick={() => window.open(r.url_foto_medicao, '_blank')}
                    className="w-full mt-6 border-2 border-black hover:bg-black hover:text-yellow-400 text-black font-black py-2 rounded-lg text-xs transition-all uppercase tracking-widest"
                  >
                    Ver Foto da Medição
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENSAGEM SE NÃO ACHAR NADA */}
        {!loading && recordesFiltrados.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-
