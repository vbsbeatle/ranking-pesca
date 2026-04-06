'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PescadorPage() {
  const params = useParams()
  const nome = params.nome ? decodeURIComponent(params.nome as string) : ''
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .eq('nome_pescador', nome)
        .order('tamanho_cm', { ascending: false })
      
      if (data) setRecordes(data)
      setLoading(false)
    }
    if (nome) carregarDados()
  }, [nome])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-yellow-400 py-16 px-4 border-b-8 border-yellow-400 text-center shadow-2xl">
        <a href="/" className="text-xs uppercase font-bold hover:underline mb-4 block opacity-70">← Voltar ao Ranking</a>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">{nome}</h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-60 uppercase">Perfil Oficial de Capturas</p>
      </header>

      <main className="max-w-6xl mx-auto p-8 -mt-10">
        {loading ? (
           <div className="text-center font-bold animate-pulse">Carregando histórico...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordes.map((r) => (
              <div key={r.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 border-b-4 border-b-yellow-400">
                <img src={r.url_foto_captura} className="h-48 w-full object-cover" alt="Peixe" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black uppercase italic text-lg">{r.grupo_especie}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{r.subespecie} | {r.modalidade_tipo}</p>
                    </div>
                    <span className="bg-black text-yellow-400 px-3 py-1 font-black rounded-lg shadow-md">{r.tamanho_cm}cm</span>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                    <span>📍 {r.cidade}</span>
                    <button onClick={() => window.open(r.url_foto_medicao, '_blank')} className="text-black hover:text-yellow-600 underline">Ver Prova</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
