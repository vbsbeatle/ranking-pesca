'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PerfilPescador() {
  const params = useParams()
  // Decodifica o nome da URL (ex: Victor%20Sabbagh vira Victor Sabbagh)
  const nomePescador = decodeURIComponent(params.nome as string)
  
  const [capturas, setCapturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .eq('nome_pescador', nomePescador)
        .order('tamanho_cm', { ascending: false })
      
      if (data) setCapturas(data)
      setLoading(false)
    }
    if (nomePescador) carregar()
  }, [nomePescador])

  // Cálculos rápidos para o topo do perfil
  const maiorPeixe = capturas.length > 0 ? capturas[0].tamanho_cm : 0
  const totalCapturas = capturas.length

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      {/* CABEÇALHO DO PERFIL */}
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <a href="/">
             <img src="/logo-tr.jpg" alt="Logo" className="h-20 mb-6 rounded-lg border border-yellow-400/30" />
          </a>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">{nomePescador}</h1>
          <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px] mt-2 opacity-60 italic">Membro Trilhas do Rio</p>
          
          {/* ESTATÍSTICAS */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase">Capturas</p>
              <p className="text-3xl font-black">{totalCapturas}</p>
            </div>
            <div className="w-[1px] bg-gray-800"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase">Personal Best</p>
              <p className="text-3xl font-black text-white">{maiorPeixe}<span className="text-xs ml-1 text-yellow-400">cm</span></p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 shadow-lg skew-x-[-10deg]">
            Histórico de Capturas
          </h2>
          <div className="flex-1 h-1 bg-yellow-400"></div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black text-gray-300 animate-pulse uppercase">Carregando Histórico...</div>
        ) : capturas.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold uppercase italic">Nenhuma captura registrada para este membro.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capturas.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100 transition-all hover:scale-[1.02]">
                <div className="relative h-56 bg-gray-200">
                  <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Peixe" />
                  <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-4 py-1 rounded-full font-black text-xl border-2 border-yellow-400">
                    {item.tamanho_cm}cm
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col mb-4">
                     <span className="text-xl font-black uppercase italic leading-none">{item.grupo_especie}</span>
                     <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mt-1">
                       {item.subespecie}
                     </span>
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                       <span>📍 {item.local_captura || item.cidade}</span>
                       <span>{new Date(item.data_captura + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>

                    {/* O LINK SOLICITADO PARA O CERTIFICADO */}
                    <a 
                      href={`/captura/${item.id}`} 
                      className="block w-full text-center bg-black text-yellow-400 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-md"
                    >
                      Ver Certificado Oficial →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-12 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
        © 2026 Trilhas do Rio Pesca Esportiva
      </footer>
    </div>
  )
}
