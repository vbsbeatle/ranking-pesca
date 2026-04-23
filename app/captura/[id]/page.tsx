'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const { id } = useParams()
  const [registro, setRegistro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados Sociais e Comentários
  const [meuPerfil, setMeuPerfil] = useState<any>(null)
  const [loginAberto, setLoginAberto] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [novoComentario, setNovoComentario] = useState('')

  // Estados para Troca de Senha Obrigatória
  const [showTrocaSenha, setShowTrocaSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    async function carregar() {
      // 1. Carrega dados da captura
      const { data } = await supabase.from('recordes').select('*').eq('id', id).single()
      if (data) setRegistro(data)
      
      // 2. Carrega sessão do pescador (se houver)
      const sessaoLocal = localStorage.getItem('tr_sessao')
      if (sessaoLocal) setMeuPerfil(JSON.parse(sessaoLocal))
      
      // 3. Carrega comentários
      carregarComentarios()
      setLoading(false)
    }
    carregar()
  }, [id])

  async function carregarComentarios() {
    const { data } = await supabase.from('comentarios').select('*').eq('captura_id', id).order('created_at', { ascending: true })
    if (data) setComentarios(data)
  }

  // LOGIN DO PESCADOR
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

  // ATUALIZAÇÃO DE SENHA (PRIMEIRO ACESSO)
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
      alert("Senha cadastrada com sucesso!")
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic tracking-widest">Validando Troféu...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Registro não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-2 md:p-10 flex flex-col items-center font-sans pb-40">
      
      {/* --- BLOCO DO CERTIFICADO --- */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden mb-10">
        
        {/* LOGO E TÍTULO */}
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo-tr.jpg" alt="Logo TR" className="h-20 md:h-28 w-auto rounded shadow-md border border-gray-100" />
            <div className="mt-2 text-black">
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                Certificado de <span className="text-yellow-600">Captura</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-3">Trilhas do Rio Pesca Esportiva</p>
            </div>
          </div>
        </header>

        {/* NOME DO PESCADOR */}
        <section className="text-center my-10 md:my-14 relative z-10">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Certificamos com honra que o pescador</p>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic text-black border-b-4 md:border-b-8 border-black inline-block px-4 md:px-8 pb-3 leading-tight">
            {registro.nome_pescador}
          </h2>
        </section>

        {/* CONTEÚDO TÉCNICO E FOTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* DADOS (ESQUERDA) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border-l-8 border-yellow-500 shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Espécie / Subespécie</p>
              <p className="text-xl md:text-2xl font-black uppercase italic text-black leading-tight">{registro.grupo_especie}</p>
              <p className="text-xs font-black text-yellow-600 uppercase tracking-widest">{registro.subespecie}</p>
            </div>

            <div className="bg-black text-yellow-400 p-6 rounded-2xl shadow-2xl text-center">
              <p className="text-[10px] font-black uppercase opacity-70 mb-1 text-white">Medida Oficial</p>
              <p className="text-5xl md:text-7xl font-black italic">{registro.tamanho_cm}<span className="text-2xl md:text-3xl ml-2">CM</span></p>
            </div>

            <div className="space-y-3 text-black font-bold text-[11px] uppercase pt-4 border-t border-gray-100">
              <p>📅 Data: {new Date(registro.data_captura).toLocaleDateString('pt-BR')}</p>
              <p>📍 Local: {registro.local_captura}</p>
            </div>
          </div>

          {/* FOTOS (DIREITA) - SEM CORTE */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-2 shadow-xl border border-gray-200 -rotate-1 flex flex-col items-center">
               <img src={registro.url_foto_captura} className="max-w-full h-auto max-h-[350px] object-contain" alt="Peixe" />
               <p className="font-serif italic text-gray-400 text-[10px] mt-2">O Troféu</p>
            </div>
            <div className="bg-white p-2 shadow-xl border border-gray-200 rotate-1 flex flex-col items-center">
               <img src={registro.url_foto_medicao} className="max-w-full h-auto max-h-[350px] object-contain" alt="Régua" />
               <p className="font-serif italic text-gray-400 text-[10px] mt-2">A Medição</p>
            </div>
          </div>
        </div>

        {/* RODAPÉ EQUIPAMENTOS */}
        <footer className="mt-12 pt-8 border-t-2 border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative z-10 text-black">
          <div><p className="text-[8px] font-black text-gray-400 uppercase">Equipamento</p><p className="text-[10px] font-black uppercase">{registro.carretilha || 'N/A'}</p></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase">Isca</p><p className="text-[10px] font-black uppercase">{registro.isca || 'N/A'}</p></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase">Vara</p><p className="text-[10px] font-black uppercase">{registro.vara || 'N/A'}</p></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase">Modalidade</p><p className="text-[10px] font-black uppercase">{registro.modalidade_tipo}</p></div>
        </footer>
      </div>

      {/* --- SEÇÃO DE RESENHA (COMENTÁRIOS) --- */}
      <section className="max-w-4xl w-full bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-800">
        <h3 className="text-xl font-black uppercase italic text-yellow-400 mb-8 flex items-center gap-3">💬 Resenha dos Pescadores</h3>

        <div className="space-y-6 mb-10">
          {comentarios.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-5 rounded-2xl border-l-4 border-yellow-500 shadow-lg">
              <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-1">{c.nome_pescador}</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{c.texto}</p>
            </div>
          ))}
          {comentarios.length === 0 && <p className="text-zinc-600 italic text-sm text-center py-10">Seja o primeiro a comentar!</p>}
        </div>

        {meuPerfil && !meuPerfil.primeiro_login ? (
          <div className="bg-zinc-800 p-6 rounded-2xl space-y-4 border border-zinc-700">
            <textarea 
              value={novoComentario}
              onChange={e => setNovoComentario(e.target.value)}
              placeholder="Comente aqui..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white text-sm focus:border-yellow-400 outline-none h-24 resize-none"
            />
            <div className="flex justify-between items-center">
              <button onClick={() => { localStorage.removeItem('tr_sessao'); setMeuPerfil(null); }} className="text-[9px] text-zinc-500 font-black uppercase hover:text-red-500">Sair ({meuPerfil.nome_completo})</button>
              <button onClick={postarComentario} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs shadow-xl">Enviar</button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <button onClick={() => setLoginAberto(true)} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs hover:bg-yellow-400 transition-all shadow-xl">Fazer Login para Comentar</button>
          </div>
        )}
      </section>

      {/* --- MODAIS (LOGIN E SENHA) --- */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={loginPescador} className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h2 className="text-2xl font-black uppercase italic text-black mb-6">Acesso Pescador</h2>
            <div className="space-y-4">
              <input name="nome" placeholder="Seu Nome Completo" required className="w-full p-4 border-2 rounded-xl text-black font-bold uppercase text-xs outline-none focus:border-yellow-400" />
              <input name="senha" type="password" placeholder="Sua Senha" required className="w-full p-4 border-2 rounded-xl text-black font-bold text-xs outline-none focus:border-yellow-400" />
              <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase shadow-xl">Entrar na Resenha</button>
              <button type="button" onClick={() => setLoginAberto(false)} className="w-full text-zinc-400 font-black uppercase text-[9px] mt-4">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {showTrocaSenha && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <form onSubmit={atualizarSenha} className="bg-white p-8 rounded-3xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic text-black mb-2 text-center">Nova Senha</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 text-center">Crie sua senha definitiva para continuar.</p>
            <div className="space-y-4">
              <input type="password" placeholder="Nova Senha" required className="w-full p-4 border-2 rounded-xl text-black font-bold outline-none focus:border-yellow-400" onChange={e => setNovaSenha(e.target.value)} />
              <input type="password" placeholder="Confirme a Senha" required className="w-full p-4 border-2 rounded-xl text-black font-bold outline-none focus:border-yellow-400" onChange={e => setConfirmarSenha(e.target.value)} />
              <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black uppercase shadow-xl hover:bg-black hover:text-yellow-400 transition-all">Salvar Senha</button>
            </div>
          </form>
        </div>
      )}

      {/* BOTÃO VOLTAR */}
      <button onClick={() => window.history.back()} className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-sm shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden z-50">← Voltar ao Ranking</button>
    </div>
  )
}
