'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GerenciarPage() {
  const [logado, setLogado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para Edição
  const [editandoPescador, setEditandoPescador] = useState<any>(null)
  const [editandoRecorde, setEditandoRecorde] = useState<any>(null)

  const checkLogin = (e: any) => {
    e.preventDefault()
    if (senhaInput === "TR123admin!") { 
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

  // --- FUNÇÕES DE EXCLUSÃO ---
  async function excluirPescador(id: string) {
    if (confirm("Excluir pescador? Capturas dele ficarão sem dono.")) {
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

  // --- FUNÇÕES DE EDIÇÃO (UPDATE) ---
  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { error } = await supabase.from('pescadores').update({
      nome_completo: editandoPescador.nome_completo,
      cidade: editandoPescador.cidade
    }).eq('id', editandoPescador.id)
    
    if (!error) {
      setEditandoPescador(null)
      carregarDados()
    }
  }

  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { error } = await supabase.from('recordes').update({
      tamanho_cm: parseFloat(editandoRecorde.tamanho_cm),
      local_captura: editandoRecorde.local_captura,
      data_captura: editandoRecorde.data_captura,
      carretilha: editandoRecorde.carretilha,
      vara: editandoRecorde.vara,
      isca: editandoRecorde.isca
    }).eq('id', editandoRecorde.id)

    if (!error) {
      setEditandoRecorde(null)
      carregarDados()
    }
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={checkLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-2xl font-black uppercase italic mb-6 text-black">Gerenciamento Master</h2>
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-4 text-black font-bold" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase italic">Painel de Gerenciamento</h1>
          <a href="/admin" className="text-xs font-bold uppercase underline text-gray-400 hover:text-black">Voltar ao Cadastro</a>
        </header>

        {/* SEÇÃO PESCADORES */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="bg-black text-yellow-400 p-4 font-black uppercase italic text-sm">Membros do Grupo ({pescadores.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Cidade</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pescadores.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{p.nome_completo}</td>
                    <td className="p-4 uppercase text-xs text-gray-500">{p.cidade}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Editar</button>
                      <button onClick={() => excluirPescador(p.id)} className="text-red-500 font-black uppercase text-[10px] hover:underline">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEÇÃO CAPTURAS (RECORDES) */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="bg-black text-white p-4 font-black uppercase italic text-sm">Histórico de Recordes ({recordes.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                <tr>
                  <th className="p-4">Pescador / Data</th>
                  <th className="p-4">Peixe / Local</th>
                  <th className="p-4">Tamanho</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recordes.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                        <div className="font-bold">{r.nome_pescador}</div>
                        <div className="text-[9px] text-gray-400 uppercase font-black">{r.data_captura}</div>
                    </td>
                    <td className="p-4">
                        <div className="font-black uppercase text-yellow-600 text-[10px]">{r.grupo_especie} ({r.subespecie})</div>
                        <div className="text-[10px] text-gray-500 italic">📍 {r.local_captura}</div>
                    </td>
                    <td className="p-4 font-black text-lg">{r.tamanho_cm}cm</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Editar</button>
                      <button onClick={() => excluirCaptura(r.id)} className="text-red-500 font-black uppercase text-[10px] hover:underline">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAL EDITAR PESCADOR --- */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-black uppercase italic mb-4">Editar Membro</h2>
            <input 
              value={editandoPescador.nome_completo} 
              onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})}
              className="w-full p-3 border-2 rounded font-bold" placeholder="Nome"
            />
            <input 
              value={editandoPescador.cidade} 
              onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})}
              className="w-full p-3 border-2 rounded font-bold" placeholder="Cidade"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditandoPescador(null)} className="flex-1 bg-gray-200 p-3 rounded font-bold uppercase text-xs">Cancelar</button>
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-xs shadow-lg">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL EDITAR RECORDE --- */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4 my-auto">
            <h2 className="text-xl font-black uppercase italic mb-4">Editar Captura</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400">Tamanho (cm)</label>
                    <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-2 border-2 rounded font-bold" />
                </div>
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400">Data</label>
                    <input type="date" value={editandoRecorde.data_captura} onChange={e => setEditandoRecorde({...editandoRecorde, data_captura: e.target.value})} className="w-full p-2 border-2 rounded font-bold" />
                </div>
            </div>

            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Local" />
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-[9px] font-black uppercase text-gray-400">Equipamento</p>
                <input value={editandoRecorde.carretilha} onChange={e => setEditandoRecorde({...editandoRecorde, carretilha: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Carretilha" />
                <input value={editandoRecorde.vara} onChange={e => setEditandoRecorde({...editandoRecorde, vara: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Vara" />
                <input value={editandoRecorde.isca} onChange={e => setEditandoRecorde({...editandoRecorde, isca: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Isca" />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setEditandoRecorde(null)} className="flex-1 bg-gray-200 p-3 rounded font-bold uppercase text-xs">Cancelar</button>
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-xs shadow-lg">Salvar Peixe</button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
