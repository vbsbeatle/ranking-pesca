'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ListaCampeonatos() {
  const [torneios, setTorneios] = useState<any[]>([])

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('campeonatos').select('*').order('data_inicio', { ascending: false })
      if (data) setTorneios(data)
    }
    carregar()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        {/* TÍTULO ATUALIZADO */}
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-400 mb-4">Torneios <span className="text-white">Peixebook</span></h1>
        <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.4em]">Arena Oficial de Competições</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
        {torneios.map(t => (
          <a key={t.id} href={`/campeonatos/${t.id}`} className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-[2.5rem] hover:border-yellow-400 transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              {t.url_logo && <img src={t.url_logo} className="h-16 w-16 rounded-2xl object-cover border border-zinc-700" alt="Logo" />}
              <div>
                <h2 className="text-2xl font-black uppercase italic group-hover:text-yellow-400 transition-colors">{t.nome}</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase mt-2 tracking-widest italic">
                  📅 {new Date(t.data_inicio).toLocaleDateString()} — {new Date(t.data_fim).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs shadow-lg hover:scale-105 transition-transform">Ver Ranking</button>
          </a>
        ))}
      </div>
    </div>
  )
}
