'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const params = useParams()
  const [c, setC] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      // Busca o recorde específico pelo ID
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) setC(data)
      setLoading(false)
    }
    if (params.id) carregar()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="font-black uppercase italic animate-pulse text-gray-400">Carregando Certificado...</p>
    </div>
  )

  if (!c) return <div className="p-20 text-center">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* CABEÇALHO DE STATUS */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-4">
           <a href="/ranking-lista" className="text-[10px] font-black uppercase hover:underline">← Voltar à Lista</a>
           <span className="bg-yellow-400 text-black px-3 py-1 rounded font-black text-[10px] uppercase shadow-lg">Registro Oficial</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Certificado de Captura</h1>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUNA ESQUERDA: FOTOS */}
          <div className="space-y-6">
            <div className="bg-white p-3 rounded-3xl shadow-2xl border-2 border-gray-200">
              <img src={c.url_foto_captura} className="rounded-2xl w-full object-cover shadow-inner" alt="Foto da Captura" />
              <p className="text-center text-[10px] font-black uppercase text-gray-400 mt-3 tracking-[0.2em]">Registro de Captura</p>
            </div>
            
            <div className="bg-white p-3 rounded-3xl shadow-2xl border-2 border-gray-200">
              <img src={c.url_foto_medicao} className="rounded-2xl w-full object-cover" alt="Foto da Medição" />
              <p className="text-center text-[10px] font-black uppercase text-gray-400 mt-3 tracking-[0.2em]">Prova de Medição</p>
            </div>
          </div>

          {/* COLUNA DIREITA: DADOS TÉCNICOS */}
          <div className="space-y-6">
            {/* CARD PRINCIPAL */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-l-[12px] border-yellow-400 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-gray-50 p-4 font-black text-6xl text-gray-100 italic -z-0">
                 {c.tamanho_cm
