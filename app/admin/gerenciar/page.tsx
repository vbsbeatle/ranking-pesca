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

  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { data, error } = await supabase.from('pescadores').update({
      nome_completo: editandoPescador.nome_completo,
      cidade: editandoPescador.cidade
    }).eq('id', editandoPescador.id).select()
    if (error) alert("Erro: " + error.message)
    else { alert("Atualizado!"); setEditandoPescador(null); carregarDados() }
  }

  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { data, error } = await supabase.from('recordes').update({
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
    else { alert("Atualizado!"); setEditandoRecorde(null); carregarDados() }
  }

  async function excluirRegistro(tabela: string, id: string) {
    if (confirm("Confirmar exclusão?")) {
      await supabase.from(tabela).delete().eq('id', id)
      carregarDados()
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">VERIFICANDO ACESSO...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-black uppercase italic text-red-600 mb-4">Acesso Negado</h2>
        <p className="text-gray-500 mb-6">Você precisa estar logado para acessar esta página.</p>
        <a href="/admin" className="bg-black text-yellow-400 px-8 py-3 rounded-full font-black uppercase shadow-xl">Fazer Login</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic tracking-widest text-black">Painel de Gerenciamento</h1>
          <a href="/admin" className="text-[10px] font-black uppercase bg-white border px-4 py-2 rounded-full">← Cadastro</a>
        </header>

        {/* TABELAS IGUAIS ÀS QUE JÁ FUNCIONAVAM... */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-black text-white p-3 font-black text-[10px] uppercase italic">Pescadores Cadastrados</div>
          <table className="w-full text-left text-xs text-black">
            <tbody>
              {pescadores.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 font-bold uppercase">{p.nome_completo}</td>
                  <td className="p-4 text-gray-400 font-bold uppercase">{p.cidade}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-black mr-4 uppercase">Editar</button>
                    <button onClick={() => excluirRegistro('pescadores', p.id)} className="text-red-500 font-black uppercase">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-400 text-black p-3 font-black text-[10px] uppercase italic">Registros de Capturas</div>
          <table className="w-full text-left text-xs text-black">
            <tbody>
              {recordes.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4">
                     <div className="font-bold">{r.nome_pescador}</div>
                     <div className="font-black text-yellow-600 uppercase text-[9px]">{r.grupo_especie} ({r.subespecie})</div>
                  </td>
                  <td className="p-4 font-black text-sm">{r.tamanho_cm}cm</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-black mr-3 uppercase">Editar</button>
                    <button onClick={() => excluirRegistro('recordes', r.id)} className="text-red-500 font-black uppercase">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAIS DE EDIÇÃO (IGUAIS AOS ANTERIORES)... */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4 text-black">
            <h2 className="font-black uppercase italic border-b-2 mb-4">Editar Perfil</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <button type="submit" className="w-full bg-black text-yellow-400 p-3 rounded font-black uppercase">Salvar</button>
            <button type="button" onClick={() => setEditandoPescador(null)} className="w-full text-gray-400 font-bold uppercase text-[10px]">Cancelar</button>
          </form>
        </div>
      )}

      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-sm my-auto space-y-4 text-black">
            <h2 className="font-black uppercase italic border-b-2 mb-4">Editar Peixe</h2>
            <select value={editandoRecorde.grupo_especie} onChange={e => setEditandoRecorde({...editandoRecorde, grupo_especie: e.target.value, subespecie: subMap[e.target.value][0]})} className="w-full p-2 border-2 rounded font-black text-xs">
              {Object.keys(subMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
            <select value={editandoRecorde.subespecie} onChange={e => setEditandoRecorde({...editandoRecorde, subespecie: e.target.value})} className="w-full p-2 border-2 rounded font-black text-xs">
              {subMap[editandoRecorde.grupo_especie].map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-3 border-2 rounded font-black" />
            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <div className="flex gap-2">
              <button type="submit" className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded text-[10px]">Atualizar</button>
              <button type="button" onClick={() => setEditandoRecorde(null)} className="w-full bg-gray-100 font-black uppercase rounded text-[10px]">Voltar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
