'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const { id } = useParams()
  const [registro, setRegistro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados Sociais
  const [meuPerfil, setMeuPerfil] = useState<any>(null)
  const [loginAberto, setLoginAberto] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [novoComentario, setNovoComentario] = useState('')

  // Estados para Troca de Senha
  const [showTrocaSenha, setShowTrocaSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('recordes').select('*').eq('id', id).single()
      if (data) setRegistro(data)
      const sessaoLocal = localStorage.getItem('tr_sessao')
      if (sessaoLocal) setMeuPerfil(JSON.parse(sessaoLocal))
      carregarComentarios()
      setLoading(false)
    }
    carregar()
  }, [id])

  async function carregarComentarios() {
    const { data } = await supabase.from('comentarios').select('*').eq('captura_id', id).order('created_at', { ascending: true })
    if (data) setComentarios(data)
  }

  // --- LOGIN COM VERIFICAÇÃO DE PRIMEIRO ACESSO ---
  async function loginPescador(e: any) {
    e.preventDefault()
    const { data } = await supabase
      .from('pescadores')
      .select('*')
      .eq('nome_completo', e.target.nome.value)
      .eq('senha', e.target.senha.value)
      .single()
    
    if (data) {
      if (data.primeiro_login) {
        // Se for o primeiro login, guarda o perfil temporariamente e pede nova senha
        setMeuPerfil(data)
        setLoginAberto(false)
        setShowTrocaSenha(true)
      } else {
        localStorage.setItem('tr_sessao', JSON.stringify(data))
        setMeuPerfil(data)
        setLoginAberto(false)
      }
    } else {
      alert("Nome ou senha incorretos!")
    }
  }

  // --- FUNÇÃO PARA GRAVAR A NOVA SENHA ---
  async function atualizarSenha(e: any) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) return alert("As senhas não coincidem!")
    if (novaSenha.length < 4) return alert("A senha deve ter pelo menos 4 caracteres.")

    const { error } = await supabase
      .from('pescadores')
      .update({ senha: novaSenha, primeiro_login: false })
      .eq('id', meuPerfil.id)

    if (!error) {
      const perfilAtualizado = { ...meuPerfil, senha: novaSenha, primeiro_login: false }
      localStorage.setItem('tr_sessao', JSON.stringify(perfilAtualizado))
      setMeuPerfil(perfilAtualizado)
      setShowTrocaSenha(false)
      alert("Senha cadastrada com sucesso! Boa resenha.")
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
    if (!error) { setNovoComentario(''); carregarComentarios(); }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Abrindo Resenha...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-2 md:p-10 flex flex-col items-center font-sans pb-40">
      
      {/* (O código do seu Certificado vai aqui - sem alterações) */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden mb-10">
          {/* Mantenha o conteúdo do certificado aqui... */}
      </div>

      {/* SEÇÃO SOCIAL */}
      <section className="max-w-4xl w-full bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-800">
        <h3 className="text-xl font-black uppercase italic text-yellow-400 mb-8 flex items-center gap-3">
          💬 Resenha dos Pescadores
        </h3>

        <div className="space-y-6 mb-10">
          {comentarios.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-5 rounded-2xl border-l-4 border-yellow-500 shadow-lg">
              <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-2">{c.nome_pescador}</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{c.texto}</p>
            </div>
          ))}
        </div>

        {/* ÁREA DE POSTAGEM */}
        {meuPerfil && !meuPerfil.primeiro_login ? (
          <div className="bg-zinc-800 p-6 rounded-2xl space-y-4 border border-zinc-700">
            <textarea 
              value={novoComentario}
              onChange={e => setNovoComentario(e.target.value)}
              placeholder="O que achou desse troféu?"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white text-sm focus:border-yellow-400 outline-none h-24"
            />
            <div className="flex justify-between items-center">
              <button onClick={() => { localStorage.removeItem('tr_sessao'); setMeuPerfil(null); }} className="text-[9px] text-zinc-500 font-black uppercase hover:text-red-500">Sair ({meuPerfil.nome_completo})</button>
              <button onClick={postarComentario} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs shadow-xl">Postar</button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <button onClick={() => setLoginAberto(true)} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs hover:bg-yellow-400 transition-all shadow-xl">
              Fazer Login para Comentar
            </button>
          </div>
        )}
      </section>

      {/* MODAL 1: LOGIN */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={loginPescador} className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h2 className="text-2xl font-black uppercase italic text-black mb-6">Acesso Pescador</h2>
            <div className="space-y-4">
              <input name="nome" placeholder="Seu Nome Completo" required className="w-full p-4 border-2 rounded-xl text-black font-bold uppercase text-xs" />
              <input name="senha" type="password" placeholder="Sua Senha" required className="w-full p-4 border-2 rounded-xl text-black font-bold text-xs" />
              <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase shadow-xl">Entrar</button>
              <button type="button" onClick={() => setLoginAberto(false)} className="w-full text-zinc-400 font-black uppercase text-[9px] mt-2">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: TROCA DE SENHA OBRIGATÓRIA */}
      {showTrocaSenha && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <form onSubmit={atualizarSenha} className="bg-white p-8 rounded-3xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic text-black mb-2">Primeiro Acesso!</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 leading-tight">Para sua segurança, cadastre uma senha pessoal para comentar nas capturas.</p>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Nova Senha" 
                required 
                className="w-full p-4 border-2 rounded-xl text-black font-bold"
                onChange={e => setNovaSenha(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Confirme a Nova Senha" 
                required 
                className="w-full p-4 border-2 rounded-xl text-black font-bold"
                onChange={e => setConfirmarSenha(e.target.value)}
              />
              <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black uppercase shadow-xl hover:bg-black hover:text-yellow-400 transition-all">
                Salvar e Ativar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      <button onClick={() => window.history.back()} className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden z-50">← Voltar</button>
    </div>
  )
}
