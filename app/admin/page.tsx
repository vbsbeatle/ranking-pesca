'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [aba, setAba] = useState('pescador')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [grupo, setGrupo] = useState("Tucunaré")

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
        if (p) setPescadores(p)
      }
    }
    checkUser()
  }, [])

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
        senha: form.senha_membro.value, // NOVA COLUNA
        url_foto: url 
      }])
      
      setMsg('Membro salvo com sucesso!'); form.reset()
      const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (data) setPescadores(data)
    } catch (err) { setMsg('Erro ao cadastrar') }
    setLoading(false)
  }

  const handleCaptura = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    try {
      const fCap = form.f_cap.files[0]; const fMed = form.f_med.files[0]
      const nCap = `${Date.now()}-c`; const nMed = `${Date.now()}-m`
      await supabase.storage.from('fotos-pesca').upload(nCap, fCap)
      await supabase.storage.from('fotos-pesca').upload(nMed, fMed)
      const urlCap = supabase.storage.from('fotos-pesca').getPublicUrl(nCap).data.publicUrl
      const urlMed = supabase.storage.from('fotos-pesca').getPublicUrl(nMed).data.publicUrl
      const pSel = pescadores.find(p => p.id === form.pescador_id.value)

      await supabase.from('recordes').insert([{
        pescador_id: form.pescador_id.value,
        nome_pescador: pSel.nome_completo,
        grupo_especie: grupo,
        subespecie: form.subespecie.value,
        tamanho_cm: parseFloat(form.tamanho.value),
        data_captura: form.data_captura.value,
        local_captura: form.local_captura.value,
        cidade: pSel.cidade,
        estado: "MG",
        modalidade_tipo: form.modalidade.value,
        tipo_pescaria: form.tipo_pescaria.value,
        carretilha: form.carretilha.value,
        vara: form.vara.value,
        isca: form.isca.value,
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        nome_cientifico: "Registro Oficial TR"
      }])
      setMsg('Captura registrada!'); form.reset()
    } catch (err) { setMsg('Erro ao salvar') }
    setLoading(false)
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
           <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase text-gray-400">Sair / Logout</button>
           <a href="/admin/gerenciar" className="bg-red-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase italic shadow-lg hover:bg-black transition-all">🗑️ Gerenciar Recordes</a>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-b-8 border-yellow-400">
          <div className="flex bg-black">
            <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase italic text-xs ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>1. Novo Pescador</button>
            <button onClick={() => setAba('captura')} className={`flex-1 p-4 font-black uppercase italic text-xs ${aba === 'captura' ? 'bg-yellow-400 text-black' : 'text-white'}`}>2. Nova Captura</button>
          </div>

          <div className="p-8">
            {aba === 'pescador' ? (
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
            ) : (
              <form onSubmit={handleCaptura} className="space-y-4">
                <select name="pescador_id" required className="w-full p-3 border-2 rounded font-black bg-gray-50 text-black">
                  <option value="">Selecione o Pescador</option>
                  {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input name="data_captura" type="date" required className="w-full p-3 border-2 rounded font-bold text-xs text-black" />
                  <input name="local_captura" placeholder="Local (Rio/Lagoa)" required className="w-full p-3 border-2 rounded font-bold text-xs text-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded font-black text-xs text-black">
                    {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <select name="subespecie" className="p-3 border-2 rounded font-black text-xs text-black">
                    {subMap[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="tamanho" type="number" step="0.1" placeholder="Medida (cm)" required className="p-3 border-2 rounded font-black text-black" />
                  <select name="modalidade" className="p-3 border-2 rounded font-black text-xs text-black">
                    <option value="Absoluto">Absoluto</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border-2 space-y-2">
                  <select name="tipo_pescaria" className="w-full p-2 border rounded font-bold text-xs text-black"><option value="Embarcado">Embarcado</option><option value="Barranco">Barranco</option></select>
                  <input name="carretilha" placeholder="Carretilha/Molinete" className="w-full p-2 border rounded text-xs text-black" />
                  <input name="vara" placeholder="Vara" className="w-full p-2 border rounded text-xs text-black" />
                  <input name="isca" placeholder="Isca Utilizada" className="w-full p-2 border rounded text-xs text-black" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-gray-400 text-center">
                  <div>Foto Peixe <input name="f_cap" type="file" required className="w-full mt-1" /></div>
                  <div>Foto Medida <input name="f_med" type="file" required className="w-full mt-1" /></div>
                </div>
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-xl">Registrar Captura</button>
              </form>
            )}
            {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 uppercase italic animate-bounce">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
