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
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-900 p-4 md:p-10 flex justify-center items-start font-sans">
      
      {/* MOLDURA DO CERTIFICADO */}
      <div className="bg-white w-full max-w-3xl border-[12px] border-double border-yellow-500 p-6 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* FUNDO DE MARCA D'ÁGUA (OPCIONAL) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <img src="/logo-tr.jpg" alt="Watermark" className="w-1/2" />
        </div>

        {/* CABEÇALHO COM LOGO */}
        <header className="text-center border-b-2 border-gray-200 pb-6 mb-10 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo-tr.jpg" alt="Logo Trilhas do Rio" className="h-20 w-auto rounded shadow-sm border border-gray-100" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-black">
                Certificado de <span className="text-yellow-600">Captura</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-1">Trilhas do Rio Pesca Esportiva</p>
            </div>
          </div>
        </header>

        {/* NOME DO PESCADOR (COM ESPAÇAMENTO ADICIONAL) */}
        <section className="text-center mb-10 mt-12 relative z-10">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Certificamos que o pescador</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase italic text-black border-b-4 border-black inline-block px-4 pb-2">
            {registro.nome_pescador}
          </h2>
        </section>

        {/* DETALHES DO PEIXE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          <div className="space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400">Espécie / Subespécie</p>
              <p className="text-xl font-black uppercase italic text-yellow-700">{registro.grupo_especie} <span className="text-black">({registro.subespecie})</span></p>
            </div>

            <div className="bg-black text-yellow-400 p-4 rounded-xl inline-block shadow-lg">
              <p className="text-[9px] font-black uppercase opacity-70 mb-1 text-white">Comprimento Oficial</p>
              <p className="text-5xl font-black italic">{registro.tamanho_cm}<span className="text-2xl ml-1 uppercase">cm</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-black font-bold text-xs uppercase">
              <div>
                <p className="text-[8px] text-gray-400 font-black">Data</p>
                <p>{new Date(registro.data_captura).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-[8px] text-gray-400 font-black">Localização</p>
                <p>{registro.local_captura}</p>
              </div>
            </div>
          </div>

          {/* FOTO DO PEIXE */}
          <div className="border-4 border-black rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform">
            <img src={registro.url_foto_captura} alt="Foto da Captura" className="w-full h-64 object-cover" />
          </div>

        </div>

        {/* RODAPÉ TÉCNICO */}
        <footer className="mt-12 pt-6 border-t-2 border-gray-100 grid grid-cols-3 gap-2 text-center relative z-10">
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Isca</p>
            <p className="text-[10px] font-bold uppercase">{registro.isca || 'Não informada'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Modalidade</p>
            <p className="text-[10px] font-bold uppercase">{registro.modalidade_tipo}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase">Equipamento</p>
            <p className="text-[10px] font-bold uppercase">{registro.carretilha || 'N/A'}</p>
          </div>
        </footer}

        {/* SELO DE AUTENTICIDADE */}
        <div className="absolute bottom-6 right-6 opacity-20 hidden md:block">
            <div className="w-24 h-24 border-4 border-gray-400 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-center p-2 rotate-12">
                Registro Oficial Trilhas do Rio
            </div>
        </div>

      </div>

      {/* BOTÃO VOLTAR (FORA DO CERTIFICADO PARA NÃO SAIR NA IMPRESSÃO) */}
      <button 
        onClick={() => window.history.back()} 
        className="fixed bottom-6 right-6 bg-yellow-400 text-black px-6 py-3 rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden"
      >
        ← Voltar
      </button>

    </div>
  )
}
