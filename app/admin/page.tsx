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

  async function uploadFoto(file: File) {
    const name = `${Date.now()}-${file.name}`
    await supabase.storage.from('fotos-pesca').upload(name, file)
    return supabase.storage.from('fotos-pesca').getPublicUrl(name).data.publicUrl
  }

  const handlePescador = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = await uploadFoto(e.target.foto.files[0])
      await supabase.from('pescadores').insert([{ 
        nome_completo: e.target.nome.value, 
        cidade: e.target.cidade.value, 
        url_foto: url 
      }])
      setMsg('Membro salvo!'); e.target.reset()
      const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (data) setPescadores(data)
    } catch (err) { setMsg('Erro ao salvar') }
    setLoading(false)
  }

  const handleCaptura = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const urlCap = await uploadFoto(e.target.f_cap.files[0])
      const urlMed = await uploadFoto(e.target.f_med.files[0])
      const p = pescadores.find(x => x.id === e.target.pescador_id.value)

      await supabase.from('recordes').insert([{
        pescador_id: p.id,
        nome_pescador: p.nome_completo,
        grupo_especie: grupo,
        subespecie: e.target.subespecie.value,
        tamanho_cm: parseFloat(e.target.tamanho.value),
        data_captura: e.target.data_captura.value,
        local_captura: e.target.local_captura.value,
        cidade: p.cidade,
        estado: "MG",
        modalidade_tipo: e.target.modalidade.value,
        tipo_pescaria: e.target.tipo_pescaria.value,
        carretilha: e.target.carretilha.value,
        vara: e.target.vara.value,
        isca: e.target.isca.value,
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        nome_cientifico: "Registro Oficial TR"
      }])
      setMsg('Sucesso! Captura registrada.'); e.target.reset()
    } catch (err) { setMsg('Erro no registro') }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
          <h2 className="text-xl font-black uppercase italic mb-6 text-center text-black">Acesso Restrito TR</h2>
          <input type="email" placeholder="E-mail" className="w-full p-4 border-2 rounded-xl mb-4 font-bold text-black" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-6 font-bold text-black" onChange={(e) => setSenha(e.target.value)} required />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase shadow-lg">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 text-black">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase text-gray-400">Sair</button>
           <a href="/admin/gerenciar" className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase italic shadow-md">Gerenciar Dados</a>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-b-8 border-yellow-400">
          <div className="flex bg-black">
            <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase text-xs ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>1. Novo Pescador</button>
            <button onClick={() => setAba('captura')} className={`flex-1 p-4 font-black uppercase text-xs ${aba === 'captura' ? 'bg-yellow-400 text-black' : 'text-white'}`}>2. Nova Captura</button>
          </div>

          <div className="p-8">
            {aba === 'pescador' ? (
              <form onSubmit={handlePescador} className="space-y-4">
                <input name="nome" placeholder="Nome Completo" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="cidade" placeholder="Cidade" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="foto" type="file" accept="image/*" required className="w-full text-xs" />
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded">{loading ? 'Salvando...' : 'Salvar Membro'}</button>
              </form>
            ) : (
              <form onSubmit={handleCaptura} className="space-y-4">
                <select name="pescador_id" required className="w-full p-3 border-2 rounded font-black bg-gray-50">
                  <option value="">Selecione o Pescador</option>
                  {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input name="data_captura" type="date" required className="p-3 border-2 rounded font-bold text-xs" />
                  <input name="local_captura" placeholder="Local" required className="p-3 border-2 rounded font-bold text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded font-black text-xs">
                    {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <select name="subespecie" className="p-3 border-2 rounded font-black text-xs">
                    {subMap[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="tamanho" type="number" step="0.1" placeholder="Tamanho cm" required className="p-3 border-2 rounded font-black" />
                  <select name="modalidade" className="p-3 border-2 rounded font-black text-xs">
                    <option value="Absoluto">Absoluto</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border-2 space-y-2">
                  <select name="tipo_pescaria" className="w-full p-2 border rounded font-bold text-xs"><option value="Embarcado">Embarcado</option><option value="Barranco">Barranco</option></select>
                  <input name="carretilha" placeholder="Carretilha/Molinete" className="w-full p-2 border rounded text-xs" />
                  <input name="vara" placeholder="Vara" className="w-full p-2 border rounded text-xs" />
                  <input name="isca" placeholder="Isca" className="w-full p-2 border rounded text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-gray-400 text-center">
                  <div>Foto Peixe <input name="f_cap" type="file" required className="w-full mt-1" /></div>
                  <div>Foto Medida <input name="f_med" type="file" required className="w-full mt-1" /></div>
                </div>
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-xl">{loading ? 'Enviando...' : 'Lançar Recorde'}</button>
              </form>
            )}
            {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 uppercase italic animate-bounce">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
