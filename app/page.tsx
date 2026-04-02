'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Trophy, MapPin, Ruler } from 'lucide-react'

export default function Home() {
  const [recordes, setRecordes] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [loading, setLoading] = useState(true)

  // Buscar recordes no banco de dados
  useEffect(() => {
    async function carregarRecordes() {
      const { data, error } = await supabase
        .from('recordes')
        .select('*')
        .order('tamanho_cm', { ascending: false }) // Ranking pelo maior peixe
      
      if (!error) setRecordes(data as any)
      setLoading(false)
    }
    carregarRecordes()
  }, [])

  // Lógica de filtro
  const recordesFiltrados = recordes.filter((r: any) => {
    const matchesBusca = r.nome_pescador.toLowerCase().includes(busca.toLowerCase()) || 
                         r.cidade.toLowerCase().includes(busca.toLowerCase())
    const matchesEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    return matchesBusca && matchesEspecie
  })

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* Cabeçalho Estilo Competição */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Ranking de Recordes
          </h1>
          <p className="mt-2 text-white font-bold tracking-widest opacity-80">
            TRILHAS DO RIO FISHING TEAM
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-8">
        {/* Barra de Filtros */}
        <section className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pescador ou Cidade..." 
              className="w-full pl-10 p-2 bg-gray-50 border rounded-lg outline-none focus:border-yellow-400"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select 
            onChange={(e) => setFiltroEspecie(e.target.value)}
            className="p-2 bg-gray-50 border rounded-lg outline-none focus:border-yellow-400 font-bold"
          >
            <option value="Todas">Todas as Espécies</option>
            <option value="Tucunaré">Tucunaré</option>
            <option value="Dourado">Dourado</option>
            <option value="Traíra">Traíra</option>
            <option value="Trairão">Trairão</option>
          </select>
          <div className="flex items-center justify-center bg-yellow-400 rounded-lg font-black text-xs uppercase tracking-wider">
            {recordesFiltrados.length} Recordes Encontrados
          </div>
        </section>

        {/* Listagem de Cards */}
        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse">CARREGANDO RANKING...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recordesFiltrados.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 group">
                {/* Imagem com Badge de Tamanho */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={r.url_foto_captura} 
                    alt="Captura" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black text-yellow-400 px-4 py-2 rounded-full font-black text-xl shadow-xl border-2 border-yellow-400">
                    {r.tamanho_cm} <span className="text-xs">cm</span>
                  </div>
                </div>

                {/* Detalhes do Recorde */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {r.subespecie}
                    </span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      {r.modalidade_tipo}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase italic truncate">{r.nome_pescador}</h3>
