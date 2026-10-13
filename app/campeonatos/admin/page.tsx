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
  const [capturasTorneio, setCapturasTorneio] = useState<any[]>([])
  const [inscritosTorneio, setInscritosTorneio] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // NOVO: Estado para filtrar a lista pelo torneio selecionado na aba de Inscrições
  const [torneioInscricaoSel, setTorneioInscricaoSel] = useState<string>('')

  const [formData, setFormData] = useState({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })

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

  useEffect(() => {
    if (user) carregarDados()
  }, [aba])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    const { data: cap } = await supabase.from('capturas_torneio').select('*').order('created_at', { ascending: false })
    const { data: ins } = await supabase.from('campeonato_participantes').select('*')
    
    if (c) {
      setCampeonatos(c)
      // Seleciona automaticamente o primeiro torneio ativo por padrão se nenhum estiver selecionado
      const ativo = c.find(item => item.status !== 'finalizado')
      if (ativo && !torneioInscricaoSel) {
        setTorneioInscricaoSel(ativo.id)
      }
    }
    if (p) setPescadoresGerais(p)
    if (cap) setCapturasTorneio(cap)
    if (ins) setInscritosTorneio(ins)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) alert("Erro: " + error.message)
    else window.location.reload()
    setLoading(false)
  }

  // --- FUNÇÕES DE GESTÃO ---
  async function handleUploadLogo(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return
      const filePath = `campeonatos/${Math.random()}.jpg`
      await supabase.storage.from('logos').upload(filePath, file)
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
      alert("Foto do pescador atualizada!"); carregarDados();
    } catch (err: any) { alert("Erro: " + err.message) }
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
      url_logo: formData.url_logo,
      status: 'ativo'
    }
    if (editandoId) { await supabase.from('campeonatos').update(dados).eq('id', editandoId); setEditandoId(null); }
    else { await supabase.from('campeonatos').insert([dados]) }
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    carregarDados()
  }

  async function alterarStatusTorneio(id: string, novoStatus: string) {
    const acao = novoStatus === 'finalizado' ? 'finalizar' : 'reabrir'
    if (confirm(`Deseja realmente ${acao} este torneio?`)) {
      const { error } = await supabase.from('campeonatos').update({ status: novoStatus }).eq('id', id)
      if (!error) {
        alert(`Torneio ${novoStatus === 'finalizado' ? 'finalizado' : 'reaberto'} com sucesso!`)
        carregarDados()
      } else {
        alert("Erro: " + error.message)
      }
    }
  }

  async function deletarCaptura(id: string) {
    if (confirm("Deseja realmente excluir este peixe do torneio?")) {
      const { error } = await supabase.from('capturas_torneio').delete().eq('id', id)
      if (!error) { alert("Captura removida!"); carregarDados(); }
    }
  }

  async function removerInscricao(id: string) {
    if (confirm("Deseja realmente desinscrever este pescador do torneio?")) {
      const { error } = await supabase.from('campeonato_participantes').delete().eq('id', id)
      if (!error) { alert("Pescador desinscrito com sucesso!"); carregarDados(); }
      else { alert("Erro ao desinscrever: " + error.message) }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl text-black">
          <h2 className="text-xl font-black uppercase italic mb-6 text-center tracking-tighter">Admin Campeonatos</h2>
          <input type="email" placeholder="E-mail" className="w-full p-4 border-2 rounded-xl mb-4 font-bold outline-none" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-6 font-bold outline-none" onChange={(e) => setSenha(e.target.value)} required />
          <button disabled={loading} className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  const campeonatosAtivos = campeonatos.filter(c => c.status !== 'finalizado')
  const campeonatosFinalizados = campeonatos.filter(c => c.status === 'finalizado')

  // Filtra os inscritos para exibir apenas do torneio atualmente selecionado
  const inscritosFiltrados = inscritosTorneio.filter(ins => 
    (ins.campeonato_id || ins.campeonato) === torneioInscricaoSel
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black uppercase italic text-yellow-400 border-l-4 border-yellow-400 pl-4">Arena PeixeBook</h1>
          <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white">Logout</button>
        </header>
        
        <div className="flex gap-2 mb-10 overflow-x-auto pb-4">
          {[
            { id: 'novo_camp', label: '🏆 Torneios' },
            { id: 'inscricao', label: '📝 Inscrições' },
            { id: 'lancar', label: '🎣 Lançar Peixe' },
            { id: 'ver_peixes', label: '🗑️ Deletar Peixes' },
            { id: 'pescadores', label: '👥 Pescadores' }
          ].map((t) => (
            <button key={t.id} onClick={() => setAba(t.id)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 whitespace-nowrap transition-all ${aba === t.id ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-800 text-zinc-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            {aba === 'novo_camp' && (
              <form onSubmit={handleSalvarCamp} className="bg-zinc-900 p-8 rounded-[2.5rem] space-y-4 text-black border border-zinc-800">
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Torneio" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none" />
                <div className="bg-zinc-800 p-6 rounded-2xl border-2 border-dashed border-zinc-700 text-center text-white">
                  {formData.url_logo ? <img src={formData.url_logo} className="h-20 mx-auto rounded-lg mb-4" alt="Logo" /> : null}
                  <label className="cursor-pointer text-[10px] font-black uppercase block hover:text-yellow-400">
                    {uploading ? 'Aguarde...' : '📷 Carregar Logo'}
                    <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-500 mb-1 ml-2">Início</label><input type="date" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} className="p-3 rounded-xl font-bold bg-white" /></div>
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-500 mb-1 ml-2">Fim</label><input type="date" value={formData.fim} onChange={e => setFormData({...formData, fim: e.target.value})} className="p-3 rounded-xl font-bold bg-white" /></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-500 mb-1 ml-2">Cota Mínima</label><input type="number" placeholder="Mínima" value={formData.cota_min} onChange={e => setFormData({...formData, cota_min: e.target.value})} className="p-4 rounded-2xl font-bold bg-white outline-none" /></div>
                  <div className="flex flex-col"><label className="text-[9px] uppercase font-bold text-zinc-500 mb-1 ml-2">Cota Máxima</label><input type="number" placeholder="Máxima" value={formData.cota_max} onChange={e => setFormData({...formData, cota_max: e.target.value})} className="p-4 rounded-2xl font-bold bg-white outline-none" /></div>
                </div>

                <div className="p-4 bg-zinc-800 rounded-2xl">
                   <p className="text-white text-[10px] font-black uppercase mb-3">Categorias:</p>
                   <div className="flex flex-wrap gap-4">
                     {['Tucunaré', 'Trairas', 'Dourado'].map(c => (
                       <label key={c} className="flex items-center gap-2 text-xs text-white cursor-pointer select-none"><input type="checkbox" checked={catsSelecionadas.includes(c)} onChange={() => setCatsSelecionadas(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className="w-4 h-4 accent-yellow-400" /> {c}</label>
                     ))}
                   </div>
                </div>
                <button className="w-full bg-yellow-400 text-black p-5 rounded-2xl font-black uppercase italic shadow-lg">Salvar Torneio</button>
              </form>
            )}
            
            {aba === 'inscricao' && (
              <form onSubmit={async (e:any) => {
                e.preventDefault();
                const pSel = pescadoresGerais.find(x => x.id === e.target.pescador_id.value);
                const campId = torneioInscricaoSel;
                if (!pSel || !campId) return;

                await supabase.from('campeonato_participantes').insert([{ 
                  campeonato_id: campId, 
                  pescador_id: pSel.id, 
                  nome_pescador: pSel.nome_completo 
                }]);
                alert("Inscrito!"); 
                carregarDados();
              }} className="bg-zinc-900 p-8 rounded-[2.5rem] space-y-4 text-black border border-zinc-800">
                <select 
                  value={tor
