'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CertificadoCaptura() {
  const { id } = useParams()
  const [captura, setCaptura] = useState<any>(null)
  const [pescador, setPescador] = useState<any>(null)
  const [posicao, setPosicao] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarCertificado() {
      if (!id) return
      setLoading(true)

      // 1. Puxa os dados da captura
      const { data: cap } = await supabase.from('recordes').select('*').eq('id', id).single()

      if (cap) {
        setCaptura(cap)

        // 2. Puxa o pescador para conferir o gênero
        const { data: pes } = await supabase.from('pescadores').select('*').eq('id', cap.pescador_id).single()
        const sexoPescador = pes?.sexo || 'Masculino'
        setPescador({ ...pes, sexo: sexoPescador })

        // 3. Calcula a posição exata no ranking DENTRO DA CATEGORIA DE GÊNERO
        const { data: todosRecordes } = await supabase
          .from('recordes')
          .select('*')
          .eq('grupo_especie', cap.grupo_especie)
          .eq('subespecie', cap.subespecie)
          .or('status.eq.aprovado,status.is.null')
          .order('tamanho_cm', { ascending: false })

        if (todosRecordes) {
          // Puxa todos os pescadores envolvidos para filtrar por gênero
          const idsPescadores = todosRecordes.map(r => r.pescador_id).filter(Boolean)
          const { data: listaPes } = await supabase.from('pescadores').select('id, sexo').in('id', idsPescadores)
          
          const mapSex: Record<string, string> = {}
          listaPes?.forEach(p => { mapSex[p.id] = p.sexo || 'Masculino' })

          // Filtra do ranking apenas peixes do mesmo gênero
          const rankingGenero = todosRecordes.filter(r => (mapSex[r.pescador_id] || 'Masculino') === sexoPescador)
          
          // Acha o índice do peixe atual
          const idx = rankingGenero.findIndex(r => r.id === cap.id)
          if (idx !== -1) setPosicao(idx + 1)
        }
      }
      setLoading(false)
    }
    carregarCertificado()
  }, [id])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Emitindo Certificado...</div>
  if (!captura) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase">Captura não encontrada.</div>

  const sexoTexto = pescador?.sexo === 'Feminino' ? 'Feminino' : 'Masculino'

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-10 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-zinc-900 rounded-[3rem] p-6 md:p-12 border-4 border-yellow-400 shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden">
        
        {/* SELO DE POSIÇÃO NO CERTIFICADO */}
        <div className="absolute top-6 right-6 bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase italic tracking-tighter shadow-2xl">
          🏆 {posicao}º Lugar {captura.grupo_especie} {sexoTexto}
        </div>

        <header className="text-center mb-8 border-b border-zinc-800 pb-6">
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Certificado Oficial de Registro</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white leading-none">Peixe<span className="text-yellow-400">Book</span></h1>
        </header>

        {/* FOTO E TAMANHO */}
        <div className="relative rounded-3xl overflow-hidden mb-8 border-2 border-zinc-800">
          <img src={captura.url_foto_captura} className="w-full max-h-[450px] object-cover" alt="Troféu" />
          <div className="absolute bottom-4 right-4 bg-black/90 text-yellow-400 px-6 py-3 rounded-2xl font-black text-3xl md:text-4xl border border-yellow-400/50 shadow-2xl">
            {captura.tamanho_cm} CM
          </div>
        </div>

        {/* DETALHES TÉCNICOS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-black/50 p-6 rounded-3xl border border-zinc-800/80 mb-8 text-xs">
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Pescador(a)</p>
            <p className="font-black uppercase text-sm text-yellow-400">{captura.nome_pescador}</p>
          </div>
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Espécie / Subespécie</p>
            <p className="font-bold uppercase text-white">{captura.grupo_especie} ({captura.subespecie})</p>
          </div>
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Localização</p>
            <p className="font-bold uppercase text-white">{captura.local_captura}</p>
          </div>
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Data do Registro</p>
            <p className="font-bold uppercase text-white">{new Date(captura.data_captura).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Categoria</p>
            <p className="font-bold uppercase text-white">{captura.modalidade_tipo || 'Absoluto'}</p>
          </div>
          <div>
            <p className="text-zinc-500 font-black uppercase text-[9px]">Equipamento (Vara / Isca)</p>
            <p className="font-bold uppercase text-white">{captura.vara || '---'} / {captura.isca || '---'}</p>
          </div>
        </div>

        <footer className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-600 border-t border-zinc-800 pt-6">
          <span>Autenticado por Trilhas do Rio</span>
          <span>PeixeBook ID: #{captura.id.substring(0, 8)}</span>
        </footer>
      </div>
    </div>
  )
}
