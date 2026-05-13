'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

export default function PaginaPescadorTorneio() {
  const { id: campId, pescador_id } = useParams()
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarPerformance() {
      // 1. Pega dados do campeonato e do pescador
      const { data: camp } = await supabase.from('campeonatos').select('*').eq('id', campId).single()
      const { data: pesq } = await supabase.from('pescadores').select('*').eq('id', pescador_id).single()
      
      // 2. Pega todas as capturas do torneio para calcular posição
      const { data: todasCapturas } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', campId)
      
      if (camp && pesq && todasCapturas) {
        const minhasCapturas = todasCapturas.filter(c => c.pescador_id === pescador_id)
        
        // Lógica de Categorias (Agrupamento)
        const categorias = [
          { nome: "Predadores (Tuc/Tra/Trã)", especies: ['Tucunaré', 'Traíra', 'Trairão'] },
          { nome: "Dourado", especies: ['Dourado'] }
        ]

        const performancePorCategoria = categorias.map(cat => {
          // Pega peixes do grupo
          const peixesPescador = minhasCapturas
            .filter(c => cat.especies.includes(c.especie))
            .sort((a, b) => b.tamanho_cm - a.tamanho_cm)
          
          const peixesValidos = peixesPescador.slice(0, camp.cota_max)
          const soma = peixesValidos.reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
          
          // Verifica se ele tem o maior peixe do torneio nesta categoria
          const maiorDoTorneio = todasCapturas
            .filter(c => cat.especies.includes(c.especie))
            .sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]
          
          const souDonoDoMaior = maiorDoTorneio?.pescador_id === pescador_id

          return {
            ...cat,
            soma,
            qtd: peixesPescador.length,
            peixes: peixesPescador,
            eDonoDoMaior: souDonoDoMaior,
            maiorPeixe: peixesPescador[0]
          }
        })

        setDados({ pesq, camp, performancePorCategoria })
      }
      setLoading(false)
    }
    carregarPerformance()
  }, [campId, pescador_id])

  if (loading) return <div className="p-20 text-center font-black text-zinc-600 uppercase">Analisando Performance...</div>
  if (!dados) return <div className="p-20 text-center text-white">Dados não encontrados.</div>

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER DO PESCADOR */}
        <header className="mb-12 text-center border-b border-zinc-800 pb-10">
          <p className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.4em] mb-2">{dados.camp.nome}</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none">{dados.pesq.nome_completo}</h1>
        </header>

        {/* CARDS DE CATEGORIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {dados.performancePorCategoria.map((cat: any) => (
            <div key={cat.nome} className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[40px] relative overflow-hidden">
               {cat.eDonoDoMaior && (
                 <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-black text-[8px] uppercase">👑 Big Fish</div>
               )}
               <h3 className="text-zinc-500 font-black uppercase text-xs mb-6 tracking-widest">{cat.nome}</h3>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-600">Pontuação</p>
                    <p className="text-5xl font-black italic text-white">{cat.soma.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-zinc-600">Cota</p>
                    <p className="text-xl font-black">{cat.qtd} / {dados.camp.cota_max}</p>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* LISTA DE PEIXES REGISTRADOS NO TORNEIO */}
        <h2 className="text-xl font-black uppercase italic mb-6 border-l-4 border-yellow-400 pl-4 text-zinc-400">Sacola de Capturas</h2>
        <div className="space-y-3">
          {dados.performancePorCategoria.flatMap((c:any) => c.peixes).map((p: any, i: number) => (
            <div key={i} className="bg-zinc-900/40 p-4 rounded-2xl flex justify-between items-center border border-zinc-800/50">
               <div>
                  <p className="font-black uppercase text-xs italic">{p.especie}</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">{new Date(p.data_captura).toLocaleDateString()}</p>
               </div>
               <p className="text-xl font-black italic text-yellow-400">{p.tamanho_cm} CM</p>
            </div>
          ))}
          {dados.performancePorCategoria.reduce((a:any, b:any) => a + b.qtd, 0) === 0 && (
            <p className="text-center py-10 text-zinc-700 italic">Nenhum peixe registrado ainda.</p>
          )}
        </div>

      </div>
    </div>
  )
}
