'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCampeonato() {
  const { id } = useParams()
  const [camp, setCamp] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [catAtiva, setCatAtiva] = useState('')
  const [bigFish, setBigFish] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarTudo() {
      const { data: c } = await supabase.from('campeonatos').select('*').eq('id', id).single()
      if (!c) return
      setCamp(c)
      setCatAtiva(c.categorias[0]) // Inicia na primeira categoria escolhida no admin

      const { data: participantes } = await supabase.from('campeonato_participantes').select('*').eq('campeonato_id', id)
      const { data: capturas } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', id)

      if (participantes && capturas) {
        processarRanking(c, participantes, capturas, c.categorias[0])
      }
      setLoading(false)
    }
    carregarTudo()
  }, [id])

  function processarRanking(c: any, parts: any[], caps: any[], categoria: string) {
    const lista = parts.map(p => {
      // FILTRA APENAS PEIXES DA CATEGORIA SELECIONADA
      const peixesCat = caps
        .filter(cap => cap.pescador_id === p.pescador_id && cap.especie === categoria)
        .sort((a, b) => b.tamanho_cm - a.tamanho_cm)

      const peixesValidos = peixesCat.slice(0, c.cota_max)
      const soma = peixesValidos.reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
      
      return { ...p, pontuacao: soma, qtd: peixesCat.length, atingiuCota: peixesCat.length >= c.cota_min }
    })

    setRanking(lista.sort((a, b) => b.pontuacao - a.pontuacao))

    // Big Fish da Categoria
    const maior = caps.filter(cap => cap.especie === categoria).sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]
    setBigFish(maior)
  }

  // Mudar de Categoria
  async function mudarAba(novaCat: string) {
    setCatAtiva(novaCat)
    const { data: parts } = await supabase.from('campeonato_participantes').select('*').eq('campeonato_id', id)
    const { data: caps } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', id)
    if (parts && caps) processarRanking(camp, parts, caps, novaCat)
  }

  if (loading || !camp) return <div className="p-20 text-center font-black text-zinc-600">Calculando Pódios...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-sans pb-40">
      <header className="max-w-5xl mx-auto mb-10 border-b border-zinc-900 pb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-400 mb-2">{camp.nome}</h1>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cota: {camp.cota_min} a {camp.cota_max} peixes</p>
      </header>

      {/* ABAS DE CATEGORIA */}
      <div className="max-w-5xl mx-auto flex justify-center gap-2 mb-10 overflow-x-auto pb-4">
        {camp.categorias.map((cat: string) => (
          <button key={cat} onClick={() => mudarAba(cat)} className={`px-6 py-3 rounded-full font-black uppercase text-xs border-2 transition-all ${catAtiva === cat ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-zinc-800 text-zinc-500'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {/* BIG FISH DA CATEGORIA */}
        {bigFish && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-1 rounded-[40px] mb-12">
            <div className="bg-zinc-950 rounded-[36px] p-6 flex justify-between items-center px-10">
               <div><p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">👑 Maior {catAtiva}</p><h3 className="text-2xl font-black uppercase italic">{bigFish.nome_pescador}</h3></div>
               <p className="text-5xl font-black italic">{bigFish.tamanho_cm} CM</p>
            </div>
          </div>
        )}

        {/* RANKING */}
        <div className="space-y-4">
          <h2 className="text-zinc-600 font-black uppercase italic mb-6">Ranking de {catAtiva}</h2>
          {ranking.map((r, i) => (
            <div key={r.id} className={`p-6 rounded-[35px] flex items-center justify-between border-2 transition-all ${i === 0 ? 'bg-zinc-900 border-yellow-400 shadow-xl' : 'bg-zinc-900/40 border-zinc-900'}`}>
               <div className="flex items-center gap-6">
                  <span className={`text-4xl font-black italic ${i === 0 ? 'text-yellow-400' : 'text-zinc-800'}`}>{i + 1}º</span>
                  <div>
                    <a href={`/campeonatos/${id}/pescador/${r.pescador_id}`} className="text-xl font-black uppercase italic hover:text-yellow-400">{r.nome_pescador}</a>
                    <p className={`text-[9px] font-black uppercase ${r.atingiuCota ? 'text-green-500' : 'text-red-500'}`}>{r.atingiuCota ? 'Cota Atingida' : `Faltam ${camp.cota_min - r.qtd} peixes`}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-600 uppercase">Soma CM</p>
                  <p className="text-4xl font-black italic">{r.pontuacao.toFixed(1)}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
