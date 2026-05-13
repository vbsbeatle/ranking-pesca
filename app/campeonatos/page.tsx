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
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-400 mb-4">Arena <span className="text-white">PeixeBook</span></h1>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-[0.3em]">Campeonatos Oficiais de Pesca Esportiva</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
        {torneios.map(t => (
          <a key={t.id} href={`/campeonatos/${t.id}`} className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl hover:border-yellow-400 transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase italic group-hover:text-yellow-400 transition-colors">{t.nome}</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase mt-2 tracking-widest">
                📅 {new Date(t.data_inicio).toLocaleDateString()} até {new Date(t.data_fim).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <p className="text-[9px] font-black text-zinc-500 uppercase">Cota Máxima</p>
                <p className="text-xl font-black text-white">{t.cota_max} Peixes</p>
              </div>
              <div className="h-10 w-[2px] bg-zinc-800"></div>
              <button className="bg-yellow-400 text-black px-6 py-3 rounded-full font-black uppercase text-xs">Ver Ranking</button>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
