'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarRecordes() {
      const { data, error } = await supabase
        .from('recordes')
        .select('*')
        .order('tamanho_cm', { ascending: false })
      
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregarRecordes()
  }, [])

  // Agrupar por Categoria e selecionar apenas o Personal Best de cada pescador
  const categoriasUnicas = Array.from(new Set(recordes.map(r => `${r.grupo_especie}|${r.modalidade_tipo}`)))

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 text-center">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Hall da Fama</h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-80 uppercase">Trilhas do Rio Fishing Team</p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        {loading ? (
          <div className="text-center py-20 font-black text-gray-400 animate-pulse uppercase">Carregando Ranking...</div>
        ) : (
          <div className="space-y-16">
            {categoriasUnicas.map((catKey) => {
              const [grupo, modalidade] = catKey.split('|')
              
              // 1. Pega todos os peixes dessa categoria
              const peixesDaCat = recordes.filter(r => r.grupo_especie === grupo && r.modalidade_tipo === modalidade)
              
              // 2. Filtra para mostrar apenas o MELHOR de cada pescador (Personal Best)
              const rankingPB: any[] = []
              const pescadoresVistos = new Set()

              peixesDaCat.forEach(p => {
                if (!pescadoresVistos.has(p.nome_pescador)) {
                  rankingPB.push(p)
                  pescadoresVistos.add(p.nome_pescador)
                }
              })

              return (
                <section key={catKey} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 skew-x-[-10deg] shadow-lg">
                      {grupo} <span className="text-white opacity-50 ml-2 text-sm">{modalidade}</span>
                    </h2>
                    <div className="flex-1 h-1 bg-yellow-400 shadow-sm"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {rankingPB.map((item, index) => (
                      <div key={item.id} className={`bg-white rounded-2xl overflow-hidden shadow-xl border-2 transition-transform hover:scale-[1.02] ${index === 0 ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-gray-100'}`}>
                        <div className="relative h-56 bg-gray-200">
                          <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Captura" />
                          {index === 0 && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-black font-black px-4 py-1 text-xs uppercase italic shadow-md">
                              🏆 Recordista
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-4 py-1 rounded-full font-black text-xl border-2 border-yellow-400 shadow-2xl">
                            {item.tamanho_cm}cm
                          </div>
                        </div>

                        <div className="p-6">
                          <a href={`/pescador/${encodeURIComponent(item.nome_pescador)}`} className="text-2xl font-black uppercase italic hover:text-yellow-600 transition-colors block">
                            {item.nome_pescador}
                          </a>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.subespecie}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">📍 {item.cidade}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
      <footer className="bg-black text-gray-600 py-12 text-center text-[10px] font-bold uppercase tracking-[0.3em]">
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
