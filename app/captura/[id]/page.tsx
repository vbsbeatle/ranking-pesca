'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DetalheCaptura() {
  const { id } = useParams()
  const [registro, setRegistro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posicao, setPosicao] = useState<number>(0)
  
  // Sociais
  const [meuPerfil, setMeuPerfil] = useState<any>(null)
  const [loginAberto, setLoginAberto] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [novoComentario, setNovoComentario] = useState('')
  const [showTrocaSenha, setShowTrocaSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    async function carregar() {
      // 1. Dados da Captura
      const { data: cap } = await supabase.from('recordes').select('*').eq('id', id).single()
      if (cap) {
        setRegistro(cap)
        
        // 2. Cálculo da Posição (Rank)
        const { count } = await supabase
          .from('recordes')
          .select('*', { count: 'exact', head: true })
          .eq('grupo_especie', cap.grupo_especie)
          .eq('subespecie', cap.subespecie)
          .eq('modalidade_tipo', cap.modalidade_tipo)
          .gt('tamanho_cm', cap.tamanho_cm)
        
        setPosicao((count || 0) + 1)
      }
      
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

  async function loginPescador(e: any) {
    e.preventDefault()
    const { data } = await supabase.from('pescadores').select('*').eq('nome_completo', e.target.nome.value).eq('senha', e.target.senha.value).single()
    if (data) {
      if (data.primeiro_login) { setMeuPerfil(data); setLoginAberto(false); setShowTrocaSenha(true); }
      else { localStorage.setItem('tr_sessao', JSON.stringify(data)); setMeuPerfil(data); setLoginAberto(false); }
    } else { alert("Login inválido!") }
  }

  async function atualizarSenha(e: any) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) return alert("Senhas diferentes!")
    const { error } = await supabase.from('pescadores').update({ senha: novaSenha, primeiro_login: false }).eq('id', meuPerfil.id)
    if (!error) {
      const pAtual = { ...meuPerfil, senha: novaSenha, primeiro_login: false }
      localStorage.setItem('tr_sessao', JSON.stringify(pAtual)); setMeuPerfil(pAtual); setShowTrocaSenha(false);
    }
  }

  async function postarComentario() {
    if (!novoComentario.trim()) return
    const { error } = await supabase.from('comentarios').insert([{ captura_id: id, pescador_id: meuPerfil.id, nome_pescador: meuPerfil.nome_completo, texto: novoComentario }])
    if (!error) { setNovoComentario(''); carregarComentarios(); }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Validando Troféu...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Peixe não encontrado.</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-2 md:p-10 flex flex-col items-center font-sans pb-40">
      
      {/* CERTIFICADO */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden mb-10">
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10 flex flex-col items-center">
          <img src="/logo-tr.jpg" alt="Logo" className="h-20 md:h-28 w-auto rounded shadow-md mb-4" />
          <h1 className="text-3xl md:text-5xl font-black uppercase italic text-black">Certificado de <span className="text-yellow-600">Captura</span></h1>
        </header>

        {/* NOME E POSIÇÃO */}
        <section className="text-center my-10 relative z-10">
          <div className="inline-block bg-yellow-500 text-black px-6 py-2 rounded-full font-black uppercase italic text-sm shadow-lg mb-6">
            🏆 {posicao}º Lugar no Ranking de {registro.subespecie}
          </div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Certificamos com honra o pescador</p>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic text-black border-b-8 border-black inline-block px-8 pb-2 leading-tight">{registro.nome_pescador}</h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border-l-8 border-yellow-500">
              <p className="text-[10px] font-black uppercase text-gray-400">Categoria</p>
              <p className="text-xl md:text-2xl font-black uppercase italic text-black leading-tight">{registro.grupo_especie} ({registro.subespecie})</p>
            </div>
            <div className="bg-black text-yellow-400 p-6 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase text-white opacity-70">Medida Oficial</p>
              <p className="text-5xl md:text-7xl font-black italic">{registro.tamanho_cm}<span className="text-2xl ml-2">CM</span></p>
            </div>
            <div className="text-black font-bold text-[10px] uppercase space-y-2 border-t pt-4">
              <p>📅 {new Date(registro.data_captura).toLocaleDateString('pt-BR')} | 📍 {registro.local_captura}</p>
              <p className="text-yellow-600">Modalidade: {registro.modalidade_tipo}</p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center -rotate-1"><img src={registro.url_foto_captura} className="max-w-full h-auto max-h-[350px] object-contain" /></div>
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center rotate-1"><img src={registro.url_foto_medicao} className="max-w-full h-auto max-h-[350px] object-contain" /></div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t-2 border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative z-10 text-[9px] font-black text-black uppercase">
          <div><p className="text-gray-400">Isca</p>{registro.isca || 'N/A'}</div>
          <div><p className="text-gray-400">Equipamento</p>{registro.carretilha || 'N/A'}</div>
          <div><p className="text-gray-400">Vara</p>{registro.vara || 'N/A'}</div>
          <div><p className="text-gray-400">Tipo</p>{registro.modalidade_tipo}</div>
        </footer>
      </div>

      {/* RESENHA */}
      <section className="max-w-4xl w-full bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-800">
        <h3 className="text-xl font-black uppercase italic text-yellow-400 mb-8 flex items-center gap-3">💬 Resenha dos Pescadores</h3>
        <div className="space-y-6 mb-10">
          {comentarios.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-5 rounded-2xl border-l-4 border-yellow-500">
              <p className="text-yellow-500 font-black text-[10px] uppercase mb-1">{c.nome_pescador}</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{c.texto}</p>
            </div>
          ))}
          {comentarios.length === 0 && <p className="text-zinc-600 italic text-sm text-center">Nenhum comentário ainda.</p>}
        </div>

        {meuPerfil && !meuPerfil.primeiro_login ? (
          <div className="bg-zinc-800 p-6 rounded-2xl space-y-4">
            <textarea value={novoComentario} onChange={e => setNovoComentario(e.target.value)} placeholder="Comente aqui..." className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white text-sm h-24 resize-none" />
            <div className="flex justify-between items-center">
              <button onClick={() => { localStorage.removeItem('tr_sessao'); setMeuPerfil(null); }} className="text-[9px] text-zinc-500 font-black uppercase hover:text-red-500">Sair ({meuPerfil.nome_completo})</button>
              <button onClick={postarComentario} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs">Enviar</button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <button onClick={() => setLoginAberto(true)} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs hover:bg-yellow-400 transition-all">Fazer Login para Comentar</button>
          </div>
        )}
      </section>

      {/* MODAIS */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={loginPescador} className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h2 className="text-xl font-black uppercase italic text-black mb-6">Acesso Pescador</h2>
            <input name="nome" placeholder="Seu Nome Completo" required className="w-full p-4 border-2 rounded-xl mb-4 text-black font-bold uppercase text-xs" />
            <input name="senha" type="password" placeholder="Sua Senha" required className="w-full p-4 border-2 rounded-xl mb-6 text-black font-bold text-xs" />
            <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
            <button type="button" onClick={() => setLoginAberto(false)} className="w-full text-zinc-400 font-black uppercase text-[9px] mt-4">Fechar</button>
          </form>
        </div>
      )}

      {showTrocaSenha && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <form onSubmit={atualizarSenha} className="bg-white p-8 rounded-3xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic text-black mb-2 text-center">Nova Senha</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 text-center">Crie sua senha definitiva para continuar.</p>
            <input type="password" placeholder="Nova Senha" required className="w-full p-4 border-2 rounded-xl mb-4 text-black font-bold" onChange={e => setNovaSenha(e.target.value)} />
            <input type="password" placeholder="Confirme a Senha" required className="w-full p-4 border-2 rounded-xl mb-6 text-black font-bold" onChange={e => setConfirmarSenha(e.target.value)} />
            <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black uppercase">Salvar Senha</button>
          </form>
        </div>
      )}

      <button onClick={() => window.history.back()} className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-black hover:text-yellow-400 print:hidden z-50">← Voltar</button>
    </div>
  )
}
