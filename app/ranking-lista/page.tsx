'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RankingLista() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados dos Filtros
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [filtroSub, setFiltroSub] = useState('Todas')
  const [filtroModalidade, setFiltroModalidade] = useState('Todas')
  const [filtroLocal, setFiltroLocal] = useState('Todas')

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

  // 1. Filtragem (Lógica separada para não bugar o JSX)
  const filtrados = recordes.filter((r) => {
    const mEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const mSub = filtroSub === 'Todas' || r.subespecie === filtroSub
    const mMod = filtroModalidade === 'Todas' || r.modalidade_tipo === filtroModalidade
    const mLoc = filtroLocal === 'Todas' || r.local_captura === filtroLocal
    return mEsp && mSub && mMod && mLoc
  })

  // 2. Lista de locais única (Simplificada)
  const locaisBrutos = recordes.map(r => r.local_captura).filter(l => l)
  const listaLocais = Array.from(new Set(locaisBrutos)).sort()

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <header className="bg-black text-yellow-400 p-8 border-b-8 border-yellow-400 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo-tr.jpg" alt="Logo" className="h-12 rounded border border-yellow-400/30" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Ranking <span className="text-yellow-400">Completo</span></h1>
          </div>
          <a href="/" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-[10px] border-2 border-black hover:bg-white transition-all shadow-lg">
            ← Hall da Fama
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* BARRA DE FILTROS */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Família</label>
              <select 
                onChange={(e) => { setFiltroEspecie(e.target.value); setFiltroSub('Todas'); }} 
                className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-xs outline-none focus:border-yellow-400"
              >
                <option value="Todas">Todas</option>
                {Object.keys(subMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Subespécie</label>
              <select 
                disabled={filtroEspecie === 'Todas'}
                onChange={(e) => setFiltroSub(e.target.value)} 
                className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-xs disabled:opacity-30 outline-none focus:border-yellow-400"
              >
                <option value="Todas">Todas</option>
                {filtroEspecie !== 'Todas' && subMap[filtroEspecie].map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Local da Captura</label>
              <select 
                onChange={(e) => setFiltroLocal(e.target.value)} 
                className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-xs outline-none focus:border-yellow-400"
              >
                <option value="Todas">Todos os Locais</option>
                {listaLocais.map((loc: any) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Modalidade</label>
              <select onChange={(e) => setFiltroModalidade(e.target.value)} className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-xs outline-none focus:border-yellow-400">
                <option value="Todas">Todas</option>
                <option value="Absoluto">Absoluto</option>
                <option value="Privado">Privado</option>
              </select>
            </div>

          </div>
        </section>

        {/* TABELA */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-[10px] font-black uppercase text-gray-500 border-b tracking-[0.2em]">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Pescador</th>
                  <th className="p-4">Peixe / Subespécie</th>
                  <th className="p-4 text-center">Medida</th>
                  <th className="p-4">Localização</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-300 animate-pulse uppercase">Carregando Ranking...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-400 italic uppercase">Nenhum registro encontrado.</td></tr>
                ) : filtrados.map((r, index) => (
                  <tr key={r.id} className="hover:bg-yellow-50 border-b border-gray-100 transition-colors">
                    <td className="p-4 font-black text-gray-300 italic text-lg">#{index + 1}</td>
                    <td className="p-4">
                      <a href={`/pescador/${encodeURIComponent(r.nome_pescador)}`} className="font-black uppercase italic hover:underline decoration-yellow-400 underline-offset-4">
                        {r.nome_pescador}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="font-black block uppercase leading-none">{r.grupo_especie}</span>
                      <span className="text-[10px] text-yellow-600 font-black uppercase tracking-tighter">{r.subespecie}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-black text-yellow-400 px-3 py-1 rounded-lg font-black text-lg shadow-sm">
                        {r.tamanho_cm}cm
                      </span>
                    </td>
                    <td className="p-4 uppercase font-bold text-[10px] text-gray-400">
                      <span className="text-black block font-black">📍 {r.local_captura}</span>
                      {r.cidade}
                    </td>
                    <td className="p-4 text-center">
                      <a href={`/captura/${r.id}`} className="bg-black text-white px-4 py-2 rounded font-black text-[9px] uppercase hover:bg-yellow-400 hover:text-black transition-all shadow-md">
                        Detalhes
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-black text-gray-700 py-12 text-center text-[10px] font-bold uppercase tracking-[0.4em]">
        © 2026 Trilhas do Rio Pesca Esportiva
      </footer>
    </div>
  )
}
