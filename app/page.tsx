'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([]) // Novo estado para lista de pescadores
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
      // 1. Carregar Recordes para o Hall da Fama
      const resR = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (resR.data) setRecordes(resR.data)

      // 2. Carregar Lista de todos os Pescadores
      const resP = await supabase.from('pescadores').select('*').order('nome_completo')
      if (resP.data) setMembros(resP.data)

      setLoading(false)
    }
    carregar()
  }, [])

  // Lógica para extrair apenas o MAIOR de cada (Espécie + Subespécie)
  const recordesPorSubespecie: any[] = []
  const subespeciesVistas = new Set()

  const filtrados = recordes.filter(r => {
    const matchBusca = (r.nome_pescador || "").toLowerCase().includes(busca.toLowerCase())
    const matchEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    return matchBusca && matchEsp
  })

  filtrados.forEach(item => {
    const chaveUnica = `${item.grupo_especie}-${item.subespecie}`
    if (!subespeciesVistas.has(chaveUnica)) {
      recordesPorSubespecie.push(item)
      subespeciesVistas.add(chaveUnica)
    }
  })

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl text-center md:text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <a href="/">
              <img src="/logo-tr.jpg" alt="Logo" className="h-24 md:h-36 w-auto rounded-xl border-2 border-yellow-400/20" />
            </a>
          </div>
          <div>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Hall da Fama</h1>
            <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mt-2 opacity-80">Trilhas do Rio <span className="text-yellow-400">Pesca Esportiva</span></p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        <div className="flex justify-end mb-4 gap-2">
          <a href="/ranking-lista" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-black hover:bg-black hover:text-yellow-400 transition-all">📊 Ver Ranking Completo</a>
        </div>

        {/* FILTROS */}
        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="🔍 Buscar Pescador..." className="p-3
