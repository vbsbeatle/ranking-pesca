'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PerfilPescador() {
  const { nome } = useParams()
  const [pescador, setPescador] = useState<any>(null)
  const [capturas, setCapturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const nomeDecodificado = decodeURIComponent(nome as string)
      
      // 1. Busca dados do pescador
      const { data: p } = await supabase.from('pescadores').select('*').eq('nome_completo', nomeDecodificado).single()
      
      if (p) {
        setPescador(p)
        // 2. Busca capturas dele no ranking geral
        const { data: c } = await supabase.from('recordes').select('*').eq('nome_pescador', p.nome_completo).order('tamanho_cm', { ascending: false })
        if (c) setCapturas(c)
      }
      setLoading(false)
    }
    carregar()
  }, [nome])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Buscando Pescador...</div>
  if (!pescador) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Pescador não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20">
      {/* HEADER DO PERFIL */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 pt-20 pb-12 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="h-40 w-40 md:h-52 md:w-52 rounded-[3rem] overflow-hidden border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.2)] mb-6">
            <img 
              src={pescador.url_foto_perfil || 'https://via.placeholder.com/400?text=Sem+Foto'} 
              className="h-full w-full object-cover" 
              alt="Perfil" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-center leading-none">{pescador.nome_completo}</h1>
          <p className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.5em] mt-4">Membro Oficial PeixeBook</p>
        </div>
      </div>

      {/* ESTATÍSTICAS RÁPIDAS */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 px-4 -mt-8">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Troféus</p>
          <p className="text-3xl font-black italic">{capturas.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Maior Peixe</p>
          <p className="text-3xl font-black italic text-yellow-400">{capturas[0]?.tamanho_cm || 0}cm</p>
        </div>
        <div className="hidden md:block bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Espécie Alvo</p>
          <p className="text-xl font-black italic uppercase">{capturas[0]?.grupo_especie || 'N/A'}</p>
        </div>
      </div>

      {/* GALERIA DE RECORDES NO PEIXEBOOK GERAL */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h2 className="text-xl font-black uppercase italic mb-8 border-l-4 border-yellow-400 pl-4">Hall da Fama Individual</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {capturas.map(c => (
            <a key={c.id} href={`/captura/${c.id}`} className="bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 hover:border-yellow-400 transition-all">
              <img src={c.url_foto_captura} className="h-48 w-full object-cover opacity-80" />
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-black uppercase text-xs italic">{c.grupo_especie}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">{c.subespecie}</p>
                </div>
                <p className="text-2xl font-black italic text-yellow-400">{c.tamanho_cm}cm</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
