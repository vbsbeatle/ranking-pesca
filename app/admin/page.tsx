'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [aba, setAba] = useState('aprovacoes')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [pendentes, setPendentes] = useState<any[]>([])
  const [capturaSelecionada, setCapturaSelecionada] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [grupo, setGrupo] = useState("Tucunaré")

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós", "Hibrido"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

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
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    const { data: pend } = await supabase.from('recordes').select('*').eq('status', 'pendente').order('created_at', { ascending: false })
    if (p) setPescadores(p)
    if (pend) setPendentes(pend)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) alert("Erro: " + error.message)
    else window.location.reload()
    setLoading(false)
  }

  const handlePescador = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    try {
      const file = form.foto.files[0]
      const fileName = `${Date.now()}-p`
      await supabase.storage.from('fotos-pesca').upload(fileName, file)
      const url = supabase.storage.from('fotos-pesca').getPublicUrl(fileName).data.publicUrl
      
      await supabase.from('pescadores').insert([{ 
        nome_completo: form.nome.value, 
        cidade: form.cidade.value, 
        senha: form.senha_membro.value,
        url_foto: url 
      }])
      
      setMsg('Membro salvo com sucesso!'); form.reset()
      carregarDados()
    } catch (err) { setMsg('Erro ao cadastrar') }
    setLoading(false)
  }

  const handleAprovar = async (id: string) => {
    if (confirm("Confirmar aprovação deste troféu?")) {
      await supabase.from('recordes').update({ status: 'aprovado' }).eq('id', id)
      alert("Captura Aprovada com Sucesso!")
      setCapturaSelecionada(null)
      carregarDados()
    }
  }

  const handleRecusar = async (id: string) => {
    if (confirm("Deseja recusar e excluir permanentemente esta captura?")) {
      await supabase.from('recordes').delete().eq('id', id)
      alert("Captura Recusada e Removida!")
      setCapturaSelecionada(null)
      carregarDados()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
          <h2 className="text-xl font-black uppercase italic mb-6 text-black text-center">Login Master Admin</h2>
          <input type="email" placeholder="E-mail Admin" className="w-full p-4 border-2 rounded-xl mb-4 font-bold text-black outline-none" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-6 font-bold text-black outline-none" onChange={(e) => setSenha(e.target.value)} required />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase hover:bg-gray-900 transition-all">Entrar no Sistema</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 text-black font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
           <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase text-gray-400">Sair / Logout</button>
           <a href="/admin/gerenciar" className="bg-red-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase italic shadow-lg hover:bg-black transition-all">🗑️ Gerenciar Recordes</a>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-b-8 border-yellow-400">
          <div className="flex bg-black">
            <button onClick={() => setAba('aprovacoes')} className={`flex-1 p-4 font-black uppercase italic text-xs ${aba === 'aprovacoes' ? 'bg-yellow-400 text-black' : 'text-white'}`}>⏳ Pendentes ({pendentes.length})</button>
            <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase italic text-xs ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>Novo Pescador</button>
          </div>

          <div className="p-8">
            {/* ABA DE CAPTURAS PENDENTES */}
            {aba === 'aprovacoes' && (
              <div>
                <h2 className="text-xl font-black uppercase italic mb-6">Capturas Aguardando Análise</h2>
                <div className="space-y-4">
                  {pendentes.map(item => (
                    <div key={item.id} className="p-4 bg-gray-50 border-2 rounded-2xl flex items-center justify-between hover:border-yellow-400 transition-all">
                      <div>
                        <p className="font-black uppercase text-sm">{item.nome_pescador}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">{item.grupo_especie} ({item.subespecie}) • <span className="text-yellow-600 font-black">{item.tamanho_cm} CM</span></p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold mt-1">Data: {new Date(item.data_captura).toLocaleDateString()} | Local: {item.local_captura}</p>
                      </div>
                      <button 
                        onClick={() => setCapturaSelecionada(item)} 
                        className="bg-black text-yellow-400 px-4 py-2 rounded-xl text-xs font-black uppercase italic hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        Analisar →
                      </button>
                    </div>
                  ))}
                  {pendentes.length === 0 && (
                    <p className="text-center py-10 text-gray-400 font-black uppercase italic text-xs">Nenhuma captura aguardando aprovação no momento.</p>
                  )}
                </div>
              </div>
            )}

            {/* ABA CADASTRO DE PESCADOR */}
            {aba === 'pescador' && (
              <form onSubmit={handlePescador} className="space-y-4">
                <input name="nome" placeholder="Nome do Pescador" required className="w-full p-3 border-2 rounded font-bold text-black" />
                <input name="cidade" placeholder="Cidade Base" required className="w-full p-3 border-2 rounded font-bold text-black" />
                <input name="senha_membro" placeholder="Senha de Acesso do Pescador" required className="w-full p-3 border-2 rounded font-bold text-black" />
                <div className="p-4 bg-gray-50 border-2 border-dashed rounded text-center">
                   <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Foto de Perfil</p>
                   <input name="foto" type="file" accept="image/*" required className="w-full text-xs text-black" />
                </div>
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-lg">Salvar Membro</button>
              </form>
            )}

            {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 uppercase italic animate-bounce">{msg}</p>}
          </div>
        </div>
      </div>

      {/* MODAL DETALHADO DA CAPTURA PARA APROVAÇÃO (FOTOS INTEIRAS SEM CORTE) */}
      {capturaSelecionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 my-8 border-t-8 border-yellow-400 text-black max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-2xl font-black uppercase italic">{capturaSelecionada.nome_pescador}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase">{capturaSelecionada.cidade}</p>
              </div>
              <button onClick={() => setCapturaSelecionada(null)} className="text-xl font-bold text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl text-xs font-bold">
              <div><span className="text-gray-400 uppercase text-[9px] block">Espécie/Subespécie</span>{capturaSelecionada.grupo_especie} - {capturaSelecionada.subespecie}</div>
              <div><span className="text-gray-400 uppercase text-[9px] block">Tamanho</span><span className="text-yellow-600 font-black text-base">{capturaSelecionada.tamanho_cm} CM</span></div>
              <div><span className="text-gray-400 uppercase text-[9px] block">Data Captura</span>{new Date(capturaSelecionada.data_captura).toLocaleDateString()}</div>
              <div><span className="text-gray-400 uppercase text-[9px] block">Local</span>{capturaSelecionada.local_captura}</div>
              <div><span className="text-gray-400 uppercase text-[9px] block">Categoria</span>{capturaSelecionada.modalidade_tipo}</div>
              <div><span className="text-gray-400 uppercase text-[9px] block">Pescaria</span>{capturaSelecionada.tipo_pescaria}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-black text-yellow-600 uppercase text-[10px] mb-1">Equipamento Utilizado</p>
              <p><strong>Vara:</strong> {capturaSelecionada.vara}</p>
              <p><strong>Carretilha/Molinete:</strong> {capturaSelecionada.carretilha}</p>
              <p><strong>Isca Artificial:</strong> {capturaSelecionada.isca}</p>
            </div>

            {/* EXIBIÇÃO INTEGRAL DAS FOTOS (SENSÍVEL À ANÁLISE DE RÉGUA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 p-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-yellow-400 mb-2 text-center">Foto com Pescador</p>
                <div className="flex items-center justify-center bg-black rounded-xl overflow-hidden min-h-[300px]">
                  <img src={capturaSelecionada.url_foto_captura} className="w-full max-h-[60vh] object-contain" alt="Pescador com Peixe" />
                </div>
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-yellow-400 mb-2 text-center">Foto na Régua (Visão Completa)</p>
                <div className="flex items-center justify-center bg-black rounded-xl overflow-hidden min-h-[300px]">
                  <img src={capturaSelecionada.url_foto_medicao} className="w-full max-h-[60vh] object-contain" alt="Medição na Régua" />
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex gap-4 pt-4 border-t">
              <button 
                onClick={() => handleAprovar(capturaSelecionada.id)} 
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase italic hover:bg-green-700 transition-all shadow-lg text-sm"
              >
                ✓ Aprovar Captura
              </button>
              <button 
                onClick={() => handleRecusar(capturaSelecionada.id)} 
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase italic hover:bg-red-700 transition-all shadow-lg text-sm"
              >
                ✕ Recusar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
