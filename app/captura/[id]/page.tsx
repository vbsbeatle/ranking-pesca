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
      if (!params.id) return
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) setC(data)
      setLoading(false)
    }
    carregar()
  }, [params.id])

  if (loading) {
    return <div className="p-20 text-center font-black text-gray-400 animate-pulse uppercase">Carregando Certificado...</div>
  }

  if (!c) {
    return <div className="p-20 text-center font-bold">Registro não encontrado.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-black">
      {/* TOPO */}
      <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-4 text-[10px] font-black uppercase">
           <a href="/ranking-lista" className="hover:underline">← Voltar à Lista</a>
           <span className="bg-yellow-400 text-black px-3 py-1 rounded shadow-lg">Registro Oficial</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Certificado</h1>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* FOTOS */}
          <div className="space-y-6">
            <div className="bg-white p-3 rounded-3xl shadow-xl border border-gray-200">
              <img src={c.url_foto_captura} className="rounded-2xl w-full object-cover" alt="Captura" />
              <p className="text-center text-[9px] font-black uppercase text-gray-400 mt-2">Foto da Captura</p>
            </div>
            <div className="bg-white p-3 rounded-3xl shadow-xl border border-gray-200">
              <img src={c.url_foto_medicao} className="rounded-2xl w-full object-cover" alt="Medição" />
              <p className="text-center text-[9px] font-black uppercase text-gray-400 mt-2">Prova de Medição</p>
            </div>
          </div>

          {/* DADOS */}
<div className="relative z-10">
  <h2 className="text-4xl font-black uppercase italic leading-none mb-2">{c.nome_pescador}</h2>
  <p className="text-yellow-600 font-black uppercase text-[10px] tracking-widest italic">
    📍 {c.local_captura || 'Local não informado'} | {c.cidade}
  </p>
  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Modalidade: {c.modalidade_tipo}</p>
  
  {/* Resto do código (Espécie, Medida, etc.) */}
</div>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-l-[12px] border-yellow-400">
              <h2 className="text-4xl font-black uppercase italic leading-none mb-2">{c.nome_pescador}</h2>
              <p className="text-yellow-600 font-black uppercase text-[10px] tracking-widest">📍 {c.cidade} | {c.modalidade_tipo}</p>

              <div className="grid grid-cols-2 gap-6 mt-10">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espécie</p>
                  <p className="font-black text-xl uppercase italic">{c.grupo_especie}</p>
                  <p className="font-bold text-yellow-600 text-[10px] uppercase">{c.subespecie}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medida</p>
                  <p className="font-black text-4xl leading-none">{c.tamanho_cm}<span className="text-sm ml-1">cm</span></p>
                </div>
              </div>
            </div>

            {/* EQUIPAMENTO */}
<div className="flex justify-between border-b border-gray-800 pb-2">
  <span className="text-gray-500">Tipo de Pesca</span>
  <span>{c.tipo_pescaria || '---'} {c.tipo_embarcacao ? `(${c.tipo_embarcacao})` : ''}</span>
</div>
            <div className="bg-black text-white p-8 rounded-3xl shadow-2xl border-b-8 border-yellow-400">
              <h3 className="text-yellow-400 font-black uppercase italic text-xs mb-6">⚙️ Ficha Técnica</h3>
              <div className="space-y-4 text-xs font-bold uppercase tracking-widest">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Tipo</span>
                  <span>{c.tipo_pescaria || '---'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Carretilha</span>
                  <span className="text-yellow-100">{c.carretilha || '---'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Vara</span>
                  <span>{c.vara || '---'}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Isca</span>
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-[9px] italic">
                    {c.isca || '---'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-10 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
