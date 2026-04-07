'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [filtroSub, setFiltroSub] = useState('Todas')
  const [loading, setLoading] = useState(true)

  const subespeciesMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function carregarRecordes() {
      const { data } = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregarRecordes()
  }, [])

  const dadosFiltrados = recordes.filter(r => {
    const termo = busca.toLowerCase()
    const bateBusca = r.nome_pescador.toLowerCase().includes(termo) || r.cidade.toLowerCase().includes(termo)
    const bateEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const bateSub = filtroSub === 'Todas' || r.subespecie === filtroSub
    return bateBusca && bateEspecie && bateSub
  })

  const categoriasUnicas = Array.from(new Set(dadosFiltrados.map(r => `${r.grupo_especie}|${r.modalidade_tipo}`)))

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Hall da Fama</h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-80 uppercase">Trilhas do Rio Fishing Team</p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        
        <div className="flex justify-end mb-4">
          <a href="/ranking-lista" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase italic text-xs shadow-lg hover:bg-black hover:text-yellow-400 transition-all border-2 border-black">
            📊 Ver Ranking em Tabela
          </a>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-12 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="🔍 Nome ou Cidade..." 
              className="p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-medium"
              onChange={(e) => setBusca(e.target.value)}
            />
            
            <select 
              onChange={(e) => { setFiltroEspecie(e.target.value); setFiltroSub('Todas'); }}
              className="p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-bold"
            >
              <option value="Todas">Todas as Espécies</option>
              {Object.keys(subespeciesMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>

            <select 
              disabled={filtroEspecie === 'Todas'}
              onChange={(e) => setFiltroSub(e.target.value)}
              className={`p-3 border-2 rounded-lg outline-none font-bold ${filtroEspecie === 'Todas' ? 'bg-gray-200 text-gray-400' : 'bg-gray-50 border-yellow-400'}`}
            >
              <option value="Todas">Subespécie (Todas)</option>
              {filtroEspecie !== 'Todas' && subespeciesMap[filtroEspecie].map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-20 font-black text-gray-400 animate-pulse uppercase">Carregando...</div>
        ) : (
          <div className="space-y-16">
            {categoriasUnicas.map((catKey) => {
              const [grupo, modalidade] = catKey.split('|')
              const peixesDaCat = dadosFiltrados.filter(r => r.grupo_especie === grupo && r.modalidade_tipo === modalidade)
              
              const rankingPB: any[] = []
              const pescadoresVistos = new Set()
              peixesDaCat.forEach(p => {
                if (!pescadoresVistos.has(p.nome_pescador)) {
                  rankingPB.push(p)
                  pescadoresVistos.add(p.nome_pescador)
                }
              })

              return (
                <section key={catKey} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 skew-x-[-10deg]">
                      {grupo} <span className="text-white opacity-50 ml-2 text-sm">{modalidade}</span>
                    </h2>
                    <div className="flex-1 h-1 bg-yellow-400"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {rankingPB.map((item, index) => (
                      <div key={item.id} className={`bg-white rounded-2xl overflow-hidden shadow-xl border-2 transition-transform hover:scale-[1.01] ${index === 0 ? 'border-yellow-400 ring-4 ring-yellow-400/10' : 'border-gray-100'}`}>
                        <div className="relative h-56 bg-gray-200">
                          <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Peixe" />
                          <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-4 py-1 rounded-full font-black text-xl border-2 border-yellow-400 shadow-2xl">
                            {item.tamanho_cm}cm
                          </div>
                        </div>
