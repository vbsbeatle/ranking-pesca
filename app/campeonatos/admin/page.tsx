'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({ 
    nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' 
  })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  // UPLOAD DA LOGO DO TORNEIO
  async function handleUploadLogo(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return
      const filePath = `campeonatos/${Math.random()}.jpg`
      const { error } = await supabase.storage.from('logos').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      setFormData({ ...formData, url_logo: data.publicUrl })
      alert("Logo carregada!")
    } catch (err: any) { alert(err.message) } finally { setUploading(false) }
  }

  // NOVO: UPLOAD DA FOTO DE PERFIL DO PESCADOR
  async function handleUploadPerfil(e: any, pescadorId: string) {
    try {
      const file = e.target.files[0]
      if (!file) return
      const filePath = `perfis/${pescadorId}-${Math.random()}.jpg`
      const { error } = await supabase.storage.from('perfis').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('perfis').getPublicUrl(filePath)
      const { error: updateErr } = await supabase.from('pescadores').update({ url_foto_perfil: data.publicUrl }).eq('id', pescadorId)
      if (updateErr) throw updateErr
      alert("Foto do pescador atualizada!")
      carregarDados()
    } catch (err: any) { alert("Erro no upload: " + err.message) }
  }

  async function handleSalvarCamp(e: any) {
    e.preventDefault()
    const dados = {
      nome: formData.nome, data_inicio: formData.inicio, data_fim: formData.fim,
      cota_min: parseInt(formData.cota_min), cota_max: parseInt(formData.cota_max),
      categorias: catsSelecionadas, url_logo: formData.url_logo
    }
    if (editandoId) { await supabase.from('campeonatos').update(dados).eq('id', editandoId); setEditandoId(null); }
    else { await supabase.from('campeonatos').insert([dados]) }
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    carregarDados()
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8 border-l-4 border-yellow-400 pl-4">Gestão PeixeBook</h1>
      
      {/* MENU DE ABAS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setAba('novo_camp')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'novo_camp' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Torneios</button>
        <button onClick={() => setAba('inscricao')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'inscricao' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Inscrições</button>
        <button onClick={() => setAba('lancar')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'lancar' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Lançar Peixe</button>
        <button onClick={() => setAba('pescadores')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'pescadores' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Pescadores</button>
      </div>

      <div className="max-w-4xl mx-auto">
        {aba === 'novo_camp' && (
          <div className="space-y-8">
            <form onSubmit={handleSalvarCamp} className="bg-zinc-800 p-6 rounded-3xl space-y-4 text-black">
              <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Torneio" required className="w-full p-3 rounded-xl font-bold" />
              <div className="bg-zinc-700 p-4 rounded-xl border-2 border-dashed border-zinc-500 text-center text-white">
                {formData.url_logo ? <img src={formData.url_logo} className="h-20 mx-auto rounded-lg mb-2" /> : null}
                <label className="cursor-pointer text-[10px] font-black uppercase block"> {uploading ? 'Subindo...' : '📷 Carregar Logo do Torneio'}
                  <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4 text-white">
                 <input type="date" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} className="p-3 rounded-xl text-black font-bold" />
                 <input type="date" value={formData.fim} onChange={e => setFormData({...formData, fim: e.target.value})} className="p-3 rounded-xl text-black font-bold" />
              </div>
              <button className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase italic">Salvar Campeonato</button>
            </form>
          </div>
        )}

        {aba === 'pescadores' && (
          <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700">
            <h2 className="text-xl font-black uppercase italic mb-6">Fotos de Perfil</h2>
            <div className="space-y-4">
              {pescadoresGerais.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <img src={p.url_foto_perfil || 'https://via.placeholder.com/50'} className="h-12 w-12 rounded-full object-cover border-2 border-zinc-700" />
                    <span className="font-bold text-sm uppercase">{p.nome_completo}</span>
                  </div>
                  <label className="bg-zinc-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors">
                    Mudar Foto
                    <input type="file" accept="image/*" onChange={(e) => handleUploadPerfil(e, p.id)} className="hidden" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANTIVE OS OUTROS CAMPOS ABAIXO PARA NÃO PERDER FUNCIONALIDADE */}
        {aba === 'inscricao' && (
           <form onSubmit={async (e:any) => {
             e.preventDefault();
             await supabase.from('campeonato_participantes').insert([{ campeonato_id: e.target.camp_id.value, pescador_id: e.target.pescador_id.value, nome_pescador: pescadoresGerais.find(x => x.id === e.target.pescador_id.value).nome_completo }]);
             alert("Inscrito!");
           }} className="bg-zinc-800 p-6 rounded-3xl space-y-4 text-black">
              <select name="camp_id" className="w-full p-4 rounded-xl font-bold">
                <option value="">Escolha o Torneio</option>
                {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="pescador_id" className="w-full p-4 rounded-xl font-bold">
                <option value="">Escolha o Pescador</option>
                {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              <button className="w-full bg-white text-black p-4 rounded-2xl font-black uppercase">Vincular</button>
           </form>
        )}

        {aba === 'lancar' && (
           <form onSubmit={async (e:any) => {
             e.preventDefault();
             const f = e.target;
             await supabase.from('capturas_torneio').insert([{ campeonato_id: f.camp_id.value, pescador_id: f.pescador_id.value, nome_pescador: pescadoresGerais.find(x => x.id === f.pescador_id.value).nome_completo, especie: f.especie.value, tamanho_cm: parseFloat(f.tamanho.value) }]);
             alert("Peixe Lançado!"); f.reset();
           }} className="bg-zinc-800 p-6 rounded-3xl space-y-4 text-black">
              <select name="camp_id" className="w-full p-4 rounded-xl font-bold">
                {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="pescador_id" className="w-full p-4 rounded-xl font-bold">
                {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              <select name="especie" className="w-full p-4 rounded-xl font-bold">
                <option value="Tucunaré">Tucunaré</option>
                <option value="Trairas">Trairas</option>
                <option value="Dourado">Dourado</option>
              </select>
              <input name="tamanho" type="number" step="0.1" placeholder="Medida CM" className="w-full p-4 rounded-xl font-bold" />
              <button className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase">Registrar</button>
           </form>
        )}
      </div>
    </div>
  )
}
