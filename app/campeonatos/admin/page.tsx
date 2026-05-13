'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [aba, setAba] = useState('novo_camp') // novo_camp | inscricao | lancar

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  // CRIAR CAMPEONATO
  async function handleCriarCamp(e: any) {
    e.preventDefault()
    const f = e.target
    const { error } = await supabase.from('campeonatos').insert([{
      nome: f.nome.value,
      data_inicio: f.inicio.value,
      data_fim: f.fim.value,
      cota_min: parseInt(f.cota_min.value),
      cota_max: parseInt(f.cota_max.value)
    }])
    if (!error) { alert("Campeonato criado!"); f.reset(); carregarDados(); }
  }

  // INSCREVER PESCADOR
  async function handleInscricao(e: any) {
    e.preventDefault()
    const f = e.target
    const p = pescadoresGerais.find(x => x.id === f.pescador_id.value)
    const { error } = await supabase.from('campeonato_participantes').insert([{
      campeonato_id: f.camp_id.value,
      pescador_id: p.id,
      nome_pescador: p.nome_completo,
      categorias_inscritas: ['Tucunaré', 'Dourado', 'Traíra', 'Trairão'] // Default todas
    }])
    if (error) alert("Pescador já está nesse campeonato!")
    else alert("Inscrito com sucesso!")
  }

  // LANÇAR PEIXE SIMPLIFICADO
  async function handleLancamento(e: any) {
    e.preventDefault()
    const f = e.target
    const p = pescadoresGerais.find(x => x.id === f.pescador_id.value)
    const { error } = await supabase.from('capturas_torneio').insert([{
      campeonato_id: f.camp_id.value,
      pescador_id: p.id,
      nome_pescador: p.nome_completo,
      especie: f.especie.value,
      tamanho_cm: parseFloat(f.tamanho.value)
    }])
    if (!error) { alert("Peixe computado!"); f.reset(); }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8 border-l-4 border-yellow-400 pl-4">Admin de Campeonatos PeixeBook</h1>
      
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setAba('novo_camp')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'novo_camp' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>1. Criar Campeonato</button>
        <button onClick={() => setAba('inscricao')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'inscricao' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>2. Inscrever Pescadores</button>
        <button onClick={() => setAba('lancar')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'lancar' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>3. Lançar Captura</button>
      </div>

      <div className="max-w-xl bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-zinc-700">
        {aba === 'novo_camp' && (
          <form onSubmit={handleCriarCamp} className="space-y-4 text-black">
            <input name="nome" placeholder="Nome do Torneio" required className="w-full p-3 rounded font-bold" />
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-white">Início</label><input name="inicio" type="date" required className="w-full p-3 rounded font-bold" /></div>
               <div><label className="text-[10px] text-white">Fim</label><input name="fim" type="date" required className="w-full p-3 rounded font-bold" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input name="cota_min" type="number" placeholder="Cota Mínima" className="w-full p-3 rounded font-bold" />
               <input name="cota_max" type="number" placeholder="Cota Máxima" className="w-full p-3 rounded font-bold" />
            </div>
            <button className="w-full bg-yellow-400 text-black p-4 rounded font-black uppercase shadow-lg">Criar Campeonato</button>
          </form>
        )}

        {aba === 'inscricao' && (
          <form onSubmit={handleInscricao} className="space-y-4 text-black">
            <select name="camp_id" required className="w-full p-3 rounded font-bold">
               <option value="">Selecione o Campeonato</option>
               {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select name="pescador_id" required className="w-full p-3 rounded font-bold">
               <option value="">Selecione o Pescador</option>
               {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
            </select>
            <button className="w-full bg-white text-black p-4 rounded font-black uppercase shadow-lg">Inscrever no Torneio</button>
          </form>
        )}

        {aba === 'lancar' && (
          <form onSubmit={handleLancamento} className="space-y-4 text-black">
             <select name="camp_id" required className="w-full p-3 rounded font-bold">
               <option value="">Campeonato</option>
               {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select name="pescador_id" required className="w-full p-3 rounded font-bold">
               <option value="">Pescador</option>
               {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
            </select>
            <select name="especie" required className="w-full p-3 rounded font-bold">
               <option value="Tucunaré">Tucunaré</option>
               <option value="Dourado">Dourado</option>
               <option value="Traíra">Traíra</option>
               <option value="Trairão">Trairão</option>
            </select>
            <input name="tamanho" type="number" step="0.1" placeholder="Tamanho em CM" required className="w-full p-3 rounded font-bold" />
            <button className="w-full bg-yellow-400 text-black p-4 rounded font-black uppercase shadow-lg">Registrar Captura</button>
          </form>
        )}
      </div>
    </div>
  )
}
