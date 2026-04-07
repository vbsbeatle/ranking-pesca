'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RankingLista() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [filtroModalidade, setFiltroModalidade] = useState('Todas')
  const [filtroCidade, setFiltroCidade] = useState('Todas')

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

  // Filtros aplicados de forma simples e segura
  const filtrados = recordes.filter((r) => {
    const bEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const bModalidade = filtroModalidade === 'Todas' || r.modalidade_tipo === filtroModalidade
    const bCidade = filtroCidade === 'Todas' || r.cidade === filtroCidade
    return bEspecie && bModalidade && bCidade
  })

  // Gerar listas para os selects
  const listaEspecies = Array.from(new Set(recordes.map(r => r.grupo_especie)))
  const listaCidades = Array.from(new Set(recordes.map(r => r.cidade))).sort()

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-black text-yellow-400 p-8 border-b-8 border-yellow-400 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Ranking Geral em Lista</h1>
          <a href="/" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-xs border-2 border-black hover:bg-white transition-all">
            ← Voltar ao Início
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* FILTROS */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Espécie</label>
            <select onChange={(e) => setFiltroEspecie(e.target.value)} className="w-full p-2 border rounded font-bold bg-gray-50 text-sm">
              <option value="Todas">Todas as Espécies</option>
              {listaEspecies.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Modalidade</label>
            <select onChange={(e) => setFiltroModalidade(e.target.value)} className="w-full p-2 border rounded font-bold bg-gray-50 text-sm">
              <option value="Todas">Todas</option>
              <option value="Absoluto">Absoluto</option>
              <option value="Privado">Privado</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Cidade</label>
            <select onChange={(e) => setFiltroCidade(e.target.value)} className="w-full p-2 border rounded font-bold bg-gray-50 text-sm">
              <option value="Todas">Todas as Cidades</option>
              {listaCidades.map(cid => <option key={cid} value={cid}>{cid}</option>)}
            </select>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-[10px] font-black uppercase text-gray-500 border-b">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Pescador</th>
                  <th className="p-4">Peixe / Subespécie</th>
                  <th className="p-4">Medida</th>
                  <th className="p-4">Local</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-300 animate-pulse">CARREGANDO RANKING...</td></tr>
                ) : filtrados.map((r, index) => (
                  <tr key={r.id} className="hover:bg-yellow-50 border-b border-gray-100 transition-colors">
                    <td className="p-4 font-black text-gray-300">#{index + 1}</td>
                    <td className="p-4 font-black uppercase italic">{r.nome_pescador}</td>
                    <td className="p-4">
                      <span className="font-black block uppercase">{r.grupo_especie}</span>
                      <span className="text-[10px] text-yellow-600 font-bold uppercase">{r.subespecie}</span>
                    </td>
                    <td className="p-4 font-black text-lg">{r.tamanho_cm}cm</td>
                    <td className="p-4 uppercase font-bold text-[10px] text-gray-500">{r.cidade}</td>
                    <td className="p-4 text-center">
                      <a href={`/captura/${r.id}`} className="bg-black text-white px-4 py-2 rounded font-black text-[10px] uppercase hover:bg-yellow-400 hover:text-black transition-all">Detalhes</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
