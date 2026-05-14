'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PerfilPescador() {
  const { nome } = useParams()
  const [pescador, setPescador] = useState<any>(null)
  const [capturas, setCapturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const nomeDecodificado = decodeURIComponent(nome as string)
      const { data: p } = await supabase.from('pescadores').select('*').eq('nome_completo', nomeDecodificado).single()
      
      if (p) {
        setPescador(p)
        const { data: c } = await supabase.from('recordes').select('*').eq('nome_pescador', p.nome_completo).order('tamanho_cm', { ascending: false })
        if (c) setCapturas(c)
      }
      setLoading(false)
    }
    carregar()
  }, [nome])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Buscando Pescador...</div>
  if (!pescador) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">Pescador não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 pt-20 pb-12 px-4 border-b border-zinc-800 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="h-40 w-40 md:h-52 md:w-52 mx-auto rounded-[3rem] overflow-hidden border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.2)] mb-6">
            {/* AJUSTADO PARA url_foto */}
            <img src={pescador.url_foto || 'https://via.placeholder.com/400?text=Sem+Foto'} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none">{pescador.nome_completo}</h1>
          <p className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.5em] mt-4">Pescador Oficial PeixeBook</p>
        </div>
      </div>
      {/* ... (resto da galeria de recordes) */}
    </div>
  )
}
