'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [filtroSub, setFiltroSub] = useState('Todas')
  const [loading, setLoading] = useState(true)

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('recordes').select('*').order('tamanho_cm', { ascending: false })
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregar()
  }, [])

  // 1. Filtragem dos dados
  const filtrados = recordes.filter(r => {
    const nome = (r.nome_pescador || "").toLowerCase()
    const cidade = (r.cidade || "").toLowerCase()
    const termo = busca.toLowerCase()
    
    const bB = nome.includes(termo) || cidade.includes(termo)
    const bE = filtroEspecie === 'Todas' || r.grupo_especie === filtroEspecie
    const bS = filtroSub === 'Todas' || r.subespecie === filtroSub
    
    return bB && bE && bS
  })

  // 2. Criação das categorias (Simplificada para evitar erro de sintaxe)
  const listaCategorias = Array.from(new Set(filtrados.map(r => r.grupo_especie + "|" + r.modalidade_tipo)))

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* CABEÇALHO */}
     <header className="bg-black text-yellow-400 py-10 px-4 border-b-8 border-yellow-400 shadow-2xl">
  <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
    
    {/* LOGO CENTRALIZADA */}
    <div className="relative group cursor-pointer">
      <img 
        src="/logo-tr.jpg" 
        alt="Trilhas do Rio Pesca Esportiva" 
        className="h-48 md:h-64 w-auto transition-transform duration-500 group-hover:scale-105" 
      />
      {/* BRILHO ATRÁS DA LOGO (OPCIONAL PARA ESTILO) */}
      <div className="absolute inset-0 bg-yellow-400/10 blur-3xl -z-10 rounded-full"></div>
    </div>

    {/* SUBTÍTULO DISCRETO */}
    <div className="mt-4 text-center">
      <h2 className="text-white font-black uppercase italic tracking-[0.4em] text-[10px] opacity-60">
        Ranking de Recordes Oficiais
      </h2>
      <div className="h-1 w-12 bg-yellow-400 mx-auto mt-2"></div>
    </div>

  </div>
</header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-10">
        <div className="flex justify-end mb-4">
          <a href="/ranking-lista" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase italic text-[10px] shadow-lg border-2 border-black hover:bg-black hover:text-yellow-400 transition-all">
            📊 Ver Ranking em Tabela
          </a>
        </div>

        {/* FILTROS */}
        <section className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="🔍 Nome ou Cidade..." 
            className="p-3 bg-gray-50 border-2 rounded-lg outline-none focus:border-yellow-400 font-bold"
            onChange={(e) => setBusca(e.target.value)} 
          />
          <select 
            onChange={(e) => { setFiltroEspecie(e.target.value); setFiltroSub('Todas'); }} 
            className="p-3 bg-gray-50 border-2 rounded-lg font-black"
          >
            <option value="Todas">Todas Espécies</option>
            {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select 
            disabled={filtroEspecie === 'Todas'} 
            onChange={(e) => setFiltroSub(e.target.value)} 
            className="p-3 border-2 rounded-lg font-black disabled:opacity-20"
          >
            <option value="Todas">Subespécie (Todas)</option>
            {filtroEspecie !== 'Todas' && subMap[filtroEspecie].map((s:string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </section>

        {/* LISTAGEM POR CATEGORIA */}
        {loading ? (
          <div className="text-center py-20 font-black text-gray-300 animate-pulse">CARREGANDO RANKING...</div>
        ) : (
          <div className="space-y-16">
            {listaCategorias.map(cat => {
              const partes = cat.split('|')
              const g = partes[0]
              const m = partes[1]
              
              const peixesDaCat = filtrados.filter(r => r.grupo_especie === g && r.modalidade_tipo === m)
              
              // Personal Best (apenas o maior de cada um)
              const pb: any[] = []
              const vistos = new Set()
              peixesDaCat.forEach(p => { 
                if(!vistos.has(p.nome_pescador)){ 
                  pb.push(p); vistos.add(p.nome_pescador); 
                } 
              })

              return (
                <section key={cat} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black uppercase italic bg-black text-yellow-400 px-6 py-2 shadow-lg skew-x-[-10deg]">
                      {g} <span className="text-white opacity-40 ml-2 text-xs">{m}</span>
                    </h2>
                    <div className="flex-1 h-1 bg-yellow-400"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pb.map((item, idx) => (
                      <div key={item.id} className={`bg-white rounded-2xl overflow-hidden shadow-xl border-2 transition-all hover:scale-[1.02] ${idx === 0 ? 'border-yellow-400 ring-4 ring-yellow-400/10' : 'border-gray-100'}`}>
                        <div className="relative h-56 bg-gray-200">
                          <img src={item.url_foto_captura} className="w-full h-full object-cover" alt="Peixe" />
                          <div className="absolute bottom-3 right-3 bg-black text-yellow-400 px-4 py-1 rounded-full font-black text-xl border-2 border-yellow-400 shadow-2xl">
                            {item.tamanho_cm}cm
                          </div>
                        </div>

                        <div className="p-6">
                          {/* ESPÉCIE EM DESTAQUE E SUBESPÉCIE ABAIXO */}
                          <div className="flex flex-col mb-4">
                             <span className="text-2xl font-black uppercase italic leading-none">{item.grupo_especie}</span>
                             <span className="text-[11px] font-black text-yellow-600 uppercase tracking-[0.2em] mt-1">
                               {item.subespecie}
                             </span>
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <a href={`/pescador/${encodeURIComponent(item.nome_pescador)}`} className="text-lg font-bold uppercase hover:text-yellow-600 block leading-tight">
                              {item.nome_pescador}
                            </a>
                            <div className="flex justify-between items-center mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                               <span>📍 {item.cidade}</span>
                               <a href={`/captura/${item.id}`} className="text-black hover:underline font-black">DETALHES →</a>
                            </div>
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
      <footer className="bg-black text-gray-700 py-12 text-center text-[10px] font-bold uppercase tracking-[0.4em]">
        © 2026 Trilhas do Rio Fishing Team
      </footer>
    </div>
  )
}
