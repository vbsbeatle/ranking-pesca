'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DetalheCampeonato() {
  const { id } = useParams()
  const [camp, setCamp] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [catAtiva, setCatAtiva] = useState('Geral (Sacola)')
  const [bigFish, setBigFish] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todosParticipantes, setTodosParticipantes] = useState<any[]>([])
  const [todasCapturas, setTodasCapturas] = useState<any[]>([])

  useEffect(() => {
    async function carregarTudo() {
      const { data: c } = await supabase.from('campeonatos').select('*').eq('id', id).single()
      if (!c) return
      setCamp(c)

      const { data: participantes } = await supabase.from('campeonato_participantes').select('*').eq('campeonato_id', id)
      const { data: capturas } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', id)

      if (participantes && capturas) {
        setTodosParticipantes(participantes)
        setTodasCapturas(capturas)
        processarRanking(c, participantes, capturas, 'Geral (Sacola)')
      }
      setLoading(false)
    }
    carregarTudo()
  }, [id])

  function processarRanking(c: any, parts: any[], caps: any[], categoria: string) {
    const lista = parts.map(p => {
      let peixesFiltrados = []

      if (categoria === 'Geral (Sacola)') {
        peixesFiltrados = caps
          .filter(cap => cap.pescador_id === p.pescador_id || cap.pescador === p.pescador_id)
          .sort((a, b) => b.tamanho_cm - a.tamanho_cm)
      } else {
        peixesFiltrados = caps
          .filter(cap => (cap.pescador_id === p.pescador_id || cap.pescador === p.pescador_id) && cap.especie === categoria)
          .sort((a, b) => b.tamanho_cm - a.tamanho_cm)
      }

      const peixesValidos = peixesFiltrados.slice(0, c.cota_max || 5)
      const soma = peixesValidos.reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
      
      return { 
        ...p, 
        pontuacao: soma, 
        qtd: peixesFiltrados.length, 
        atingiuCota: peixesFiltrados.length >= (c.cota_min || 1),
        detalhePeixes: peixesValidos 
      }
    })

    // 🔥 NOVA FUNÇÃO DE ORDENAÇÃO COM CRITÉRIO DE DESEMPATE SEGUIDO A RISCA
    const rankingOrdenado = lista.sort((a, b) => {
      // 1º Critério: Pontuação Total (Soma da cota)
      if (b.pontuacao !== a.pontuacao) {
        return b.pontuacao - a.pontuacao
      }

      // 2º Critério: Comparação peixe por peixe (Maior peixe, depois 2º maior...)
      const maxPeixes = Math.max(a.detalhePeixes.length, b.detalhePeixes.length)
      for (let k = 0; k < maxPeixes; k++) {
        const tamA = a.detalhePeixes[k]?.tamanho_cm || 0
        const tamB = b.detalhePeixes[k]?.tamanho_cm || 0
        
        if (tamB !== tamA) {
          return tamB - tamA // Quem tiver o maior peixe nessa posição passa na frente
        }
      }

      return 0 // Empate absoluto se todos os peixes forem idênticos
    })

    setRanking(rankingOrdenado)

    const capsFiltradas = categoria === 'Geral (Sacola)' ? caps : caps.filter(cap => cap.especie === categoria)
    const maior = [...capsFiltradas].sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]
    setBigFish(maior)
  }

  function mudarAba(novaCat: string) {
    setCatAtiva(novaCat)
    processarRanking(camp, todosParticipantes, todasCapturas, novaCat)
  }

  if (loading || !camp) return <div className="p-20 text-center font-black text-zinc-600 uppercase">Processando Placar Oficial...</div>

  const abasDisponiveis = ['Geral (Sacola)', ...(camp.categorias || ['Tucunaré', 'Trairas', 'Dourado'])]

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-sans pb-40">
      <header className="max-w-5xl mx-auto mb-10 border-b border-zinc-900 pb-8 flex flex-col items-center text-center">
        {camp.url_logo && (
          <img src={camp.url_logo} alt="Logo Torneio" className="h-24 md:h-32 w-auto mb-6 rounded-2xl shadow-2xl border-2 border-zinc-800" />
        )}
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-400 mb-2 leading-none">{camp.nome}</h1>
        <div className="flex gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">
           <span>📅 {new Date(camp.data_inicio).toLocaleDateString()} a {new Date(camp.data_fim).toLocaleDateString()}</span>
           <span className="text-yellow-600">🏆 Limite: {camp.cota_max || 5} Maiores Peixes</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex justify-center gap-2 mb-10 overflow-x-auto pb-4">
        {abasDisponiveis.map((cat: string) => (
          <button key={cat} onClick={() => mudarAba(cat)} className={`px-6 py-3 rounded-full font-black uppercase text-xs border-2 whitespace-nowrap transition-all ${catAtiva === cat ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-zinc-800 text-zinc-500'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {bigFish && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-1 rounded-[40px] mb-12 shadow-xl">
            <div className="bg-zinc-950 rounded-[36px] p-6 flex justify-between items-center px-10">
               <div>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                    👑 Maior Peixe {catAtiva === 'Geral (Sacola)' ? 'do Torneio' : `de ${catAtiva}`}
                  </p>
                  <h3 className="text-2xl font-black uppercase italic">{bigFish.nome_pescador}</h3>
               </div>
               <div className="text-right">
                  <p className="text-5xl font-black italic text-white">{bigFish.tamanho_cm} CM</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">{bigFish.especie}</p>
               </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-zinc-600 font-black uppercase italic mb-6">Classificação: {catAtiva}</h2>
          {ranking.map((r, i) => {
            const nomePescador = r.nome_pescador || todosParticipantes.find(p => p.id === r.pescador_id || p.id === r.pescador)?.nome_completo || 'Pescador';
            
            return (
              <div key={r.id} className={`p-6 rounded-[35px] flex flex-col sm:flex-row sm:items-center justify-between border-2 gap-4 transition-all ${i === 0 ? 'bg-zinc-900 border-yellow-400 shadow-2xl' : 'bg-zinc-900/40 border-zinc-900'}`}>
                 <div className="flex items-start gap-6">
                    <span className={`text-4xl font-black italic mt-1 ${i === 0 ? 'text-yellow-400' : 'text-zinc-800'}`}>{i + 1}º</span>
                    <div>
                      <a href={`/campeonatos/${id}/pescador/${r.pescador_id || r.pescador}`} className="text-xl font-black uppercase italic hover:text-yellow-400 block transition-colors">{nomePescador}</a>
                      
                      {r.detalhePeixes && r.detalhePeixes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.detalhePeixes.map((peixe: any, idx: number) => (
                            <span key={idx} className="bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                              {peixe.especie.substring(0,3)}. {peixe.tamanho_cm}cm
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-600 uppercase font-black mt-1">Nenhum peixe computado</p>
                      )}
                    </div>
                 </div>
                 
                 <div className="text-left sm:text-right border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Soma Total</p>
                    <p className="text-4xl font-black italic text-white">{r.pontuacao.toFixed(1)} <span className="text-xs text-zinc-600 not-italic">CM</span></p>
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
