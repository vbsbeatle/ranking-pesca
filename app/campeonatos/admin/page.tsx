'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)

  // Estados do Formulário para Edição
  const [formData, setFormData] = useState({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })

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

  // CRIAR OU ATUALIZAR CAMPEONATO
  async function handleSalvarCamp(e: any) {
    e.preventDefault()
    const dados = {
      nome: formData.nome,
      data_inicio: formData.inicio,
      data_fim: formData.fim,
      cota_min: parseInt(formData.cota_min),
      cota_max: parseInt(formData.cota_max),
      categorias: catsSelecionadas,
      url_logo: formData.url_logo
    }

    if (editandoId) {
      const { error } = await supabase.from('campeonatos').update(dados).eq('id', editandoId)
      if (!error) { alert("Campeonato atualizado!"); setEditandoId(null); }
    } else {
      const { error } = await supabase.from('campeonatos').insert([dados])
      if (!error) alert("Campeonato criado!")
    }
    
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    carregarDados()
  }

  async function excluirCamp(id: string) {
    if (confirm("Tem certeza? Isso apagará todos os peixes e inscritos deste torneio!")) {
      await supabase.from('campeonatos').delete().eq('id', id)
      carregarDados()
    }
  }

  function prepararEdicao(c: any) {
    setEditandoId(c.id)
    setFormData({
      nome: c.nome,
      inicio: c.data_inicio,
      fim: c.data_fim,
      cota_min: String(c.cota_min),
      cota_max: String(c.cota_max),
      url_logo: c.url_logo || ''
    })
    setCatsSelecionadas(c.categorias)
    setAba('novo_camp')
    window.scrollTo(0,0)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8">Painel de Controle: Campeonatos</h1>
      
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <button onClick={() => {setAba('novo_camp'); setEditandoId(null);}} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'novo_camp' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>
          {editandoId ? '📝 Editando Torneio' : '➕ Novo Campeonato'}
        </button>
        <button onClick={() => setAba('inscricao')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'inscricao' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Inscrições</button>
        <button onClick={() => setAba('lancar')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'lancar' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Lançar Peixe</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUNA ESQUERDA: FORMULÁRIOS */}
        <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700 h-fit">
          {aba === 'novo_camp' && (
            <form onSubmit={handleSalvarCamp} className="space-y-4 text-black">
              <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Torneio" required className="w-full p-3 rounded font-bold" />
              <input value={formData.url_logo} onChange={e => setFormData({...formData, url_logo: e.target.value})} placeholder="Link da Logo (URL da imagem)" className="w-full p-3 rounded font-bold" />
              <div className="grid grid-cols-2 gap-4 text-white">
                 <div><label className="text-[10px] uppercase font-bold">Início</label><input type="date" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} required className="w-full p-3 rounded text-black font-bold" /></div>
                 <div><label className="text-[10px] uppercase font-bold">Fim</label><input type="date" value={formData.fim} onChange={e => setFormData({...formData, fim: e.target.value})} required className="w-full p-3 rounded text-black font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Cota Mín." value={formData.cota_min} onChange={e => setFormData({...formData, cota_min: e.target.value})} className="w-full p-3 rounded font-bold" />
                 <input type="number" placeholder="Cota Máx." value={formData.cota_max} onChange={e => setFormData({...formData, cota_max: e.target.value})} className="w-full p-3 rounded font-bold" />
              </div>
              <div className="p-4 bg-zinc-700 rounded-xl">
                 <p className="text-white text-[10px] font-black uppercase mb-3">Espécies Válidas:</p>
                 <div className="flex gap-4">
                   {['Tucunaré', 'Trairas', 'Dourado'].map(c => (
                     <label key={c} className="flex items-center gap-2 text-xs text-white cursor-pointer"><input type="checkbox" checked={catsSelecionadas.includes(c)} onChange={() => toggleCat(c)} /> {c}</label>
                   ))}
                 </div>
              </div>
              <button className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black uppercase">{editandoId ? 'Salvar Alterações' : 'Criar Campeonato'}</button>
            </form>
          )}

          {aba === 'inscricao' && (
            <form onSubmit={async (e:any) => {
              e.preventDefault()
              const p = pescadoresGerais.find(x => x.id === e.target.pescador_id.value)
              const camp = campeonatos.find(x => x.id === e.target.camp_id.value)
              await supabase.from('campeonato_participantes').insert([{ campeonato_id: camp.id, pescador_id: p.id, nome_pescador: p.nome_completo, categorias_inscritas: camp.categorias }])
              alert("Inscrito!")
            }} className="space-y-4 text-black">
              <select name="camp_id" required className="w-full p-3 rounded font-bold">
                <option value="">Selecione o Torneio</option>
                {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="pescador_id" required className="w-full p-3 rounded font-bold">
                <option value="">Selecione o Pescador</option>
                {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              <button className="w-full bg-white text-black p-4 rounded-xl font-black uppercase">Vincular Pescador</button>
            </form>
          )}

          {aba === 'lancar' && (
            <form onSubmit={async (e:any) => {
              e.preventDefault()
              const f = e.target
              const p = pescadoresGerais.find(x => x.id === f.pescador_id.value)
              await supabase.from('capturas_torneio').insert([{ campeonato_id: f.camp_id.value, pescador_id: p.id, nome_pescador: p.nome_completo, especie: f.especie.value, tamanho_cm: parseFloat(f.tamanho.value) }])
              alert("Peixe lançado!"); f.reset();
            }} className="space-y-4 text-black">
              <select name="camp_id" required className="w-full p-3 rounded font-bold">
                <option value="">Torneio</option>
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
              <input name="tamanho" type="number" step="0.1" placeholder="CM" required className="w-full p-3 rounded font-bold" />
              <button className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black uppercase">Confirmar Peixe</button>
            </form>
          )}
        </div>

        {/* COLUNA DIREITA: LISTA PARA GESTÃO */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-zinc-500 mb-4">Torneios Cadastrados</h2>
          {campeonatos.map(c => (
            <div key={c.id} className="bg-zinc-800 p-4 rounded-2xl flex items-center justify-between border border-zinc-700">
               <div className="flex items-center gap-4">
                 {c.url_logo && <img src={c.url_logo} className="h-10 w-10 rounded-full object-cover border border-zinc-600" />}
                 <div>
                    <p className="font-black uppercase italic text-xs">{c.nome}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{new Date(c.data_inicio).toLocaleDateString()} - {new Date(c.data_fim).toLocaleDateString()}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => prepararEdicao(c)} className="bg-zinc-700 p-2 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors">✏️</button>
                  <button onClick={() => excluirCamp(c.id)} className="bg-zinc-700 p-2 rounded-lg hover:bg-red-600 transition-colors">🗑️</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
