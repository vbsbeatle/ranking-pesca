'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  const toggleCat = (cat: string) => {
    setCatsSelecionadas(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  async function handleCriarCamp(e: any) {
    e.preventDefault()
    const f = e.target
    const { error } = await supabase.from('campeonatos').insert([{
      nome: f.nome.value,
      data_inicio: f.inicio.value,
      data_fim: f.fim.value,
      cota_min: parseInt(f.cota_min.value),
      cota_max: parseInt(f.cota_max.value),
      categorias: catsSelecionadas
    }])
    if (!error) { alert("Campeonato criado!"); carregarDados(); }
  }

  async function handleInscricao(e: any) {
    e.preventDefault()
    const f = e.target
    const p = pescadoresGerais.find(x => x.id === f.pescador_id.value)
    const camp = campeonatos.find(x => x.id === f.camp_id.value)
    const { error } = await supabase.from('campeonato_participantes').insert([{
      campeonato_id: f.camp_id.value,
      pescador_id: p.id,
      nome_pescador: p.nome_completo,
      categorias_inscritas: camp.categorias
    }])
    if (error) alert("Pescador já inscrito!"); else alert("Inscrito!");
  }

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
    <div className="min-h-screen bg-zinc-900 text-white p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8">Admin de Campeonatos</h1>
      
      <div className="flex gap-2 mb-8">
        {['novo_camp', 'inscricao', 'lancar'].map(t => (
          <button key={t} onClick={() => setAba(t)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === t ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="max-w-xl bg-zinc-800 p-6 rounded-3xl border border-zinc-700">
        {aba === 'novo_camp' && (
          <form onSubmit={handleCriarCamp} className="space-y-4 text-black">
            <input name="nome" placeholder="Nome do Torneio" required className="w-full p-3 rounded font-bold" />
            <div className="grid grid-cols-2 gap-4 text-white">
               <div><label className="text-[10px] uppercase font-bold">Início</label><input name="inicio" type="date" required className="w-full p-3 rounded text-black" /></div>
               <div><label className="text-[10px] uppercase font-bold">Fim</label><input name="fim" type="date" required className="w-full p-3 rounded text-black" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input name="cota_min" type="number" placeholder="Cota Mín." className="w-full p-3 rounded font-bold" />
               <input name="cota_max" type="number" placeholder="Cota Máx." className="w-full p-3 rounded font-bold" />
            </div>
            <div className="p-4 bg-zinc-700 rounded-xl">
               <p className="text-white text-[10px] font-black uppercase mb-3">Categorias Incluídas:</p>
               <div className="flex gap-2">
                 {['Tucunaré', 'Trairas', 'Dourado'].map(c => (
                   <label key={c} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                     <input type="checkbox" checked={catsSelecionadas.includes(c)} onChange={() => toggleCat(c)} /> {c}
                   </label>
                 ))}
               </div>
            </div>
            <button className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black uppercase">Salvar Campeonato</button>
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
            <button className="w-full bg-white text-black p-4 rounded-xl font-black uppercase">Inscrever Pescador</button>
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
               <option value="Trairas">Trairas</option>
               <option value="Dourado">Dourado</option>
            </select>
            <input name="tamanho" type="number" step="0.1" placeholder="Tamanho em CM" required className="w-full p-3 rounded font-bold" />
            <button className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black uppercase">Lançar Peixe</button>
          </form>
        )}
      </div>
    </div>
  )
}
