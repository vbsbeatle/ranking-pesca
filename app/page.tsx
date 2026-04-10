'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [loading, setLoading] = useState(true)
  
  // Controle da caixa de membros
  const [mostrarMembros, setMostrarMembros] = useState(false)

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function carregar() {
      const { data: r } = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (r) setRecordes(r)
      const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (p) setMembros(p)
      setLoading(false)
    }
    carregar()
  }, [])

  // Filtra apenas o MAIOR de cada subespécie para o Hall da Fama
  const vistos = new Set()
  const listaRecordistas = recordes
    .filter(r => {
      const matchBusca = (r.nome_pescador || "").toLowerCase().includes(busca.toLowerCase())
      const matchEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
      return matchBusca && matchEsp
    })
    .filter(item => {
      const chave = `${item.grupo_especie}-${item.subespecie}`
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* CABEÇALHO */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <a href="/">
              <img src="/logo-tr.jpg" alt="Logo" className="h-24 md:h-36 w-auto rounded-xl border-2 border-yellow-400/20 shadow-2xl transition-transform hover:scale-105" />
            </a>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
              Hall da <span className="text-yellow-400">Fama</span>
            </h1>
            <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mt-2 opacity-80">
              Trilhas do Rio <span className="text-yellow-400">Pesca Esportiva</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        
        {/* BOTÕES DE ACESSO RÁPIDO */}
        <div className="flex flex-col sm:flex-row justify-end mb-6 gap-3">
          <a 
            href="https://forms.gle/Y6L88Vk7wdZv8spw9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-white hover:bg-black transition-all text-center"
          >
            🎯 Registre sua captura aqui
          </a>
          <a 
            href="/ranking-lista" 
            className="bg-yellow-400 text-black px-6 py-3 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-black hover:bg-black hover:text-yellow-400 transition-all text-center"
          >
            📊 Ranking Completo
          </a>
        </div>

        {/* FILTROS DE BUSCA */}
        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="🔍 Buscar Pescador..." 
            className="p-3 bg-gray-50 border-2 rounded-lg font-bold outline-none focus:border-yellow-400" 
            onChange={(e) => setBusca(e.target.value)} 
          />
          <select 
            onChange={(e) => setFiltroEspecie(e.target.value)} 
            className="p-3 bg-gray-50 border-2 rounded-lg font-black text-sm"
          >
            <option value="Todas">Todas as Famílias</option>
            {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </section>

        {/* SELETOR DE MEMBROS (CAIXA RETRÁTIL) */}
        <section className="mb-12">
          <button 
            onClick={() => setMostrarMembros(!mostrarMembros)}
            className="w-full bg-white border-2 border-gray-200 p-4 rounded-xl shadow-md flex justify-between items-center hover:border-yellow-400 transition-all group"
          >
            <span className="font-black uppercase italic text-xs tracking-widest text-gray-500 group-hover:text-black">
              {mostrarMembros ? '▲ Fechar Lista de Pescadores' : '▼ Ver Perfis dos Pescadores'}
            </span>
            <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
              {membros.length} Ativos
            </span>
          </button>

          {mostrarMembros && (
            <div className="mt-4 p-6 bg-white border-2 border-yellow-400 rounded-2xl shadow-2xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2">
              {membros.map(m => (
                <a 
                  key={m.id} 
                  href={`/pescador/${encodeURIComponent(m.nome_completo)}`}
                  className="bg-gray-50 hover:bg-black hover:text-yellow-400 p-3 rounded-lg text-[9px] font-black uppercase text-center transition-all border border-gray-100 shadow-sm"
                >
                  {m.nome_completo}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* GRID DE RECORDES */}
        {loading ? (
          <div className="text-center py-20 font-black text-gray-300 animate-pulse uppercase tracking-widest">Sincronizando Recordes...</div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 shadow-lg skew-x-[-10deg]">
                Recordes Atuais
              </h2>
              <div className="flex-1 h-1 bg-yellow-400"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listaRecordistas.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-yellow-400 transition-all hover:scale-[1.02]">
                  <div className="relative h-64 bg-gray-200">
                    <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Foto Troféu" />
                    <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-5 py-2 rounded-full font-black text-2xl border-2 border-yellow-400 shadow-2xl">
                      {item.tamanho_cm}cm
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                       <span className="text-2xl font-black uppercase italic leading-none block">{item.grupo_especie}</span>
                       <span className="text-xs font-black text-yellow-600 uppercase tracking-[0.2em]">{item.subespecie}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Pescador Recordista</p>
                      <a href={`/pescador/${encodeURIComponent(item.nome_pescador)}`} className="text-xl font-bold uppercase hover:text-yellow-600 leading-tight block mb-4">
                        {item.nome_pescador}
                      </a>
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                         <span>📍 {item.local_captura || item.cidade}</span>
                         <a href={`/captura/${item.id}`} className="bg-black text-yellow-400 px-3 py-1 rounded font-black hover:bg-yellow-400 hover:text-black transition-colors">
                           Ver Certificado
                         </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {listaRecordistas.length === 0 && (
              <p className="text-center py-10 text-gray-400 font-bold uppercase italic">Nenhum peixe encontrado com esses critérios.</p>
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
