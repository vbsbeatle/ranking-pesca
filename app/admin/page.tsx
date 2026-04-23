'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Verifica se já existe uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    checkUser()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    
    if (error) {
      alert("Erro no login: " + error.message)
    } else {
      window.location.reload() // Recarrega para validar o estado do usuário
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  // TELA DE LOGIN (Se não estiver autenticado)
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-2xl font-black uppercase italic mb-6 text-black text-center">Acesso Oficial TR</h2>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="E-mail Admin" 
              className="w-full p-4 border-2 rounded-xl outline-none font-bold text-black" 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Senha" 
              className="w-full p-4 border-2 rounded-xl outline-none font-bold text-black" 
              onChange={(e) => setSenha(e.target.value)} 
              required
            />
            <button 
              disabled={loading}
              className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase hover:bg-gray-800 transition-all"
            >
              {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // SE ESTIVER LOGADO, MOSTRA O FORMULÁRIO DE CADASTRO (O código que já tínhamos)
  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 text-black">
       <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-red-600 bg-white px-3 py-1 rounded shadow">Sair / Logout</button>
            <a href="/admin/gerenciar" className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic shadow-md">Ir para Gerenciamento</a>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-8 border-yellow-400 text-center">
            <h2 className="text-xl font-black uppercase italic">Bem-vindo, Capitão!</h2>
            <p className="text-xs text-gray-400 mt-1">O painel está liberado para novos registros.</p>
            {/* Aqui você pode reinserir seus campos de formulário que já funcionam */}
          </div>
       </div>
    </div>
  )
}
