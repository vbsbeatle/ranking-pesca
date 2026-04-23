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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic tracking-widest">Validando Troféu...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-900 p-2 md:p-10 flex justify-center items-start font-sans">
      
      {/* MOLDURA DO CERTIFICADO */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        {/* LOGO E TÍTULO */}
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/logo-tr.jpg" 
              alt="Logo Trilhas do Rio" 
              className="h-20 md:h-28 w-auto rounded shadow-md border border-gray-100"
            />
            <div className="mt-2">
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">
                Certificado de <span className="text-yellow-600">Captura</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-3">Trilhas do Rio Pesca Esportiva</p>
            </div>
          </div>
        </header>

        {/* NOME DO PESCADOR */}
        <section className="text-center my-10 md:my-14 relative z-10">
          <p className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Certificamos com honra que o pescador</p>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic text-black border-b-4 md:border-b-8 border-black inline-block px-4 md:px-8 pb-3 leading-tight">
            {registro.nome_pescador}
          </h2>
        </section>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* DADOS TÉCNICOS */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-gray-50 p-5 rounded-xl border-l-8 border-yellow-500 shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Espécie / Subespécie</p>
              <p className="text-xl md:text-2xl font-black uppercase italic text-black leading-tight">
                {registro.grupo_especie}
              </p>
              <p className="text-xs md:text-sm font-black text-yellow-600 uppercase tracking-widest">
                {registro.subespecie}
              </p>
            </div>

            <div className="bg-black text-yellow-400 p-6 rounded-2xl shadow-2xl inline-block w-full text-center lg:text-left">
              <p className="text-[10px] font-black uppercase opacity-70 mb-1 text-white tracking-[0.2em]">Medida Oficial</p>
              <p className="text-5xl md:text-7xl font-black italic">{registro.tamanho_cm}<span className="text-2xl md:text-3xl ml-2">CM</span></p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-black font-bold text-xs uppercase pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-lg">📅</span>
                <p><span className="text-[9px] text-gray-400 font-black block leading-none mb-1">Data</span> {new Date(registro.data_captura).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-lg">📍</span>
                <p><span className="text-[9px] text-gray-400 font-black block leading-none mb-1">Local</span> {registro.local_captura}</p>
              </div>
            </div>
          </div>

          {/* FOTOS INTEGRAIS (SEM CORTE) */}
          <div className="lg:col-span-8 space-y-6">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest text-center italic">— Provas de Campo (Originais) —</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FOTO 1: TROFÉU */}
              <div className="bg-white p-2 shadow-xl border border-gray-200 -rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
                 <div className="w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={registro.url_foto_captura} 
                      alt="Foto do Troféu" 
                      className="max-w-full h-auto max-h-[350px] object-contain" 
                    />
                 </div>
                 <p className="font-serif italic text-gray-400 text-[10px] mt-2">O Peixe</p>
              </div>

              {/* FOTO 2: MEDIÇÃO */}
              <div className="bg-white p-2 shadow-xl border border-gray-200 rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
                 <div className="w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={registro.url_foto_medicao} 
                      alt="Prova de Medição" 
                      className="max-w-full h-auto max-h-[350px] object-contain" 
                    />
                 </div>
                 <p className="font-serif italic text-gray-400 text-[10px] mt-2">A Régua</p>
              </div>
            </div>
          </div>

        </div>

        {/* RODAPÉ EQUIPAMENTOS */}
        <footer className="mt-12 md:mt-16 pt-8 border-t-2 border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center relative z-10">
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Equipamento</p>
            <p className="text-[10px] font-black uppercase text-black">{registro.carretilha || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Isca</p>
            <p className="text-[10px] font-black uppercase text-black">{registro.isca || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Vara</p>
            <p className="text-[10px] font-black uppercase text-black">{registro.vara || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Modalidade</p>
            <p className="text-[10px] font-black uppercase text-black">{registro.modalidade_tipo}</p>
          </div>
        </footer>

        {/* SELO NO FUNDO */}
        <div className="absolute -bottom-16 -right-16 opacity-5 pointer-events-none">
            <img src="/logo-tr.jpg" alt="Watermark" className="w-80 h-80 rotate-12" />
        </div>

      </div>

      {/* BOTÃO VOLTAR */}
      <button 
        onClick={() => window.history.back()} 
        className="fixed bottom-6 right-6 bg-yellow-400 text-black px-6 py-3 rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden z-50"
      >
        ← Voltar
      </button>

    </div>
  )
}
