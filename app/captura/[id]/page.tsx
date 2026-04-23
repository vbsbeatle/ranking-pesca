'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const { id } = useParams()
  const [registro, setRegistro] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('recordes').select('*').eq('id', id).single()
      if (data) setRegistro(data)
      setLoading(false)
    }
    carregar()
  }, [id])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Carregando Troféu...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-900 p-4 md:p-10 flex justify-center items-start font-sans">
      
      {/* MOLDURA DO CERTIFICADO */}
      <div className="bg-white w-full max-w-3xl border-[12px] border-double border-yellow-500 p-6 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* LOGO E TÍTULO */}
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/logo-tr.jpg" 
              alt="Logo Trilhas do Rio" 
              className="h-24 w-auto rounded shadow-md"
            />
            <div className="mt-2">
              <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-black">
                Certificado de <span className="text-yellow-600">Captura</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">Trilhas do Rio Pesca Esportiva</p>
            </div>
          </div>
        </header>

        {/* NOME DO PESCADOR (COM ESPAÇO ADICIONAL) */}
        <section className="text-center my-16 relative z-10">
          <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Certificamos com honra que o pescador</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic text-black border-b-8 border-black inline-block px-6 pb-2 leading-tight">
            {registro.nome_pescador}
          </h2>
        </section>

        {/* DETALHES TÉCNICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          
          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Espécie / Subespécie</p>
              <p className="text-2xl font-black uppercase italic text-black">
                {registro.grupo_especie} <span className="text-yellow-600">({registro.subespecie})</span>
              </p>
            </div>

            <div className="bg-black text-yellow-400 p-6 rounded-2xl inline-block shadow-2xl">
              <p className="text-[10px] font-black uppercase opacity-70 mb-1 text-white tracking-widest">Comprimento</p>
              <p className="text-6xl font-black italic">{registro.tamanho_cm}<span className="text-3xl ml-1">CM</span></p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-black font-bold text-xs uppercase">
              <div>
                <p className="text-[9px] text-gray-400 font-black mb-1">Data da Captura</p>
                <p className="text-sm">{new Date(registro.data_captura).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black mb-1">Local</p>
                <p className="text-sm">{registro.local_captura}</p>
              </div>
            </div>
          </div>

          {/* FOTO POLAROID */}
          <div className="flex items-center justify-center">
            <div className="bg-white p-3 shadow-2xl border border-gray-100 rotate-3 transition-transform hover:rotate-0">
               <img 
                 src={registro.url_foto_captura} 
                 alt="Foto da Captura" 
                 className="w-full h-72 object-cover" 
               />
               <p className="text-center font-serif italic text-gray-400 text-xs mt-3">Registro Histórico TR</p>
            </div>
          </div>

        </div>

        {/* RODAPÉ DE EQUIPAMENTOS */}
        <footer className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 text-center relative z-10">
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Isca Utilizada</p>
            <p className="text-[11px] font-black uppercase text-black">{registro.isca || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Modalidade</p>
            <p className="text-[11px] font-black uppercase text-black">{registro.modalidade_tipo}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Vara / Carretilha</p>
            <p className="text-[11px] font-black uppercase text-black">{registro.carretilha || 'N/A'}</p>
          </div>
        </footer>

      </div>

      {/* BOTÃO DE VOLTAR (NÃO APARECE NA IMPRESSÃO) */}
      <button 
        onClick={() => window.history.back()} 
        className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-sm shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden"
      >
        ← Voltar
      </button>

    </div>
  )
}
