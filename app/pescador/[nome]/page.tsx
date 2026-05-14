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
      
      // 1. Busca os dados do pescador pelo nome que vem na URL
      const { data: p } = await supabase
        .from('pescadores')
        .select('*')
        .eq('nome_completo', nomeDecodificado)
        .single()
      
      if (p) {
        setPescador(p)
        
        // 2. BUSCA AS CAPTURAS PELO ID (Muito mais seguro que pelo nome)
        const { data: c } = await supabase
          .from('recordes')
          .select('*')
          .eq('pescador_id', p.id) // Mudamos de nome_pescador para pescador_id
          .order('tamanho_cm', { ascending: false })
        
        if (c) setCapturas(c)
      }
      setLoading(false)
    }
    carregar()
  }, [nome])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Sincronizando Perfil...</div>
  if (!pescador) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase">Pescador não localizado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20">
      {/* HEADER DO PERFIL */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 pt-20 pb-12 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="h-40 w-40 md:h-52 md:w-52 rounded-[3rem] overflow-hidden border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.2)] mb-6">
            {/* url_foto conforme seu cadastro */}
            <img 
              src={pescador.url_foto || 'https://via.placeholder.com/400?text=Sem+Foto'} 
              className="h-full w-full object-cover" 
              alt="Foto do Pescador" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-center leading-none">{pescador.nome_completo}</h1>
          <p className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.5em] mt-4">Pescador Oficial PeixeBook</p>
        </div>
      </div>

      {/* ESTATÍSTICAS NO RANKING GERAL */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 px-4 -mt-8">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-600">Troféus</p>
          <p className="text-3xl font-black italic">{capturas.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-600">Maior Peixe</p>
          <p className="text-3xl font-black italic text-yellow-400">{capturas[0]?.tamanho_cm || 0}cm</p>
        </div>
        <div className="hidden md:block bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-600">Espécie Alvo</p>
          <p className="text-xl font-black italic uppercase">{capturas[0]?.grupo_especie || '---'}</p>
        </div>
      </div>

      {/* GALERIA DE RECORDES */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h2 className="text-xl font-black uppercase italic mb-8 border-l-4 border-yellow-400 pl-4 tracking-tight">Hall da Fama</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {capturas.map(c => (
            <div key={c.id} className="bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 group">
              <div className="h-48 overflow-hidden">
                {/* url_foto_captura conforme seu cadastro */}
                <img src={c.url_foto_captura} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-black uppercase text-xs italic text-zinc-300">{c.grupo_especie}</p>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{c.subespecie}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black italic text-yellow-400">{c.tamanho_cm}cm</p>
                </div>
              </div>
            </div>
          ))}
          {capturas.length === 0 && (
            <p className="col-span-full text-center py-20 text-zinc-800 font-black uppercase italic tracking-widest">Ainda não há recordes registrados no Ranking Geral.</p>
          )}
        </div>
      </div>
    </div>
  )
}
