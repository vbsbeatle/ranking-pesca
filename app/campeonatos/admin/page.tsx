'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminCampeonatos() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados do Dashboard
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })

  // 1. VERIFICAÇÃO DE LOGIN (IGUAL AO PEIXEBOOK)
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        carregarDados()
      }
    }
    checkUser()
  }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) alert("Erro: " + error.message)
    else window.location.reload()
    setLoading(false)
  }

  // --- FUNÇÕES DE UPLOAD E GESTÃO ---
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

  async function handleUploadPerfil(e: any, pescadorId: string) {
    try {
      const file = e.target.files[0]
      if (!file) return
      const fileName = `${Date.now()}-p`
      await supabase.storage.from('fotos-pesca').upload(fileName, file)
      const { data } = supabase.storage.from('fotos-pesca').getPublicUrl(fileName)
      await supabase.from('pescadores').update({ url_foto: data.publicUrl }).eq('id', pescadorId)
      alert("Foto do pescador atualizada!")
      carregarDados()
    } catch (err: any) { alert("Erro: " + err.message) }
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

  // 2. SE NÃO ESTIVER LOGADO, MOSTRA O LOGIN
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
          <h2 className="text-xl font-black uppercase italic mb-6 text-black text-center">Admin Campeonatos</h2>
          <input type="email" placeholder="E-mail Admin" className="w-full p-4 border-2 rounded-xl mb-4 font-bold text-black outline-none" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-6 font-bold text-black outline-none" onChange={(e) => setSenha(e.target.value)} required />
          <button disabled={loading} className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase hover:bg-gray-900 transition-all">
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    )
  }

  // 3. SE LOGADO, MOSTRA O DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black uppercase italic text-yellow-400 border-l-4 border-yellow-400 pl-4">Arena PeixeBook</h1>
          <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white">Sair do Painel</button>
        </header>
        
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['novo_camp', 'inscricao', 'lancar', 'pescadores'].map((t) => (
            <button key={t} onClick={() => setAba(t)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${aba === t ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700'}`}>
              {t.replace('novo_camp', 'Torneios').replace('inscricao', 'Inscrições').replace('lancar', 'Lançar Peixe').replace('pescadores', 'Pescadores')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            {aba === 'novo_camp' && (
              <form onSubmit={handleSalvarCamp} className="bg-zinc-800 p-6 rounded-3xl space-y-4 text-black">
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Torneio" required className="w-full p-3 rounded-xl font-bold" />
                <div className="bg-zinc-700 p-4 rounded-xl border-2 border-dashed border-zinc-500 text-center text-white">
                  {formData.url_logo ? <img src={formData.url_logo} className="h-20 mx-auto rounded-lg mb-2" /> : null}
                  <label className="cursor-pointer text-[10px] font-black uppercase block"> {uploading ? 'Subindo...' : '📷 Carregar Logo'}
                    <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-400 ml-2">Início</label><input type="date" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} className="p-3 rounded-xl text-black font-bold" /></div>
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-400 ml-2">Fim</label><input type="date" value={formData.fim} onChange={e => setFormData({...formData, fim: e.target.value})} className="p-3 rounded-xl text-black font-bold" /></div>
                </div>
                <button className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase italic">{editandoId ? 'Atualizar' : 'Criar Campeonato'}</button>
              </form>
            )}

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
                <select name="camp_id" className="w-full p-4 rounded-xl font-bold">{campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
                <select name="pescador_id" className="w-full p-4 rounded-xl font-bold">{pescadoresGerais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}</select>
                <select name="especie" className="w-full p-4 rounded-xl font-bold"><option value="Tucunaré">Tucunaré</option><option value="Trairas">Trairas</option><option value="Dourado">Dourado</option></select>
                <input name="tamanho" type="number" step="0.1" placeholder="Medida CM" className="w-full p-4 rounded-xl font-bold" />
                <button className="w-full bg-yellow-400 text-black p-4 rounded-2xl font-black uppercase">Registrar Peixe</button>
              </form>
            )}
          </div>

          <div className="lg:col-span-7">
             {aba === 'pescadores' ? (
                <div className="bg-zinc-800 p-6 rounded-3xl space-y-4">
                  <h3 className="font-black uppercase italic text-sm mb-4">Fotos de Perfil</h3>
                  {pescadoresGerais.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <div className="flex items-center gap-4">
                        <img src={p.url_foto || 'https://via.placeholder.com/50'} className="h-10 w-10 rounded-full object-cover" />
                        <span className="text-xs font-bold">{p.nome_completo}</span>
                      </div>
                      <label className="bg-zinc-700 px-3 py-1 rounded text-[8px] font-black uppercase cursor-pointer hover:bg-yellow-400 hover:text-black">Mudar Foto<input type="file" accept="image/*" onChange={(e) => handleUploadPerfil(e, p.id)} className="hidden" /></label>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="space-y-4">
                  <h3 className="font-black uppercase italic text-sm mb-4 text-zinc-500">Lista de Torneios</h3>
                  {campeonatos.map(c => (
                    <div key={c.id} className="bg-zinc-800/50 p-4 rounded-3xl flex items-center justify-between border border-zinc-800">
                      <div className="flex items-center gap-4">
                        {c.url_logo && <img src={c.url_logo} className="h-10 w-10 rounded-xl object-cover" />}
                        <div><p className="font-black uppercase italic text-xs leading-none mb-1">{c.nome}</p><p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">Cota {c.cota_max} • {c.categorias?.join(' / ')}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditandoId(c.id); setFormData({ nome: c.nome, inicio: c.data_inicio, fim: c.data_fim, cota_min: String(c.cota_min), cota_max: String(c.cota_max), url_logo: c.url_logo || '' }); setCatsSelecionadas(c.categorias); setAba('novo_camp'); }} className="p-2 bg-zinc-700 rounded-lg hover:bg-yellow-400 hover:text-black transition-all">✏️</button>
                        <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('campeonatos').delete().eq('id', c.id); carregarDados(); } }} className="p-2 bg-zinc-700 rounded-lg hover:bg-red-600 transition-all">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
