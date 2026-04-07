'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GerenciarPage() {
  const [logado, setLogado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const checkLogin = (e: any) => {
    e.preventDefault()
    // Use a mesma lógica de senha que definiu anteriormente
    if (senhaInput === "suasenhaqui") { 
      setLogado(true)
      carregarDados()
    } else {
      alert("Senha incorreta")
    }
  }

  async function carregarDados() {
    setLoading(true)
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    const { data: r } = await supabase.from('recordes').select('*').order('created_at', { ascending: false })
    if (p) setPescadores(p)
    if (r) setRecordes(r)
    setLoading(false)
  }

  async function excluirPescador(id: string) {
    if (confirm("Atenção: Excluir um pescador pode causar erros em capturas vinculadas a ele. Deseja continuar?")) {
      await supabase.from('pescadores').delete().eq('id', id)
      carregarDados()
    }
  }

  async function excluirCaptura(id: string) {
    if (confirm("Deseja realmente excluir esta captura?")) {
      await supabase.from('recordes').delete().eq('id', id)
      carregarDados()
    }
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={checkLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-2xl font-black uppercase italic mb-6">Gerenciamento</h2>
          <input type="password" placeholder="Senha Master" className="w-full p-4 border-2 rounded-xl mb-4 outline-none" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase italic">Painel de Controle</h1>
          <a href="/admin" className="text-xs font-bold uppercase underline text-gray-500 hover:text-black">Voltar ao Cadastro</a>
        </header>

        {/* SEÇÃO PESCADORES */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-black text-yellow-400 p-4 font-black uppercase italic">Membros Cadastrados ({pescadores.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Cidade</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pescadores.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-4 font-bold">{p.nome_completo}</td>
                    <td className="p-4 uppercase text-xs">{p.cidade}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => excluirPescador(p.id)} className="text-red-500 font-black uppercase text-[10px] hover:underline">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEÇÃO CAPTURAS */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border-b-8 border-red-500">
          <div className="bg-black text-white p-4 font-black uppercase italic">Gerenciar Capturas ({recordes.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-4">Pescador</th>
                  <th className="p-4">Peixe</th>
                  <th className="p-4 text-center">Tamanho</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recordes.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-4 font-bold">{r.nome_pescador}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-yellow-600">{r.grupo_especie} ({r.subespecie})</td>
                    <td className="p-4 text-center font-black">{r.tamanho_cm}cm</td>
                    <td className="p-4 text-right">
                      <button onClick={() => excluirCaptura(r.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded font-black uppercase text-[9px] hover:bg-red-600 hover:text-white transition-all">Excluir Registro</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
