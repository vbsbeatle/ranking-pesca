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

  // Função para filtrar o "Top 1" de cada categoria
  const categorias = [
    { grupo: 'Tucunaré', modalidade: 'Absoluto' },
    { grupo: 'Tucunaré', modalidade: 'Privado' },
    { grupo: 'Dourado', modalidade: 'Absoluto' },
    { grupo: 'Traíra', modalidade: 'Absoluto' },
    { grupo: 'Trairão', modalidade: 'Absoluto' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans">
      <header className="bg-black text-yellow-400 py-12 px-4 border-b-8 border-yellow-400 text-center">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          Hall da Fama
        </h1>
        <p className="mt-2 text-white font-bold tracking-widest opacity-80 uppercase">
          Trilhas do Rio Fishing Team
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        {loading ? (
          <div className="text-center py-20 font-black text-gray-400 animate-pulse uppercase">Carregando Ranking...</div>
        ) : (
          <div className="space-y-12">
            {categorias.map((cat) => {
              // Filtra os peixes dessa categoria específica
              const peixesDaCat = recordes.filter(r => 
                r.grupo_especie === cat.grupo && r.modalidade_tipo === cat.modalidade
              )

              if (peixesDaCat.length === 0) return null

              return (
                <section key={`${cat.grupo}-${cat.modalidade}`} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase italic bg-black text-yellow-400 px-4 py-1 skew-x-[-10deg]">
                      {cat.grupo} <span className="text-white opacity-50 ml-2">({cat.modalidade})</span>
                    </h2>
                    <div className="flex-1 h-1 bg-yellow-400"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {peixesDaCat.map((item, index) => (
                      <div key={item.id} className={`bg-white rounded-xl overflow-hidden shadow-lg border-2 ${index === 0 ? 'border-yellow-400 scale-105 z-10' : 'border-gray-200'}`}>
                        <div className="relative h-48 bg-gray-200">
                          <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Captura" />
                          {index === 0 && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-black font-black px-3 py-1 text-xs uppercase italic">
                              🏆 Recordista
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black text-yellow-400 px-3 py-1 rounded-lg font-black text-lg border border-yellow-400">
                            {item.tamanho_cm}cm
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-xl font-black uppercase italic truncate">{item.nome_pescador}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {item.subespecie}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                              📍 {item.cidade}
                            </span>
                          </div>
                          <button 
                            onClick={() => window.open(item.url_foto_medicao, '_blank')}
                            className="w-full mt-4 text-[10px] font-black uppercase border-2 border-black py-2 hover:bg-black hover:text-yellow-400 transition"
                          >
                            Ver Medição
                          </button>
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

      <footer className="bg-black text-gray-600 py-10 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
