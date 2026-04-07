'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RankingLista() {
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('recordes')
        .select('*')
        .order('tamanho_cm', { ascending: false })
      if (data) setRecordes(data)
      setLoading(false)
    }
    carregar()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-yellow-400 p-6 border-b-4 border-yellow-400 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic">Ranking Geral (Lista)</h1>
          <a href="/" className="text-xs bg-yellow-400 text-black px-4 py-2 rounded font-bold uppercase">← Voltar</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="p-4 border-b">Pescador</th>
                <th className="p-4 border-b">Espécie</th>
                <th className="p-4 border-b">Tamanho</th>
                <th className="p-4 border-b">Cidade</th>
                <th className="p-4 border-b text-center">Detalhes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-bold animate-pulse">Carregando dados...</td></tr>
              ) : recordes.map((r) => (
                <tr key={r.id} className="hover:bg-yellow-50 border-b border-gray-100 transition-colors">
                  <td className="p-4 font-bold uppercase italic">{r.nome_pescador}</td>
                  <td className="p-4">
                    <span className="font-black block uppercase">{r.grupo_especie}</span>
                    <span className="text-[10px] text-yellow-600 font-bold uppercase">{r.subespecie}</span>
                  </td>
                  <td className="p-4 font-black text-lg">{r.tamanho_cm}cm</td>
                  <td className="p-4 text-gray-500 uppercase font-bold text-[10px]">{r.cidade}</td>
                  <td className="p-4 text-center">
                    <a href={`/captura/${r.id}`} className="bg-black text-white px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors">Abrir</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
