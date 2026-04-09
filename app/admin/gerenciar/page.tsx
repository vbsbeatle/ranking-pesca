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
    if (senhaInput === "TR123admin!") { 
      setLogado(true)
      carregarDados()
    } else {
      alert("Senha incorreta")
    }
  }

  async function carregarDados() {
    setLoading(true)
    
    // Busca Pescadores
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    setPescadores(p || [])

    // Busca Capturas - Se o created_at ainda não existir, ele não vai quebrar
    const { data: r, error: errR } = await supabase
      .from('recordes')
      .select('*')
      .order('id', { ascending: false }) // Mudamos para ID enquanto o banco atualiza
    
    if (errR) console.error("Erro ao carregar capturas:", errR.message)
    setRecordes(r || [])
    
    setLoading(false)
  }

  // --- SALVAR EDIÇÃO PESCADOR ---
  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('pescadores')
      .update({
        nome_completo: editandoPescador.nome_completo,
        cidade: editandoPescador.cidade
      })
      .eq('id', editandoPescador.id)
      .select() // Importante para confirmar a alteração

    if (error) {
      alert("Erro ao salvar: " + error.message)
    } else if (data && data.length > 0) {
      alert("Pescador atualizado com sucesso!")
      setEditandoPescador(null)
      carregarDados()
    } else {
      alert("Erro: O banco de dados não aplicou a alteração. Verifique as permissões RLS.")
    }
  }

  // --- SALVAR EDIÇÃO RECORDE ---
  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { data, error } = await supabase
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
      .select()

    if (error) alert("Erro: " + error.message)
    else if (data && data.length > 0) {
      alert("Captura atualizada!")
      setEditandoRecorde(null)
      carregarDados()
    }
  }

  async function excluirRegistro(tabela: string, id: string) {
    if (confirm("Confirmar exclusão?")) {
      const { error } = await supabase.from(tabela).delete().eq('id', id)
      if (error) alert("Erro: " + error.message)
      else carregarDados()
    }
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={checkLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <input type="password" placeholder="Senha Master" className="w-full p-4 border-2 rounded-xl mb-4 font-bold text-black" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic tracking-widest">Painel de Controle</h1>
          <a href="/admin" className="text-[10px] font-black uppercase bg-gray-200 px-4 py-2 rounded-full">← Voltar ao Cadastro</a>
        </header>

        {/* PESCADORES */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="bg-black text-white p-3 font-black text-[10px] uppercase tracking-[0.2em]">Membros Cadastrados</div>
          <table className="w-full text-left text-xs">
            <tbody>
              {pescadores.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 font-bold uppercase">{p.nome_completo}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-black mr-4">EDITAR</button>
                    <button onClick={() => excluirRegistro('pescadores', p.id)} className="text-red-500 font-black">EXCLUIR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CAPTURAS */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-400 text-black p-3 font-black text-[10px] uppercase tracking-[0.2em]">Registros de Captura</div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b text-[9px] font-black text-gray-400 uppercase">
                <th className="p-4">Pescador</th>
                <th className="p-4">Peixe</th>
                <th className="p-4 text-center">Tamanho</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recordes.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-bold">NENHUMA CAPTURA LOCALIZADA.</td></tr>
              ) : recordes.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4 font-bold">{r.nome_pescador}</td>
                  <td className="p-4">
                     <div className="font-black text-yellow-600 uppercase italic">{r.grupo_especie}</div>
                     <div className="text-[9px] opacity-50 uppercase tracking-tighter">📍 {r.local_captura}</div>
                  </td>
                  <td className="p-4 text-center font-black text-sm">{r.tamanho_cm}cm</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-black mr-4">EDITAR</button>
                    <button onClick={() => excluirRegistro('recordes', r.id)} className="text-red-500 font-black">EXCLUIR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PESCADOR */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-black">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
            <h2 className="font-black uppercase italic border-b-4 border-yellow-400 pb-2">Editar Membro</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Nome" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Cidade" />
            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-[10px]">Confirmar</button>
              <button type="button" onClick={() => setEditandoPescador(null)} className="flex-1 bg-gray-100 font-black uppercase rounded text-[10px]">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL RECORDE */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-sm my-auto space-y-4 shadow-2xl">
            <h2 className="font-black uppercase italic border-b-4 border-yellow-400 pb-2">Editar Peixe</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[9px] font-black uppercase text-gray-400">Tamanho cm</label>
                 <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-3 border-2 rounded font-black" />
               </div>
               <div>
                 <label className="text-[9px] font-black uppercase text-gray-400">Data</label>
                 <input type="date" value={editandoRecorde.data_captura} onChange={e => setEditandoRecorde({...editandoRecorde, data_captura: e.target.value})} className="w-full p-2 border-2 rounded font-bold text-xs h-[50px]" />
               </div>
            </div>
            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Local" />
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase">Equipamento</p>
                <input value={editandoRecorde.carretilha} onChange={e => setEditandoRecorde({...editandoRecorde, carretilha: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Carretilha" />
                <input value={editandoRecorde.vara} onChange={e => setEditandoRecorde({...editandoRecorde, vara: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Vara" />
                <input value={editandoRecorde.isca} onChange={e => setEditandoRecorde({...editandoRecorde, isca: e.target.value})} className="w-full p-2 border rounded text-xs" placeholder="Isca" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-4 font-black uppercase rounded text-[10px]">Salvar</button>
              <button type="button" onClick={() => setEditandoRecorde(null)} className="flex-1 bg-gray-100 font-black uppercase rounded text-[10px]">Sair</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
