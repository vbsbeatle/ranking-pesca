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
  const [filtroLocal, setFiltroLocal] = useState('Todas') // ALTERADO: De Cidade para Local

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
    const matchLoc = filtroLocal === 'Todas' || r.local_captura === filtroLocal // FILTRO POR LOCAL
    return matchEsp && matchSub && matchMod && matchLoc
  })

  // Criar lista única de Locais da Captura (Rio Doce, Lagoas, etc)
  const listaLocais = Array.from(new Set(recordes.map(r => r.local_captura).filter(l => l))).sort()

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
                {listaLocais.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Modalidade</label>
              <select onChange={(e) => setFiltroModalidade(e.target.value)} className="w-full p-2 border-2 rounded-lg font-bold bg-gray-50 text-xs outline-none focus:border-yellow-400">
                <option value="Todas">Todas</option>
                <option value="Absoluto">Absoluto</option>
                <option value
