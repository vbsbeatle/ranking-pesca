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
    console.log("--- INICIANDO CARREGAMENTO DE DADOS ---")
    
    // Busca Pescadores
    const { data: p, error: ep } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (ep) console.error("Erro Pescadores:", ep.message)
    else setPescadores(p || [])

    // Busca Capturas - AQUI ESTÁ O TESTE DE VISIBILIDADE
    const { data: r, error: er } = await supabase.from('recordes').select('*')
    if (er) {
        console.error("Erro Capturas:", er.message)
        alert("Erro ao ler capturas: " + er.message)
    } else {
      console.log("Capturas brutas do banco:", r)
      setRecordes(r || [])
    }
    
    setLoading(false)
  }

  // --- SALVAR EDIÇÃO COM CHECAGEM DE LINHAS ---
  async function salvarEdicaoPescador(e: any) {
    e.preventDefault()
    console.log("Tentando atualizar ID:", editandoPescador.id)

    const { data, error, status, count } = await supabase
      .from('pescadores')
      .update({
        nome_completo: editandoPescador.nome_completo,
        cidade: editandoPescador.cidade
      })
      .eq('id', editandoPescador.id)
      .select() // Força o retorno do dado alterado

    if (error) {
      alert("Erro do Supabase: " + error.message)
    } else if (data && data.length > 0) {
      alert("Sucesso! Membro atualizado.")
      setEditandoPescador(null)
      carregarDados()
    } else {
      alert("Aviso: O banco não encontrou ninguém com este ID para atualizar.")
    }
  }

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
    else {
      alert("Captura atualizada!")
      setEditandoRecorde(null)
      carregarDados()
    }
  }

  // --- EXCLUSÃO ---
  async function excluirRegistro(tabela: string, id: string) {
    if (confirm("Confirmar exclusão permanente?")) {
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
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-black uppercase italic">Painel de Controle</h1>
          <button onClick={carregarDados} className="bg-yellow-400 px-4 py-2 rounded font-black text-[10px] uppercase">🔄 Atualizar Dados</button>
        </header>

        {/* TABELA PESCADORES */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-black text-white p-3 font-black text-xs uppercase italic">Pescadores</div>
          <table className="w-full text-left text-sm">
            {pescadores.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-4 font-bold">{p.nome_completo}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditandoPescador(p)} className="text-blue-600 font-bold mr-4">EDITAR</button>
                  <button onClick={() => excluirRegistro('pescadores', p.id)} className="text-red-500 font-bold">EXCLUIR</button>
                </td>
              </tr>
            ))}
          </table>
        </div>

        {/* TABELA CAPTURAS */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-yellow-400 text-black p-3 font-black text-xs uppercase italic">Capturas Registradas</div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b">
                <th className="p-4">Pescador</th>
                <th className="p-4">Peixe</th>
                <th className="p-4">Tamanho</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recordes.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-bold">NENHUMA CAPTURA ENCONTRADA.</td></tr>
              ) : recordes.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4 font-bold">{r.nome_pescador}</td>
                  <td className="p-4 font-black text-yellow-600 uppercase text-xs">{r.grupo_especie} ({r.subespecie})</td>
                  <td className="p-4 font-black">{r.tamanho_cm}cm</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditandoRecorde(r)} className="text-blue-600 font-bold mr-4 uppercase text-[10px]">Editar</button>
                    <button onClick={() => excluirRegistro('recordes', r.id)} className="text-red-500 font-bold uppercase text-[10px]">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR PESCADOR */}
      {editandoPescador && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarEdicaoPescador} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="font-black uppercase italic">Editar Membro</h2>
            <input value={editandoPescador.nome_completo} onChange={e => setEditandoPescador({...editandoPescador, nome_completo: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <input value={editandoPescador.cidade} onChange={e => setEditandoPescador({...editandoPescador, cidade: e.target.value})} className="w-full p-3 border-2 rounded font-bold" />
            <button type="submit" className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded">Salvar Alterações</button>
            <button type="button" onClick={() => setEditandoPescador(null)} className="w-full text-gray-400 font-bold uppercase text-xs">Cancelar</button>
          </form>
        </div>
      )}

      {/* MODAL EDITAR RECORDE */}
      {editandoRecorde && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={salvarEdicaoRecorde} className="bg-white p-8 rounded-2xl w-full max-w-sm my-auto space-y-4">
            <h2 className="font-black uppercase italic text-black">Editar Captura</h2>
            <input type="number" step="0.1" value={editandoRecorde.tamanho_cm} onChange={e => setEditandoRecorde({...editandoRecorde, tamanho_cm: e.target.value})} className="w-full p-3 border-2 rounded font-bold text-black" />
            <input value={editandoRecorde.local_captura} onChange={e => setEditandoRecorde({...editandoRecorde, local_captura: e.target.value})} className="w-full p-3 border-2 rounded font-bold text-black" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-black text-yellow-400 p-4 font-black uppercase rounded">Salvar</button>
              <button type="button" onClick={() => setEditandoRecorde(null)} className="flex-1 bg-gray-200 font-black uppercase rounded text-xs">Voltar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
