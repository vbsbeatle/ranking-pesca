'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DetalheCampeonato() {
  const { id } = useParams()
  const [camp, setCamp] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [bigFish, setBigFish] = useState<any>(null)

  useEffect(() => {
    async function carregarTudo() {
      // 1. Dados do Campeonato
      const { data: c } = await supabase.from('campeonatos').select('*').eq('id', id).single()
      if (!c) return
      setCamp(c)

      // 2. Participantes e Capturas
      const { data: participantes } = await supabase.from('campeonato_participantes').select('*').eq('campeonato_id', id)
      const { data: capturas } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', id)

      if (participantes && capturas) {
        // LÓGICA DE RANKING
        const listaRankeada = participantes.map(p => {
          // Pega peixes desse pescador
          const peixesPescador = capturas
            .filter(cap => cap.pescador_id === p.pescador_id)
            .sort((a, b) => b.tamanho_cm - a.tamanho_cm) // Maiores primeiro

          // Aplica a cota máxima
          const peixesValidos = peixesPescador.slice(0, c.cota_max)
          const totalCm = peixesValidos.reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
          
          return {
            ...p,
            pontuacao: totalCm,
            qtdPeixes: peixesPescador.length,
            peixes: peixesValidos,
            atingiuCota: peixesPescador.length >= c.cota_min
          }
        })

        // Ordena o Ranking (Maior pontuação primeiro)
        setRanking(listaRankeada.sort((a, b) => b.pontuacao - a.pontuacao))

        // Maior Peixe do Torneio (Big Fish)
        if (capturas.length > 0) {
          const maior = [...capturas].sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]
          setBigFish(maior)
        }
      }
    }
    carregarTudo()
  }, [id])

  if (!camp) return <div className="p-20 text-center font-black uppercase text-zinc-500">Carregando Arena...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-sans pb-40">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b-2 border-zinc-900 pb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-400 leading-none mb-4">{camp.nome}</h1>
          <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
             <span>📅 {new Date(camp.data_inicio).toLocaleDateString()} - {new Date(camp.data_fim).toLocaleDateString()}</span>
             <span>🎯 Cota Mínima: {camp.cota_min} peixes</span>
             <span>🔥 Cota Máxima: {camp.cota_max} peixes</span>
          </div>
        </header>

        {/* DESTAQUE BIG FISH */}
        {bigFish && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-1 rounded-3xl mb-12 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <div className="bg-zinc-950 rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">👑 Maior Peixe do Torneio</p>
                  <h3 className="text-2xl font-black uppercase italic">{bigFish.nome_pescador}</h3>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-4xl font-black italic">{bigFish.tamanho_cm} CM</p>
                  <p className="text-[10px] font-bold uppercase text-zinc-500">{bigFish.especie}</p>
               </div>
            </div>
          </div>
        )}

        {/* TABELA DE RANKING */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase italic text-zinc-400 mb-6 flex items-center gap-4">
            🏆 Classificação Geral
            <div className="flex-1 h-[1px] bg-zinc-900"></div>
          </h2>

          {ranking.map((r, i) => (
            <div key={r.id} className={`p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 transition-all ${i === 0 ? 'bg-zinc-900 border-yellow-400' : 'bg-zinc-900/40 border-zinc-800'}`}>
               <div className="flex items-center gap-6">
                  <span className={`text-3xl font-black italic ${i === 0 ? 'text-yellow-400' : 'text-zinc-700'}`}>{i + 1}º</span>
                  <div>
                    <h4 className="text-xl font-black uppercase italic">{r.nome_pescador}</h4>
                    <p className={`text-[9px] font-black uppercase ${r.atingiuCota ? 'text-green-500' : 'text-red-500'}`}>
                      {r.atingiuCota ? '✅ Cota Atingida' : `❌ Faltam ${camp.cota_min - r.qtdPeixes} peixes`}
                    </p>
                  </div>
               </div>

               <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-500 uppercase">Soma CM</p>
                    <p className="text-3xl font-black italic">{r.pontuacao.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-500 uppercase">Peixes</p>
                    <p className="text-xl font-black text-zinc-400">{r.qtdPeixes}</p>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
