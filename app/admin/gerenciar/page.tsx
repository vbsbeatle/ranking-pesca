'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GerenciarPage() {
  const [logado, setLogado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editandoPescador, setEditandoPescador] = useState<any>(null)
  const [editandoRecorde, setEditandoRecorde] = useState<any>(null)

  const checkLogin = (e: any) => {
    e.preventDefault()
    // Lembre-se de trocar pela sua senha
    if (senhaInput === "TR123admin!") { 
      setLogado(true)
      carregarDados()
    } else {
      alert("Senha incorreta")
    }
  }

  async function carregarDados() {
    setLoading(true)
    console.log("Buscando dados no Supabase...")
    
    // Busca Pescadores
    const resP = await supabase.from('pescadores').select('*').order('nome_completo')
    if (resP.error) console.error("Erro Pescadores:", resP.error.message)
    else setPescadores(resP.data || [])

    // Busca Capturas
    const resR = await supabase.from('recordes').select('*').order('created_at', { ascending: false })
    if (resR.error) console.error("Erro Capturas:", resR.error.message)
    else {
      console.log("Capturas encontradas:", resR.data?.length)
      setRecordes(resR.data || [])
    }
    
    setLoading(false)
  }

  // --- EXCLUSÃO ---
  async function excluirPescador(id: string) {
    if (confirm("Excluir membro?")) {
      const { error } = await supabase.from('pescadores').delete().eq('id', id)
      if (error) alert("Erro ao excluir: " + error.message)
      else carregarDados()
    }
  }

  async function excluirCaptura(id: string) {
    if (confirm("Excluir captura?")) {
      const { error } = await supabase.from('recordes').delete().eq('id', id)
      if (error) alert("Erro ao excluir: " + error.message)
      else carregarDados()
    }
  }

  // --- SALVAR EDIÇÃO ---
  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { error } = await supabase
      .from('pescadores')
      .update({
        nome_completo: editandoPescador.nome_completo,
        cidade: editandoPescador.cidade
      })
      .eq('id', editandoPescador.id)
    
    if (error) {
      alert("Erro ao salvar pescador: " + error.message)
    } else {
      alert("Pescador atualizado com sucesso!")
      setEditandoPescador(null)
      carregarDados()
    }
  }

  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { error } = await supabase
      .from('recordes')
      .update({
        tamanho_cm: parseFloat(editandoRecorde.tamanho_cm),
        local_captura: editandoRecorde.local_captura,
        data_captura: editandoRecorde.data_captura,
        carretilha: editandoRecorde.carretilha,
        vara: editandoRecorde.vara,
        isca: editandoRecorde.isca
      })
      .eq('id', editandoRecorde.id)

    if (error) {
      alert("Erro ao salvar captura: " + error.message)
    } else {
      alert("Captura atualizada!")
      setEditandoRecorde(null)
      carregarDados()
    }
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={checkLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 text-black">
          <h2 className="text-2xl font-black uppercase italic mb-6">Painel Master</h2>
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-4 font-bold" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase italic">Gerenciamento</h1>
          <a href="/admin" className="text-xs font-bold uppercase underline text-gray-500">Voltar</a>
        </header>

        {/* TABELA PESCADORES */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          <div className="bg-black text-yellow-400 p-4 font-black uppercase italic text-sm tracking-widest">Membros ({pescadores.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="text-sm">
                {pescadores.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{p.nome_completo}</td>
                    <td className="p-4 uppercase text-[10px] text-gray-400">{p.cidade}</td>
                    <td className="p-4 text-right space-x-4">
                      <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-black uppercase text-[10px]">Editar</button>
                      <button onClick={() => excluirPescador(p.id)} className="text-red-500 font-black uppercase text-[10px]">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TABELA CAPTURAS */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          <div className="bg-yellow-400 text-black p-4 font-black uppercase italic text-sm tracking-widest">Registros de Captura ({recordes.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-400">
                <tr>
                   <th className="p-4">Pescador</th>
                   <th className="p-4">Peixe</th>
                   <th className="p-4 text-center">Tamanho</th>
                   <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recordes.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-bold uppercase">Nenhuma captura encontrada no banco.</td></tr>
                ) : recordes.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{r.nome_pescador}</td>
                    <td className="p-4">
                       <div className="font-black uppercase text-yellow-600 text-[10px]">{r.grupo_especie}</div>
                       <div className="text-[9px] text-gray-400">📍 {r.local_captura}</div>
                    </td>
                    <td className="p-4 text-center font-black">{r.tamanho_cm}cm</td>
                    <td className="p-4 text-right space-x-4">
                      <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-black uppercase text-[10px]">Editar</button>
                      <button onClick={() => excluirCaptura(r.id)} className="text-red-500 font-black uppercase text-[10px]">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL EDITAR PESCADOR */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-black uppercase italic mb-4">Editar Pescador</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditandoPescador(null)} className="flex-1 bg-gray-100 p-3 rounded font-bold uppercase text-[10px]">Cancelar</button>
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-[10px]">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR RECORDE */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-md my-auto space-y-4">
            <h2 className="text-xl font-black uppercase italic mb-4">Editar Peixe</h2>
            <div className="grid grid-cols-2 gap-4">
               <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="p-3 border-2 rounded font-black" />
               <input type="date" value={editandoRecorde.data_captura} onChange={e => setEditandoRecorde({...editandoRecorde, data_captura: e.target.value})} className="p-3 border-2 rounded font-bold text-xs" />
            </div>
            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Local" />
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <input value={editandoRecorde.carretilha} onChange={e => setEditandoRecorde({...editandoRecorde, carretilha: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Carretilha" />
                <input value={editandoRecorde.vara} onChange={e => setEditandoRecorde({...editandoRecorde, vara: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Vara" />
                <input value={editandoRecorde.isca} onChange={e => setEditandoRecorde({...editandoRecorde, isca: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Isca" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditandoRecorde(null)} className="flex-1 bg-gray-100 p-3 rounded font-bold uppercase text-[10px]">Cancelar</button>
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-[10px]">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
