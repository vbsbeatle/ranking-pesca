'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RankingLista() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para os filtros
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

  // 1. Gerar listas únicas para os selects (filtros)
  const especiesUnicas = Array.from(new Set(recordes.map(r => r.grupo_especie)))
  const cidadesUnicas = Array.from(new Set(recordes.map(r => r.cidade))).sort()

  // 2. Lógica de Filtragem Dinâmica
  const dadosFiltrados = recordes.filter(r => {
    const bateEspecie = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const bateModalidade = filtroModalidade === 'Todas' || r.modalidade_tipo === filtroModalidade
    const bateCidade = filtroCidade === 'Todas' || r.cidade === filtroCidade
    return bateEspecie && bateModalidade && bateCidade
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-yellow-400 p-6 border-b-8 border-yellow-400 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic">Ranking Geral</h1>
            <p className="text-white text-[10px] font-bold tracking-widest uppercase opacity-60">Trilhas do Rio Fishing Team</p>
          </div>
          <a href="/" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-xs hover:bg-white transition-all border-2 border-black">
            ← Voltar ao Hall da Fama
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* BARRA DE FILTROS DINÂMICOS */}
        <section className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Filtrar por Espécie</label>
            <select 
              className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-sm outline-none focus:border-yellow-400"
              onChange={(e) => setFiltroEspecie(e.target.value)}
            >
              <option value="Todas">Todas as Espécies</option>
              {especiesUnicas.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Filtrar por Modalidade</label>
            <select 
              className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-sm outline-none focus:border-yellow-400"
              onChange={(e) => setFiltroModalidade(e.target.value)}
            >
              <option value="Todas">Todas as Modalidades</option>
              <option value="Absoluto">Absoluto</option>
              <option value="Privado">Privado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Filtrar por Cidade</label>
            <select 
              className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-sm outline-none focus:border-yellow-400"
              onChange={(e) => setFiltroCidade(e.target.value)}
            >
              <option value="Todas">Todas as Cidades</option>
              {cidadesUnicas.map(cid => <option key={cid} value={cid}>{cid}</option>)}
            </select>
          </div>
        </section>

        {/* TABELA DE RANKING */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b">
                  <th className="p-4">Pos.</th>
                  <th className="p-4">Pescador</th>
                  <th className="p-4">Peixe / Subespécie</th>
                  <th className="p-4">Medida</th>
                  <th className="p-4">Local / Modalidade</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center font-black text-gray-300 animate-pulse uppercase">Carregando Ranking...</td></tr>
                ) : dadosFiltrados.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-400 uppercase italic">Nenhum registro encontrado com estes filtros.</td></tr>
                ) : dadosFiltrados.map((r, index) => (
                  <tr key={r.id} className="hover:bg-yellow-50 border-b border-gray-100 transition-colors group">
                    <td className="p-4 font-black text-gray-300 group-hover:text-yellow-500 transition-colors">#{index + 1}</td>
                    <td className="p-4">
                       <a href={`/pescador/${encodeURIComponent(r.nome_pescador)}`} className="font-black uppercase italic hover:underline decoration-yellow-400 underline-offset-4">
                         {r.nome_pescador}
                       </a>
                    </td>
                    <td className="p-4">
                      <span className="font-black block uppercase leading-none">{r.grupo_especie}</span>
                      <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-tighter">{r.subespecie}</span>
                    </td>
                    <td className="p-4">
                       <span className="bg-black text-yellow-400 px-3 py-1 rounded-lg font-black text-lg">
                         {r.tamanho_cm}cm
                       </span>
                    </td>
