'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [logado, setLogado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [aba, setAba] = useState('pescador')
  const [pescadores, setPescadores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [grupo, setGrupo] = useState("Tucunaré")

  const especiesData: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  const carregarPescadores = async () => {
    const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (data) setPescadores(data)
  }

  const fazerLogin = (e: any) => {
    e.preventDefault()
    if (senhaInput === "TR234admin!") {
       setLogado(true)
       carregarPescadores()
    } else {
       alert("Senha Incorreta!")
    }
  }

  const handlePescador = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = e.target
      const file = form.foto.files[0]
      const fileName = `${Date.now()}-p`
      await supabase.storage.from('fotos-pesca').upload(fileName, file)
      const url = supabase.storage.from('fotos-pesca').getPublicUrl(fileName).data.publicUrl
      await supabase.from('pescadores').insert([{
        nome_completo: form.nome.value,
        cidade: form.cidade.value,
        url_foto: url
      }])
      setMsg('Pescador cadastrado!')
      form.reset()
      carregarPescadores()
    } catch (err) { setMsg('Erro no cadastro') }
    setLoading(false)
  }

  const handleCaptura = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = e.target
      const fCap = form.f_cap.files[0]
      const fMed = form.f_med.files[0]
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
        cidade: pSel.cidade,
        estado: "MG",
        modalidade_tipo: form.modalidade.value,
        tipo_pescaria: form.tipo_pescaria.value,
        carretilha: form.carretilha.value,
        vara: form.vara.value,
        isca: form.isca.value,
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        nome_cientifico: "Registro Oficial"
      }])
      setMsg('Captura registrada!')
      form.reset()
    } catch (err) { setMsg('Erro ao salvar') }
    setLoading(false)
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-black">
        <form onSubmit={fazerLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-xl font-black uppercase italic mb-6">Acesso Master</h2>
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-4 outline-none" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 text-black">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
           <a href="/" className="text-[10px] font-black uppercase text-gray-400 italic">← Site</a>
           <a href="/admin/gerenciar" className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic shadow-md">🗑️ Gerenciar</a>
        </div>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-b-8 border-yellow-400">
          <div className="flex bg-black">
            <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase text-xs ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>Membros</button>
            <button onClick={() => setAba('captura')} className={`flex-1 p-4 font-black uppercase text-xs ${aba === 'captura' ? 'bg-yellow-400 text-black' : 'text-white'}`}>Capturas</button>
          </div>
          <div className="p-8">
            {aba === 'pescador' ? (
              <form onSubmit={handlePescador} className="space-y-4">
                <input name="nome" placeholder="Nome" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="cidade" placeholder="Cidade" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="foto" type="file" accept="image/*" required className="w-full text-xs" />
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-lg">Salvar Pescador</button>
              </form>
            ) : (
              <form onSubmit={handleCaptura} className="space-y-4">
                <select name="pescador_id" required className="w-full p-3 border-2 rounded font-black">
                  <option value="">Pescador</option>
                  {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded font-black">
                    {Object.keys(especiesData).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <select name="subespecie" className="p-3 border-2 rounded font-black">
                    {especiesData[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="tamanho" type="number" step="0.1" placeholder="cm" required className="p-3 border-2 rounded font-black" />
                  <select name="modalidade" className="p-3 border-2 rounded font-black">
                    <option value="Absoluto">Absoluto</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border-2 space-y-2">
                  <select name="tipo_pescaria" className="w-full p-2 border rounded font-bold text-xs"><option value="Embarcado">Embarcado</option><option value="Barranco">Barranco</option></select>
                  <input name="carretilha" placeholder="Carretilha" className="w-full p-2 border rounded text-xs" />
                  <input name="vara" placeholder="Vara" className="w-full p-2 border rounded text-xs" />
                  <input name="isca" placeholder="Isca" className="w-full p-2 border rounded text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-gray-400">
                  <div>Foto Peixe <input name="f_cap" type="file" required className="w-full" /></div>
                  <div>Foto Medida <input name="f_med" type="file" required className="w-full" /></div>
                </div>
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-xl">Lançar Recorde</button>
              </form>
            )}
            {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 italic">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
