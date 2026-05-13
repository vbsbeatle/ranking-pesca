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

  const [formData, setFormData] = useState({ 
    nome: '', 
    inicio: '', 
    fim: '', 
    cota_min: '1', 
    cota_max: '5', 
    url_logo: '' 
  })

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

  async function handleUpload(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `campeonatos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      setFormData({ ...formData, url_logo: data.publicUrl })
      alert("Logo carregada!")

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
      const { error } = await supabase.from('campeonatos').update(dados).eq('id', editandoId)
      if (!error) { alert("Campeonato atualizado!"); setEditandoId(null); }
    } else {
      const { error } = await supabase.from('campeonatos').insert([dados])
      if (!error) alert("Campeonato criado com sucesso!")
    }
    
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    setCatsSelecionadas(['Tucunaré'])
    carregarDados()
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
    setCatsSelecionadas(c.categorias || [])
    setAba('novo_camp')
    window.scrollTo(0,0)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <header className="mb-10">
        <h1 className="text-2xl font-black uppercase italic text-yellow-400 border-l-4 border-yellow-400 pl-4">
          Arena PeixeBook: Gestão
        </h1>
      </header>
      
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => {setAba('novo_camp'); setEditandoId(null);}} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${aba === 'novo_camp' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>
          {editandoId ? '✏️ Editando' : '➕ Novo Torneio'}
        </button>
        <button onClick={() => setAba('inscricao')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${aba === 'inscricao' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Inscrições</button>
        <button onClick={() => setAba('lancar')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${aba === 'lancar' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>Lançar Peixe</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA DO FORMULÁRIO */}
        <div className="lg:col-span-5 bg-zinc-800 p-6 rounded-[32px] border border-zinc-700 h-fit shadow-2xl">
          {aba === 'novo_camp' && (
            <form onSubmit={handleSalvarCamp} className="space-y-4 text-black">
              <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Campeonato" required className="w-full p-3 rounded-xl font-bold" />
              
              <div className="bg-zinc-700 p-4 rounded-xl border-2 border-dashed border-zinc-500 text-center">
                {formData.url_logo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={formData.url_logo} className="h-20 w-20 object-cover rounded-lg border-2 border-yellow-400" />
                    <button type="button" onClick={() => setFormData({...formData, url_logo: ''})} className="text-[10px] text-red-400 font-bold uppercase">Trocar Imagem</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <span className="text-white text-xs font-bold uppercase">{uploading ? 'Enviando...' : '📷 Upload da Logo'}</span>
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

              {/* AQUI ESTÃO AS CATEGORIAS QUE TINHAM SUMIDO */}
              <div className="p-4 bg-zinc-700 rounded-xl">
                 <p className="text-white text-[10px] font-black uppercase mb-3">Espécies Válidas no Torneio:</p>
                 <div className="flex flex-wrap gap-4">
                   {['Tucunaré', 'Trairas', 'Dourado'].map(c => (
                     <label key={c} className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                       <input type="checkbox" checked={catsSelecionadas.includes(c)} onChange={() => toggleCat(c)} className="w-4 h-4 accent-yellow-400" /> {c}
                     </label>
                   ))}
                 </div>
              </div>

              <button disabled={uploading} className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase shadow-lg hover:bg-white transition-all disabled:opacity-50">
                {editandoId ? 'Salvar Alterações' : 'Criar Campeonato'}
              </button>
            </form>
          )}

          {aba === 'inscricao' && (
            <form onSubmit={async (e:any) => {
              e.preventDefault()
              const p = pescadoresGerais.find(x => x.id === e.target.pescador_id.value)
              const camp = campeonatos.find(x => x.id === e.target.camp_id.value)
              const { error } = await supabase.from('campeonato_participantes').insert([{ 
                campeonato_id: camp.id, 
                pescador_id: p.id, 
                nome_pescador: p.nome_completo, 
                categorias_inscritas: camp.categorias 
              }])
              if (error) alert("Erro: Pescador já inscrito ou problema no banco.")
              else alert("Inscrito com sucesso!")
            }} className="space-y-4 text-black">
              <select name="camp_id" required className="w-full p-3 rounded-xl font-bold">
                <option value="">Escolha o Torneio</option>
                {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="pescador_id" required className="w-full p-3 rounded-xl font-bold">
                <option value="">Escolha o Pescador</option>
                {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              <button className="w-full bg-white text-black p-4 rounded-xl font-black uppercase shadow-lg">Confirmar Inscrição</button>
            </form>
          )}

          {aba === 'lancar' && (
            <form onSubmit={async (e:any) => {
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
              if (!error) { alert("Peixe Registrado!"); f.reset(); }
            }} className="space-y-4 text-black">
              <select name="camp_id" required className="w-full p-3 rounded-xl font-bold">
                <option value="">Torneio</option>
                {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="pescador_id" required className="w-full p-3 rounded-xl font-bold">
                <option value="">Pescador</option>
                {pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              <select name="especie" required className="w-full p-3 rounded-xl font-bold">
                <option value="Tucunaré">Tucunaré</option>
                <option value="Trairas">Trairas</option>
                <option value="Dourado">Dourado</option>
              </select>
              <input name="tamanho" type="number" step="0.1" placeholder="Medida em CM" required className="w-full p-3 rounded-xl font-bold" />
              <button className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black uppercase shadow-lg">Lançar Captura</button>
            </form>
          )}
        </div>

        {/* LISTA DE TORNEIOS PARA GESTÃO */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Torneios Ativos</h2>
          {campeonatos.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-4 rounded-[2rem] flex items-center justify-between border border-zinc-800 hover:border-zinc-600 transition-all">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-zinc-700 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-600 shadow-inner">
                    {c.url_logo ? <img src={c.url_logo} className="h-full w-full object-cover" /> : <span className="text-xl">🏆</span>}
                 </div>
                 <div>
                    <p className="font-black uppercase italic text-sm leading-none mb-1">{c.nome}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                      Cota {c.cota_max} • {c.categorias?.join(' / ')}
                    </p>
                 </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => prepararEdicao(c)} className="p-3 bg-zinc-700 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all">✏️</button>
                  <button onClick={async () => { if(confirm("Apagar campeonato e todos os peixes dele?")) { await supabase.from('campeonatos').delete().eq('id', c.id); carregarDados(); } }} className="p-3 bg-zinc-700 rounded-2xl hover:bg-red-600 transition-all">🗑️</button>
               </div>
            </div>
          ))}
          {campeonatos.length === 0 && <p className="text-center py-10 text-zinc-700 italic text-sm font-bold uppercase">Nenhum campeonato criado.</p>}
        </div>
      </div>
    </div>
  )
}
