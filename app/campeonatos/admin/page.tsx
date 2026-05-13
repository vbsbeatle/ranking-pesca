'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  // FUNÇÃO DE UPLOAD DE IMAGEM
  async function handleUpload(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `campeonatos/${fileName}`

      // Sobe para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Pega a URL pública
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      setFormData({ ...formData, url_logo: data.publicUrl })
      alert("Logo carregada com sucesso!")

    } catch (error: any) {
      alert('Erro no upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

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
      await supabase.from('campeonatos').update(dados).eq('id', editandoId)
      setEditandoId(null)
    } else {
      await supabase.from('campeonatos').insert([dados])
    }
    
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    carregarDados()
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8 border-l-4 border-yellow-400 pl-4">Gestão de Campeonatos</h1>
      
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => {setAba('novo_camp'); setEditandoId(null);}} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${aba === 'novo_camp' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>
          {editandoId ? '✏️ Editando' : '➕ Novo Torneio'}
        </button>
        <button onClick={() => setAba('inscricao')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'inscricao' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Inscrições</button>
        <button onClick={() => setAba('lancar')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'lancar' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Lançar Peixe</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULÁRIOS */}
        <div className="lg:col-span-5 bg-zinc-800 p-6 rounded-[32px] border border-zinc-700 h-fit">
          {aba === 'novo_camp' && (
            <form onSubmit={handleSalvarCamp} className="space-y-4 text-black">
              <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Campeonato" required className="w-full p-3 rounded-xl font-bold outline-none focus:ring-2 ring-yellow-400" />
              
              {/* CAMPO DE UPLOAD */}
              <div className="bg-zinc-700 p-4 rounded-xl border-2 border-dashed border-zinc-500 text-center">
                {formData.url_logo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={formData.url_logo} className="h-20 w-20 object-cover rounded-lg border-2 border-yellow-400" alt="Preview" />
                    <button type="button" onClick={() => setFormData({...formData, url_logo: ''})} className="text-[10px] text-red-400 font-bold uppercase">Remover e trocar</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <span className="text-white text-xs font-bold uppercase">{uploading ? 'Enviando...' : '📷 Clique para Upload da Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-white">
                 <div><label className="text-[9px] font-black uppercase text-zinc-400">Início</label><input type="date" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} required className="w-full p-3 rounded-xl text-black font-bold" /></div>
                 <div><label className="text-[9px] font-black uppercase text-zinc-400">Fim</label><input type="date" value={formData.fim} onChange={e => setFormData({...formData, fim: e.target.value})} required className="w-full p-3 rounded-xl text-black font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Cota Mín." value={formData.cota_min} onChange={e => setFormData({...formData, cota_min: e.target.value})} className="w-full p-3 rounded-xl font-bold" />
                 <input type="number" placeholder="Cota Máx." value={formData.cota_max} onChange={e => setFormData({...formData, cota_max: e.target.value})} className="w-full p-3 rounded-xl font-bold" />
              </div>
              <button disabled={uploading} className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase shadow-lg disabled:opacity-50">
                {editandoId ? 'Atualizar Torneio' : 'Publicar Campeonato'}
              </button>
            </form>
          )}

          {/* ... (Os outros formulários de Inscrição e Lançamento continuam os mesmos) ... */}
        </div>

        {/* LISTA DE TORNEIOS (DIREITA) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Seus Campeonatos</h2>
          {campeonatos.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-4 rounded-3xl flex items-center justify-between border border-zinc-800 hover:border-zinc-600 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-zinc-700 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-600">
                    {c.url_logo ? <img src={c.url_logo} className="h-full w-full object-cover" /> : <span className="text-xl">🏆</span>}
                 </div>
                 <div>
                    <p className="font-black uppercase italic text-sm">{c.nome}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{c.cota_max} Peixes • {c.categorias?.join(', ')}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => { setEditandoId(c.id); setFormData({ nome: c.nome, inicio: c.data_inicio, fim: c.data_fim, cota_min: String(c.cota_min), cota_max: String(c.cota_max), url_logo: c.url_logo || '' }); setCatsSelecionadas(c.categorias); setAba('novo_camp'); }} className="p-3 bg-zinc-700 rounded-xl hover:bg-yellow-400 hover:text-black transition-all">✏️</button>
                  <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('campeonatos').delete().eq('id', c.id); carregarDados(); } }} className="p-3 bg-zinc-700 rounded-xl hover:bg-red-600 transition-all">🗑️</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
