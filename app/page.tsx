'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [filtroSub, setFiltroSub] = useState('Todas')
  const [loading, setLoading] = useState(true)

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregar()
  }, [])

  const filtrados = recordes.filter(r => {
    const txt = busca.toLowerCase()
    const bB = (r.nome_pescador || '').toLowerCase().includes(txt) || (r.cidade || '').toLowerCase().includes(txt)
    const bE = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const bS = filtroSub === 'Todas' || r.subespecie === filtroSub
    return bB && bE && bS
  })

  // Criar categorias únicas de forma simples
  const categorias = Array.from(new Set(filtrados.map(r => r.grupo_especie + '|' + r.modalidade_tipo)))

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Hall da Fama</h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-80 uppercase text-xs">Trilhas do Rio Fishing Team</p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        <div className="flex justify-end mb-4">
          <a href="/ranking-lista" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-black">📊 Ver Tabela</a>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="🔍 Nome ou Cidade..." className="p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400" onChange={(e) => setBusca(e.target.value)} />
          <select onChange={(e) => { setFiltroEspecie(e.target.value); setFiltroSub('Todas'); }} className="p-3 bg-gray-50 border-2 rounded-lg font-bold">
            <option value="Todas">Todas Espécies</option>
            {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select disabled={filtroEspecie === 'Todas'} onChange={(e) => setFiltroSub(e.target.value)} className="p-3 border-2 rounded-lg font-bold disabled:opacity-30">
            <option value="Todas">Subespécie (Todas)</option>
            {filtroEspecie !== 'Todas' && subMap[filtroEspecie].map((s:string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </section>

        {loading ? (
          <div className="text-center py-20 font-black text-gray-300 animate-pulse">CARREGANDO...</div>
        ) : (
          <div className="space-y-16">
            {categorias.map(cat => {
              const [g, m] = cat.split('|')
              const peixes = filtrados.filter(r => r.grupo_especie === g && r.modalidade_tipo === m)
              const pb: any[] = []
              const vistos = new Set()
              peixes.forEach(p => { if(!vistos.has(p.nome_pescador)){ pb.push(p); vistos.add(p.nome_pescador); } })

              return (
