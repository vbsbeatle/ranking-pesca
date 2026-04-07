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
  const [filtroCidade, setFiltroCidade] = useState('Todas')

  // Mapa de Subespécies (Igual ao do Admin e Home)
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

  // Lógica de Filtragem Combinada
  const filtrados = recordes.filter((r) => {
    const matchEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const matchSub = filtroSub === 'Todas' || r.subespecie === filtroSub
    const matchMod = filtroModalidade === 'Todas' || r.modalidade_tipo === filtroModalidade
    const matchCid = filtroCidade === 'Todas' || r.cidade === filtroCidade
    return matchEsp && matchSub && matchMod && matchCid
  })

  // Listas únicas para os selects
  const listaCidades = Array.from(new Set(recordes.map(r => r.cidade))).sort()

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-black text-yellow-400 p-8 border-b-8 border-yellow-400 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Ranking Geral em Lista</h1>
          <a href="/" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-xs border-2 border-black hover:bg-white transition-all shadow-lg">
            ← Voltar ao Hall da Fama
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* BARRA DE FILTROS REFORÇADA */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ESPÉCIE */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Espécie</label>
              <select 
                onChange={(e) => { setFiltroEspecie(e.target.value); setFiltroSub('Todas'); }} 
                className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-sm focus:border-yellow-400 outline-none"
              >
                <option value="Todas">Todas</option>
                {Object.keys(subMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
            </div>

            {/* SUBESPÉCIE (DINÂMICO) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Subespécie</label>
              <select 
                disabled={filtroEspecie === 'Todas'}
                onChange={(e) => setFiltroSub(e.target.value)} 
                className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-sm disabled:opacity-30 focus:border-yellow-400 outline-none"
              >
                <option value="Todas">Todas</option>
                {filtroEspecie !== 'Todas' && subMap[filtroEspecie].map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* MODALIDADE */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Modalidade</label>
              <select onChange={(e) => setFiltroModalidade(e.target.value)} className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-sm focus:border-yellow-400 outline-none">
                <option value="Todas">Todas</option>
                <option value="Absoluto">Absoluto</option>
                <option value="Privado">Privado</option>
              </select>
            </div>

            {/* CIDADE */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Cidade</label>
              <select onChange={(e) => setFiltroCidade(e.target.value)} className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-sm focus:border-yellow-400 outline-none">
                <option value="Todas">Todas</option>
                {listaCidades.map(cid => <option key={cid} value={cid}>{cid}</option>)}
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
                  <th className="p-4">Local</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-300 animate-pulse">CARREGANDO...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-400 italic">Nenhum recorde nesta categoria.</td></tr>
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
                      <span className="text-black block">📍 {r.cidade}</span>
                      {r.modalidade_tipo}
                    </td>
                    <td className="p-4 text-center">
                      <a href={`/captura/${r.id}`} className="bg-black text-white px-4 py-2 rounded font-black text-[10px] uppercase hover:bg-yellow-400 hover:text-black transition-all shadow-md">
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
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
