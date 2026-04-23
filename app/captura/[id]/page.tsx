'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const { id } = useParams()
  const [registro, setRegistro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para o Sistema Social
  const [meuPerfil, setMeuPerfil] = useState<any>(null)
  const [loginAberto, setLoginAberto] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [novoComentario, setNovoComentario] = useState('')

  useEffect(() => {
    async function carregar() {
      // Carrega dados da captura
      const { data } = await supabase.from('recordes').select('*').eq('id', id).single()
      if (data) setRegistro(data)
      
      // Carrega sessão do pescador (se houver)
      const sessaoLocal = localStorage.getItem('tr_sessao')
      if (sessaoLocal) setMeuPerfil(JSON.parse(sessaoLocal))
      
      // Carrega comentários
      carregarComentarios()
      setLoading(false)
    }
    carregar()
  }, [id])

  async function carregarComentarios() {
    const { data } = await supabase
      .from('comentarios')
      .select('*')
      .eq('captura_id', id)
      .order('created_at', { ascending: true })
    if (data) setComentarios(data)
  }

  async function loginPescador(e: any) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('pescadores')
      .select('*')
      .eq('nome_completo', e.target.nome.value)
      .eq('senha', e.target.senha.value)
      .single()
    
    if (data) {
      localStorage.setItem('tr_sessao', JSON.stringify(data))
      setMeuPerfil(data)
      setLoginAberto(false)
    } else {
      alert("Pescador não encontrado ou senha incorreta!")
    }
  }

  async function postarComentario() {
    if (!novoComentario.trim()) return
    const { error } = await supabase.from('comentarios').insert([{
        captura_id: id,
        pescador_id: meuPerfil.id,
        nome_pescador: meuPerfil.nome_completo,
        texto: novoComentario
    }])
    if (!error) {
      setNovoComentario('')
      carregarComentarios()
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Sincronizando Resenha...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-2 md:p-10 flex flex-col items-center font-sans pb-40">
      
      {/* --- BLOCO DO CERTIFICADO (MANTENDO SEU DESIGN) --- */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden mb-10">
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10 flex flex-col items-center">
            <img src="/logo-tr.jpg" alt="Logo" className="h-24 w-auto rounded mb-4" />
            <h1 className="text-3xl md:text-5xl font-black uppercase italic text-black leading-none">Certificado de <span className="text-yellow-600">Captura</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2">Trilhas do Rio Pesca Esportiva</p>
        </header>

        <section className="text-center my-10 md:my-14 relative z-10">
          <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Certificamos com honra o pescador</p>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic text-black border-b-8 border-black inline-block px-8 pb-2 leading-tight">{registro.nome_pescador}</h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border-l-8 border-yellow-500">
              <p className="text-[10px] font-black uppercase text-gray-400">Espécie / Subespécie</p>
              <p className="text-2xl font-black uppercase italic text-black leading-tight">{registro.grupo_especie}</p>
              <p className="text-xs font-black text-yellow-600 uppercase">{registro.subespecie}</p>
            </div>
            <div className="bg-black text-yellow-400 p-6 rounded-2xl text-center lg:text-left">
              <p className="text-[10px] font-black uppercase text-white tracking-widest">Medida Oficial</p>
              <p className="text-5xl md:text-7xl font-black italic">{registro.tamanho_cm}<span className="text-3xl ml-2 uppercase">cm</span></p>
            </div>
            <div className="text-black font-bold text-[10px] uppercase space-y-2">
              <p>📅 {new Date(registro.data_captura).toLocaleDateString('pt-BR')}</p>
              <p>📍 {registro.local_captura}</p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center -rotate-1"><img src={registro.url_foto_captura} className="max-w-full h-auto max-h-[300px] object-contain" /></div>
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center rotate-1"><img src={registro.url_foto_medicao} className="max-w-full h-auto max-h-[300px] object-contain" /></div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t-2 border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative z-10 text-[10px] font-black text-black uppercase">
          <div><p className="text-gray-400 text-[8px]">Isca</p>{registro.isca || 'N/A'}</div>
          <div><p className="text-gray-400 text-[8px]">Equipamento</p>{registro.carretilha || 'N/A'}</div>
          <div><p className="text-gray-400 text-[8px]">Vara</p>{registro.vara || 'N/A'}</div>
          <div><p className="text-gray-400 text-[8px]">Modalidade</p>{registro.modalidade_tipo}</div>
        </footer>
      </div>

      {/* --- SEÇÃO SOCIAL (RESENHA) --- */}
      <section className="max-w-4xl w-full bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-800">
        <h3 className="text-xl font-black uppercase italic text-yellow-400 mb-8 flex items-center gap-3">
          💬 Resenha da Galera
        </h3>

        <div className="space-y-6 mb-10">
          {comentarios.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-5 rounded-2xl border-l-4 border-yellow-500 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest">{c.nome_pescador}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <p className="text-zinc-200 text-sm leading-relaxed">{c.texto}</p>
            </div>
          ))}
          {comentarios.length === 0 && (
            <p className="text-zinc-600 italic text-sm text-center py-10 border border-dashed border-zinc-800 rounded-2xl">
              Ninguém comentou ainda. Seja o primeiro a parabenizar o parceiro!
            </p>
          )}
        </div>

        {/* ÁREA DE POSTAGEM */}
        {meuPerfil ? (
          <div className="bg-zinc-800 p-6 rounded-2xl space-y-4 border border-zinc-700 shadow-inner">
            <textarea 
              value={novoComentario}
              onChange={e => setNovoComentario(e.target.value)}
              placeholder={`Parabenize o ${registro.nome_pescador.split(' ')[0]} pela captura!`}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white text-sm focus:border-yellow-400 outline-none transition-all h-24 resize-none"
            />
            <div className="flex justify-between items-center">
              <button 
                onClick={() => { localStorage.removeItem('tr_sessao'); setMeuPerfil(null); }} 
                className="text-[9px] text-zinc-500 font-black uppercase hover:text-red-500 transition-colors"
              >
                Sair do Perfil ({meuPerfil.nome_completo})
              </button>
              <button 
                onClick={postarComentario} 
                className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs shadow-xl hover:scale-105 transition-transform"
              >
                Postar Comentário
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 text-sm mb-6 font-bold uppercase tracking-widest">Somente membros cadastrados podem comentar.</p>
            <button 
              onClick={() => setLoginAberto(true)} 
              className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs hover:bg-yellow-400 transition-all shadow-xl"
            >
              Fazer Login para Comentar
            </button>
          </div>
        )}
      </section>

      {/* MODAL DE LOGIN PESCADOR */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={loginPescador} className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">
            <h2 className="text-2xl font-black uppercase italic text-black mb-2">Identifique-se</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-8 tracking-widest">Clube Trilhas do Rio</p>
            <div className="space-y-4">
              <input name="nome" placeholder="Seu Nome Completo" required className="w-full p-4 border-2 rounded-xl text-black font-black uppercase text-xs outline-none focus:border-yellow-400" />
              <input name="senha" type="password" placeholder="Sua Senha de Membro" required className="w-full p-4 border-2 rounded-xl text-black font-black text-xs outline-none focus:border-yellow-400" />
              <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase shadow-xl hover:bg-zinc-800">Entrar na Resenha</button>
              <button type="button" onClick={() => setLoginAberto(false)} className="w-full text-zinc-400 font-black uppercase text-[9px] mt-4 tracking-widest">Fechar / Voltar</button>
            </div>
          </form>
        </div>
      )}

      {/* BOTÃO VOLTAR */}
      <button onClick={() => window.history.back()} className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden z-50">← Voltar</button>
    </div>
  )
}
