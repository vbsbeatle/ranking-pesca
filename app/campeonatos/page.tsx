'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ListaCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarCampeonatos() {
      setLoading(true)
      const { data } = await supabase
        .from('campeonatos')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setCampeonatos(data)
      setLoading(false)
    }
    carregarCampeonatos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-yellow-400 font-black uppercase italic tracking-widest">
        Carregando Torneios Trilhas do Rio...
      </div>
    )
  }

  const ativos = campeonatos.filter(c => c.status !== 'finalizado')
  const finalizados = campeonatos.filter(c => c.status === 'finalizado')

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-10 pb-20">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.4em] mb-2">
            Circuito Oficial de Pesca Esportiva
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white leading-none">
            Arena <span className="text-yellow-400">Torneios</span>
          </h1>
        </header>

        {/* 1. SEÇÃO DE TORNEIOS EM ANDAMENTO (ATIVOS) */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-ping"></span>
            <h2 className="text-xl md:text-2xl font-black uppercase italic text-yellow-400">
              Torneios Em Andamento ({ativos.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ativos.map(c => (
              <a
                key={c.id}
                href={`/campeonatos/${c.id}`}
                className="bg-zinc-900 hover:bg-zinc-800/80 p-6 rounded-[2.5rem] border-2 border-yellow-400/30 hover:border-yellow-400 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div className="h-20 w-20 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {c.url_logo ? (
                      <img src={c.url_logo} alt={c.nome} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏆</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic group-hover:text-yellow-400 transition-colors leading-tight">
                      {c.nome}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                      📅 {new Date(c.data_inicio).toLocaleDateString()} até {new Date(c.data_fim).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/80 text-[10px] font-black uppercase">
                  <span className="text-zinc-400">
                    Cota: <strong className="text-white">{c.cota_max || 5} Peixes</strong>
                  </span>
                  <span className="bg-yellow-400 text-black px-4 py-2 rounded-xl group-hover:bg-white transition-colors">
                    Ver Placar Ao Vivo →
                  </span>
                </div>
              </a>
            ))}

            {ativos.length === 0 && (
              <div className="col-span-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-center text-zinc-500 font-bold text-xs uppercase tracking-widest">
                Nenhum torneio em andamento no momento.
              </div>
            )}
          </div>
        </section>

        {/* 2. SEÇÃO DE TORNEIOS FINALIZADOS (ENCERRADOS) */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-t border-zinc-900 pt-10">
            <span className="text-xl">🏁</span>
            <h2 className="text-xl md:text-2xl font-black uppercase italic text-zinc-400">
              Torneios Finalizados ({finalizados.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finalizados.map(c => (
              <a
                key={c.id}
                href={`/campeonatos/${c.id}`}
                className="bg-zinc-900/50 hover:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-lg opacity-85 hover:opacity-100"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div className="h-20 w-20 bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                    {c.url_logo ? (
                      <img src={c.url_logo} alt={c.nome} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏁</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-zinc-800 text-yellow-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        Encerrado
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase italic group-hover:text-yellow-400 transition-colors leading-tight text-zinc-300">
                      {c.nome}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                      Finalizado em {new Date(c.data_fim).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/80 text-[10px] font-black uppercase">
                  <span className="text-zinc-500">Resultado Oficial</span>
                  <span className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                    Ver Pódio Definitivo →
                  </span>
                </div>
              </a>
            ))}

            {finalizados.length === 0 && (
              <div className="col-span-full bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-3xl text-center text-zinc-600 font-bold text-xs uppercase tracking-widest">
                Nenhum torneio finalizado no histórico.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
