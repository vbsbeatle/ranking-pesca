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
      // 1. Carrega dados da captura
      const { data: cap } = await supabase.from('recordes').select('*').eq('id', id).single()
      
      if (cap) {
        setRegistro(cap)
        
        // 2. CÁLCULO DE POSIÇÃO DINÂMICA
        const { data: todos } = await supabase
          .from('recordes')
          .select('id, tamanho_cm')
          .eq('grupo_especie', cap.grupo_especie)
          .eq('subespecie', cap.subespecie)
          .eq('modalidade_tipo', cap.modalidade_tipo)

        if (todos && todos.length > 0) {
          // Ordena decrescente pelo tamanho de forma estritamente numérica
          const ordenados = todos.sort((a, b) => parseFloat(b.tamanho_cm) - parseFloat(a.tamanho_cm))
          
          // Encontra a posição exata deste peixe
          const index = ordenados.findIndex(item => item.id === cap.id)
          setPosicao(index !== -1 ? index + 1 : 1)
        } else {
          setPosicao(1)
        }
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
    } else { alert("Acesso negado!") }
  }

  async function atualizarSenha(e: any) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) return alert("As senhas não batem!")
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase italic">Validando Posição no Pódio...</div>
  if (!registro) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Captura inexistente.</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-2 md:p-10 flex flex-col items-center font-sans pb-40 text-black">
      
      {/* CERTIFICADO */}
      <div className="bg-white w-full max-w-5xl border-[12px] border-double border-yellow-500 p-4 md:p-12 shadow-[0_0_60px_rgba(0,0,0,1)] relative overflow-hidden mb-10">
        <header className="text-center border-b-2 border-gray-100 pb-8 relative z-10 flex flex-col items-center">
          <img src="/logo-tr.jpg" alt="Logo" className="h-24 w-auto rounded shadow-md mb-4" />
          <h1 className="text-3xl md:text-5xl font-black uppercase italic text-black leading-none">Certificado de <span className="text-yellow-600">Captura</span></h1>
        </header>

        <section className="text-center my-10 relative z-10">
          {/* SELO DE POSIÇÃO DINÂMICO */}
          <div className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase italic text-sm shadow-xl mb-8 border-2 border-black">
             🏆 {posicao}º Lugar em {registro.grupo_especie} {registro.subespecie}
          </div>
          
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Certificamos com honra o pescador</p>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic text-black border-b-8 border-black inline-block px-8 pb-3 leading-tight">{registro.nome_pescador}</h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border-l-8 border-yellow-500 shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Categoria Oficial</p>
              <p className="text-2xl font-black uppercase italic text-black leading-tight">{registro.grupo_especie}</p>
              <p className="text-xs font-black text-yellow-600 uppercase tracking-widest">{registro.subespecie}</p>
            </div>
            <div className="bg-black text-yellow-400 p-6 rounded-2xl shadow-2xl text-center transform -rotate-1">
              <p className="text-[10px] font-black uppercase text-white opacity-70 tracking-widest">Medida Comprovada</p>
              <p className="text-6xl md:text-8xl font-black italic">{registro.tamanho_cm}<span className="text-3xl ml-2">CM</span></p>
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-100 text-[11px] font-black uppercase">
              <div className="flex items-center gap-3"><span className="text-yellow-500">📅</span> {new Date(registro.data_captura).toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-3"><span className="text-yellow-500">📍</span> {registro.local_captura}</div>
              <div className="flex items-center gap-3 text-yellow-600"><span className="text-yellow-600">⚓</span> {registro.modalidade_tipo}</div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center -rotate-1">
              <img src={registro.url_foto_captura} className="max-w-full h-auto max-h-[350px] object-contain rounded-sm" alt="Foto do Peixe" />
            </div>
            <div className="bg-white p-2 shadow-xl border flex items-center justify-center rotate-1">
              <img src={registro.url_foto_medicao} className="max-w-full h-auto max-h-[350px] object-contain rounded-sm" alt="Foto da Medição" />
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t-2 border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10 text-[9px] font-black text-black uppercase tracking-tighter">
          <div><p className="text-gray-400 mb-1">Isca Artificial</p>{registro.isca || 'N/A'}</div>
          <div><p className="text-gray-400 mb-1">Carretilha / Molinete</p>{registro.carretilha || 'N/A'}</div>
          <div><p className="text-gray-400 mb-1">Vara de Pesca</p>{registro.vara || 'N/A'}</div>
          <div><p className="text-gray-400 mb-1">Ambiente</p>{registro.modalidade_tipo}</div>
        </footer>
      </div>

      {/* ÁREA SOCIAL */}
      <section className="max-w-4xl w-full bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-800">
        <h3 className="text-xl font-black uppercase italic text-yellow-400 mb-8 flex items-center gap-3">💬 Resenha PeixeBook</h3>
        <div className="space-y-6 mb-10">
          {comentarios.map(c => (
            <div key={c.id} className="bg-zinc-800/50 p-5 rounded-2xl border-l-4 border-yellow-500 shadow-md">
              <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-1">{c.nome_pescador}</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{c.texto}</p>
            </div>
          ))}
          {comentarios.length === 0 && <p className="text-zinc-600 italic text-sm text-center py-6 border border-dashed border-zinc-800 rounded-xl">Seja o primeiro a comentar o troféu!</p>}
        </div>

        {meuPerfil && !meuPerfil.primeiro_login ? (
          <div className="bg-zinc-800 p-6 rounded-2xl space-y-4 border border-zinc-700 shadow-inner">
            <textarea value={novoComentario} onChange={e => setNovoComentario(e.target.value)} placeholder="Mande seu comentário..." className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white text-sm h-24 resize-none outline-none focus:border-yellow-400" />
            <div className="flex justify-between items-center">
              <button onClick={() => { localStorage.removeItem('tr_sessao'); setMeuPerfil(null); }} className="text-[9px] text-zinc-500 font-black uppercase hover:text-red-500 transition-colors">Sair ({meuPerfil.nome_completo})</button>
              <button onClick={postarComentario} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs hover:scale-105 transition-transform">Postar Comentário</button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <button onClick={() => setLoginAberto(true)} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs hover:bg-yellow-400 transition-all shadow-xl">Fazer Login para Comentar</button>
          </div>
        )}
      </section>

      {/* MODAIS */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={loginPescador} className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic text-black mb-6">Membro do Clube</h2>
            <input name="nome" placeholder="Nome Completo" required className="w-full p-4 border-2 rounded-xl mb-4 text-black font-black uppercase text-xs outline-none focus:border-yellow-400" />
            <input name="senha" type="password" placeholder="Sua Senha" required className="w-full p-4 border-2 rounded-xl mb-6 text-black font-black text-xs outline-none focus:border-yellow-400" />
            <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase shadow-xl">Entrar na Resenha</button>
            <button type="button" onClick={() => setLoginAberto(false)} className="w-full text-zinc-400 font-black uppercase text-[9px] mt-4">Fechar</button>
          </form>
        </div>
      )}

      {showTrocaSenha && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <form onSubmit={atualizarSenha} className="bg-white p-8 rounded-3xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl text-black">
            <h2 className="text-2xl font-black uppercase italic text-black mb-2 text-center">Cadastrar Senha</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 text-center">Para comentar, crie sua senha de acesso.</p>
            <input type="password" placeholder="Nova Senha" required className="w-full p-4 border-2 rounded-xl mb-4 text-black font-bold outline-none" onChange={e => setNovaSenha(e.target.value)} />
            <input type="password" placeholder="Confirme a Senha" required className="w-full p-4 border-2 rounded-xl mb-6 text-black font-bold outline-none" onChange={e => setConfirmarSenha(e.target.value)} />
            <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black uppercase shadow-xl hover:bg-black hover:text-yellow-400">Salvar e Entrar</button>
          </form>
        </div>
      )}

      <button onClick={() => window.history.back()} className="fixed bottom-8 right-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-black uppercase italic text-sm shadow-2xl hover:bg-black hover:text-yellow-400 transition-all print:hidden z-50">← Voltar ao Ranking</button>
    </div>
  )
}
