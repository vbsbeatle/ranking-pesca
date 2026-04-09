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

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

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
    setPescadores(p || [])

    const { data: r } = await supabase.from('recordes').select('*').order('id', { ascending: false })
    setRecordes(r || [])
    setLoading(false)
  }

  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('pescadores')
      .update({
        nome_completo: editandoPescador.nome_completo,
        cidade: editandoPescador.cidade
      })
      .eq('id', editandoPescador.id)
      .select()

    if (error) alert("Erro: " + error.message)
    else {
      alert("Pescador atualizado!"); setEditandoPescador(null); carregarDados()
    }
  }

  async function salvarEdicaoRecorde(e: any) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('recordes')
      .update({
        grupo_especie: editandoRecorde.grupo_especie,
        subespecie: editandoRecorde.subespecie,
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
    else {
      alert("Captura atualizada!"); setEditandoRecorde(null); carregarDados()
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic">Gerenciamento TR</h1>
          <a href="/admin" className="text-[10px] font-black uppercase bg-gray-200 px-4 py-2 rounded-full">← Voltar</a>
        </header>

        {/* TABELA PESCADORES */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-black text-white p-3 font-black text-[10px] uppercase italic">Pescadores Cadastrados</div>
          <table className="w-full text-left text-xs">
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

        {/* TABELA CAPTURAS */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-400 text-black p-3 font-black text-[10px] uppercase italic">Capturas no Sistema</div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b text-[9px] font-black text-gray-400 uppercase">
                <th className="p-4">Pescador / Peixe</th>
                <th className="p-4">Medida / Local</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recordes.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4">
                     <div className="font-bold">{r.nome_pescador}</div>
                     <div className="font-black text-yellow-600 uppercase text-[9px]">{r.grupo_especie} ({r.subespecie})</div>
                  </td>
                  <td className="p-4">
                     <div className="font-black text-sm">{r.tamanho_cm}cm</div>
                     <div className="text-[9px] opacity-50 uppercase font-bold">📍 {r.local_captura}</div>
                  </td>
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

      {/* MODAL PESCADOR */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="font-black uppercase italic border-b-2 mb-4">Editar Perfil</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Nome" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold" placeholder="Cidade" />
            <button type="submit" className="w-full bg-black text-yellow-400 p-3 rounded font-black uppercase">Salvar</button>
            <button type="button" onClick={() => setEditandoPescador(null)} className="w-full text-gray-400 font-bold uppercase text-[10px]">Cancelar</button>
          </form>
        </div>
      )}

      {/* MODAL RECORDE (EDIÇÃO AMPLIADA) */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-md my-auto space-y-4">
            <h2 className="font-black uppercase italic border-b-2 mb-4">Editar Registro</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400">Espécie</label>
                <select 
                  value={editandoRecorde.grupo_especie} 
                  onChange={e => setEditandoRecorde({...editandoRecorde, grupo_especie: e.target.value, subespecie: subMap[e.target.value][0]})}
                  className="w-full p-2 border-2 rounded font-black text-xs"
                >
                  {Object.keys(subMap).map(esp => <option key={esp} value={esp}>{esp}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400">Subespécie</label>
                <select 
                  value={editandoRecorde.subespecie} 
                  onChange={e => setEditandoRecorde({...editandoRecorde, subespecie: e.target.value})}
                  className="w-full p-2 border-2 rounded font-black text-xs"
                >
                  {subMap[editandoRecorde.grupo_especie].map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[9px] font-black uppercase text-gray-400">Tamanho (cm)</label>
                 <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-2 border-2 rounded font-black" />
               </div>
               <div>
                 <label className="text-[9px] font-black uppercase text-gray-400">Data</label>
                 <input type="date" value={editandoRecorde.data_captura} onChange={e => setEditandoRecorde({...editandoRecorde, data_captura: e.target.value})} className="w-full p-2 border-2 rounded font-bold text-xs" />
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
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-3 rounded font-black uppercase text-xs">Atualizar</button>
              <button type="button" onClick={() => setEditandoRecorde(null)} className="flex-1 bg-gray-100 font-black uppercase rounded text-xs">Voltar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
