'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GerenciarPage() {
  const [user, setUser] = useState<any>(null)
  const [pescadores, setPescadores] = useState<any[]>([])
  const [recordes, setRecordes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoPescador, setEditandoPescador] = useState<any>(null)
  const [editandoRecorde, setEditandoRecorde] = useState<any>(null)

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        carregarDados()
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  async function carregarDados() {
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    const { data: r } = await supabase.from('recordes').select('*').order('id', { ascending: false })
    setPescadores(p || [])
    setRecordes(r || [])
    setLoading(false)
  }

  // --- NOVA FUNÇÃO: RESETAR SENHA DO PESCADOR ---
  async function resetarSenhaPescador(id: string, nome: string) {
    const novaSenhaTemp = prompt(`Digite uma senha temporária para ${nome}:`, "123456");
    
    if (novaSenhaTemp) {
      const { error } = await supabase
        .from('pescadores')
        .update({ 
          senha: novaSenhaTemp, 
          primeiro_login: true // Força ele a trocar quando logar
        })
        .eq('id', id);

      if (error) alert("Erro ao resetar: " + error.message);
      else alert(`Senha de ${nome} resetada para: ${novaSenhaTemp}. No próximo login, o sistema pedirá que ele crie uma nova.`);
    }
  }

  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { error } = await supabase.from('pescadores').update({
      nome_completo: editandoPescador.nome_completo,
      cidade: editandoPescador.cidade
    }).eq('id', editandoPescador.id).select()
    if (error) alert("Erro: " + error.message)
    else { alert("Dados atualizados!"); setEditandoPescador(null); carregarDados() }
  }

  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { error } = await supabase.from('recordes').update({
      grupo_especie: editandoRecorde.grupo_especie,
      subespecie: editandoRecorde.subespecie,
      tamanho_cm: parseFloat(editandoRecorde.tamanho_cm),
      local_captura: editandoRecorde.local_captura,
      data_captura: editandoRecorde.data_captura,
      carretilha: editandoRecorde.carretilha,
      vara: editandoRecorde.vara,
      isca: editandoRecorde.isca
    }).eq('id', editandoRecorde.id).select()
    if (error) alert("Erro: " + error.message)
    else { alert("Captura atualizada!"); setEditandoRecorde(null); carregarDados() }
  }

  async function excluirRegistro(tabela: string, id: string) {
    if (confirm("Confirmar exclusão permanente?")) {
      await supabase.from(tabela).delete().eq('id', id)
      carregarDados()
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">ACESSANDO BANCO DE DADOS...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-black uppercase italic text-red-600 mb-4">Acesso Negado</h2>
        <a href="/admin" className="bg-black text-yellow-400 px-8 py-3 rounded-full font-black uppercase">Fazer Login</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic tracking-widest">Gerenciamento TR</h1>
          <a href="/admin" className="text-[10px] font-black uppercase bg-white border px-4 py-2 rounded-full shadow-sm">← Voltar</a>
        </header>

        {/* TABELA PESCADORES */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-black text-white p-3 font-black text-[10px] uppercase italic tracking-widest flex justify-between items-center">
            <span>Pescadores Cadastrados</span>
            <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-[8px]">{pescadores.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b font-black uppercase text-gray-400 text-[9px]">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Cidade</th>
                  <th className="p-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody>
                {pescadores.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold uppercase">{p.nome_completo}</td>
                    <td className="p-4 text-gray-400 font-bold uppercase">{p.cidade}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Editar</button>
                      <button onClick={() => resetarSenhaPescador(p.id, p.nome_completo)} className="text-yellow-600 font-black uppercase text-[10px] hover:underline">Resetar Senha</button>
                      <button onClick={() => excluirRegistro('pescadores', p.id)} className="text-red-500 font-black uppercase text-[10px] hover:underline">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA RECORDES */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-400 text-black p-3 font-black text-[10px] uppercase italic tracking-widest">Histórico de Capturas</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-yellow-50 border-b font-black uppercase text-yellow-800 text-[9px]">
                <tr>
                  <th className="p-4">Pescador / Peixe</th>
                  <th className="p-4">Medida</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recordes.map(r => (
                  <tr key={r.id} className="border-b hover:bg-yellow-50/50">
                    <td className="p-4">
                       <div className="font-bold uppercase">{r.nome_pescador}</div>
                       <div className="font-black text-yellow-600 uppercase text-[9px]">{r.grupo_especie} ({r.subespecie})</div>
                    </td>
                    <td className="p-4 font-black text-sm">{r.tamanho_cm}cm</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-black mr-4 uppercase text-[10px]">Editar</button>
                      <button onClick={() => excluirRegistro('recordes', r.id)} className="text-red-500 font-black uppercase text-[10px]">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAIS DE EDIÇÃO (IGUAIS AOS ANTERIORES) */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="font-black uppercase italic border-b-2 mb-4 text-black text-lg">Editar Membro</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold text-black" placeholder="Nome" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold text-black" placeholder="Cidade" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-xs">Salvar</button>
              <button type="button" onClick={() => setEditandoPescador(null)} className="flex-1 bg-gray-100 font-black uppercase rounded text-xs text-black">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR RECORDE */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-sm my-auto space-y-4">
            <h2 className="font-black uppercase italic border-b-2 mb-4 text-black">Editar Peixe</h2>
            <div className="grid grid-cols-2 gap-4">
              <select value={editandoRecorde.grupo_especie} onChange={e => setEditandoRecorde({...editandoRecorde, grupo_especie: e.target.value, subespecie: subMap[e.target.value][0]})} className="w-full p-2 border-2 rounded font-black text-xs text-black">
                {Object.keys(subMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
              <select value={editandoRecorde.subespecie} onChange={e => setEditandoRecorde({...editandoRecorde, subespecie: e.target.value})} className="w-full p-2 border-2 rounded font-black text-xs text-black">
                {subMap[editandoRecorde.grupo_especie].map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-3 border-2 rounded font-black text-black" />
            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold text-black" />
            <div className="flex gap-2">
              <button type="submit" className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded text-[10px]">Confirmar Atualização</button>
              <button type="button" onClick={() => setEditandoRecorde(null)} className="w-full bg-gray-100 font-black uppercase rounded text-[10px] text-black">Voltar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
