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
      // 1. Pega dados do campeonato e do pescador (incluindo a foto do cadastro geral)
      const { data: camp } = await supabase.from('campeonatos').select('*').eq('id', campId).single()
      const { data: pesq } = await supabase.from('pescadores').select('*').eq('id', pescador_id).single()
      
      // 2. Pega todas as capturas e participantes do torneio para calcular o RANKING
      const { data: todasCaps } = await supabase.from('capturas_torneio').select('*').eq('campeonato_id', campId)
      const { data: todosParts } = await supabase.from('campeonato_participantes').select('*').eq('campeonato_id', campId)
      
      if (camp && pesq && todasCaps && todosParts) {
        // Categorias que o torneio aceita
        const categoriasDoTorneio = camp.categorias || ['Tucunaré', 'Trairas', 'Dourado']

        const performancePorCategoria = categoriasDoTorneio.map((especie: string) => {
          // CALCULAR RANKING DESTA CATEGORIA PARA TODOS
          const rankingGeralDestaCat = todosParts.map(p => {
            const peixesP = todasCaps
              .filter(c => c.pescador_id === p.pescador_id && c.especie === especie)
              .sort((a, b) => b.tamanho_cm - a.tamanho_cm)
            const soma = peixesP.slice(0, camp.cota_max).reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
            return { pId: p.pescador_id, total: soma }
          }).sort((a, b) => b.total - a.total)

          // Minha posição
          const minhaPos = rankingGeralDestaCat.findIndex(r => r.pId === pescador_id) + 1

          // Meus Peixes
          const meusPeixes = todasCaps
            .filter(c => c.pescador_id === pescador_id && c.especie === especie)
            .sort((a, b) => b.tamanho_cm - a.tamanho_cm)
          
          const somaEu = meusPeixes.slice(0, camp.cota_max).reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)

          // Verifica Maior Peixe do Torneio nesta espécie
          const maiorDoCamp = todasCaps.filter(c => c.especie === especie).sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]

          return {
            nome: especie,
            soma: somaEu,
            qtd: meusPeixes.length,
            peixes: meusPeixes,
            posicao: somaEu > 0 ? minhaPos : '-',
            eDonoDoMaior: maiorDoCamp?.pescador_id === pescador_id,
            maiorMedida: meusPeixes[0]?.tamanho_cm || 0
          }
        })

        setDados({ pesq, camp, performancePorCategoria })
      }
      setLoading(false)
    }
    carregarPerformance()
  }, [campId, pescador_id])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-zinc-600 uppercase">Processando Resultados...</div>
  if (!dados) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Dados não encontrados.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-12 font-sans pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* CABEÇALHO COM FOTO DO PESCADOR */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="h-28 w-28 md:h-40 md:w-40 rounded-[2.5rem] overflow-hidden border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                {/* USA A FOTO DO CADASTRO DO PEIXEBOOK */}
                <img src={dados.pesq.url_foto || 'https://via.placeholder.com/150'} className="h-full w-full object-cover" alt="Perfil" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-black border-2 border-yellow-400 text-yellow-400 px-3 py-1 rounded-full font-black text-[8px] uppercase">Membro Oficial</div>
          </div>
          <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] mb-2">{dados.camp.nome}</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none">{dados.pesq.nome_completo}</h1>
        </header>

        {/* RANKINGS POR CATEGORIA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {dados.performancePorCategoria.map((cat: any) => (
            <div key={cat.nome} className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-[35px] relative overflow-hidden group hover:border-yellow-400 transition-all">
               {cat.eDonoDoMaior && (
                 <div className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-1 rounded-lg font-black text-[7px] uppercase">👑 Big Fish</div>
               )}
               <h3 className="text-zinc-500 font-black uppercase text-[10px] mb-6 tracking-widest">{cat.nome}</h3>
               
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <p className="text-3xl font-black italic text-white">{cat.soma.toFixed(1)} <span className="text-xs text-zinc-600 not-italic">CM</span></p>
                    <p className="text-2xl font-black text-yellow-400 italic">{cat.posicao}º</p>
                  </div>
                  <p className="text-[9px] font-black uppercase text-zinc-700">Classificação na Categoria</p>
               </div>
            </div>
          ))}
        </div>

        {/* LISTA DE PEIXES DO TORNEIO */}
        <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800">
          <h2 className="text-xl font-black uppercase italic mb-8 border-l-4 border-yellow-400 pl-4">Registro de Lançamentos</h2>
          <div className="space-y-3">
            {dados.performancePorCategoria.flatMap((c:any) => c.peixes).map((p: any, i: number) => (
              <div key={i} className="bg-zinc-950 p-5 rounded-2xl flex justify-between items-center border border-zinc-800">
                <div>
                    <p className="font-black uppercase text-xs italic text-zinc-300">{p.especie}</p>
                    <p className="text-[8px] text-zinc-600 uppercase font-black">{new Date(p.data_captura).toLocaleDateString()}</p>
                </div>
                <p className="text-2xl font-black italic text-white">{p.tamanho_cm} <span className="text-[10px] text-zinc-600">CM</span></p>
              </div>
            ))}
            {dados.performancePorCategoria.reduce((a:any, b:any) => a + b.qtd, 0) === 0 && (
              <p className="text-center py-10 text-zinc-700 italic font-black uppercase text-xs tracking-widest">Nenhuma captura oficial neste torneio.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
