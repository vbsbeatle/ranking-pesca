'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
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
      const { data: r } = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (r) setRecordes(r)
      const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (p) setMembros(p)
      setLoading(false)
    }
    carregar()
  }, [])

  // Lógica de recordes memorizada para evitar erros de renderização
  const recordesFiltrados = useMemo(() => {
    const listaRecordistas: any[] = []
    const vistos = new Set()

    const filtrados = recordes.filter(r => {
      const mBusca = (r.nome_pescador || "").toLowerCase().includes(busca.toLowerCase())
      const mEsp = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
      return mBusca && mEsp
    })

    filtrados.forEach(item => {
      const chave = `${item.grupo_especie}-${item.subespecie}`
      if (!vistos.has(chave)) {
        listaRecordistas.push(item)
        vistos.add(chave)
      }
    })
    return listaRecordistas
  }, [recordes, busca, filtroEspecie])

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* CABEÇALHO */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <a href="/">
              <img src="/logo-tr.jpg" alt="Logo" className="h-24 md:h-36 w-auto rounded-xl border-2 border-yellow-400/20 shadow-2xl" />
            </a>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Hall da Fama</h1>
            <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mt-2 opacity-80">
              Trilhas do Rio <span className="text-yellow-400">Pesca Esportiva</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -
