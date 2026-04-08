'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [loading, setLoading] = useState(true)

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .order('tamanho_cm', { ascending: false })
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregar()
  }, [])

  // 1. Filtragem inicial baseada na busca e espécie selecionada
  const filtrados = recordes.filter(r => {
    const matchBusca = (r.nome_pescador || "").toLowerCase().includes(busca.toLowerCase()) || 
                      (r.cidade || "").toLowerCase().includes(busca.toLowerCase())
    const matchEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    return matchBusca && matchEsp
  })

  // 2. Lógica para extrair apenas o MAIOR de cada (Espécie + Subespécie)
  const recordesPorSubespecie: any[] = []
  const subespeciesVistas = new Set()

  filtrados.forEach(item => {
    const chaveUnica = `${item.grupo_especie}-${item.subespecie}`
    if (!subespeciesVistas.has(chaveUnica)) {
      recordesPorSubespecie.push(item)
      subespeciesVistas.add(chaveUnica)
    }
  })

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* CABEÇALHO CENTRALIZADO COM LOGO */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <a href="/">
              <img 
                src="/logo-tr.jpg" 
                alt="Logo Trilhas do Rio" 
                className="h-24 md:h-36 w-auto rounded-xl border-2 border-yellow-400/20 shadow-2xl transition-transform hover:scale-105" 
              />
            </a>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Hall da Fama
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
              <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs opacity-80">
                Trilhas do Rio
              </p>
              <span className="hidden md:inline text-yellow-400 text-xs">•</span>
              <p className="text-yellow-400 font-black tracking-[0.3em] uppercase text-[10px] md:text-xs">
                Pesca Esportiva
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        {/* LINKS RÁPIDOS */}
        <div className="flex justify-end mb-4 gap-2">
          <a href="/ranking-lista" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-black hover:bg-black hover:text-yellow-400 transition-all">
            📊 Ranking Completo
          </a>
        </div>

        {/* FILTROS DE BUSCA */}
        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="🔍 Buscar Pescador ou Cidade..." 
            className="p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-bold"
            onChange={(e) => setBusca(e.target.value)} 
          />
          <select 
            onChange={(e) => setFiltroEspecie(e.target.value)} 
            className="p-3 bg-gray-50 border-2 rounded-lg font-black"
          >
            <option value="Todas">Todas as Famílias (Tucunarés, Traíras...)</option>
            {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </section>

        {/* EXIBIÇÃO DOS RECORDES ATUAIS */}
        {loading ? (
          <div className="text-center py-20 font-black text-gray-300 animate-pulse uppercase">Carregando Recordes Atuais...</div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 shadow-lg skew-x-[-10deg]">
                Recordes por Subespécie
              </h2>
              <div className="flex-1 h-1 bg-yellow-400"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recordesPorSubespecie.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-yellow-400 ring-4 ring-yellow-400/5 transition-all hover:scale-[1.02]">
                  <div className="relative h-64 bg-gray-200">
                    <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Foto do Recorde" />
                    <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded font-black text-[10px] uppercase shadow-md">
                      RECORDE ATUAL
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-5 py-2 rounded-full font-black text-2xl border-2 border-yellow-400 shadow-2xl">
                      {item.tamanho_cm}cm
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col mb-6">
                       <span className="text-2xl font-black uppercase italic leading-none">{item.grupo_especie}</span>
                       <span className="text-sm font-black text-yellow-600 uppercase tracking-[0.2em] mt-1">
                         {item.subespecie}
                       </span>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pescador Recordista</p>
                      <a href={`/pescador/${encodeURIComponent(item.nome_pescador)}`} className="text-xl font-bold uppercase hover:text-yellow-600 block leading-tight">
                        {item.nome_pescador}
                      </a>
                      <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                         <span>📍 {item.local_captura || item.cidade}</span>
                         <a href={`/captura/${item.id}`} className="bg-black text-yellow-400 px-3 py-1 rounded font-black hover:bg-yellow-400 hover:text-black transition-colors">
                           DETALHES →
                         </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {recordesPorSubespecie.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-bold uppercase italic">
                Nenhum recorde encontrado para esta busca.
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="bg-black text-gray-700 py-12 text-center text-[10px] font-bold uppercase tracking-[0.4em]">
        © 2026 Trilhas do Rio Pesca Esportiva
      </footer>
    </div>
  )
}
