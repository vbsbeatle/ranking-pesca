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
  const [tipoPescaria, setTipoPescaria] = useState('Embarcado')

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
    if (senhaInput === "suasenhaqui") {
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
        data_captura: form.data_captura.value,
        local_captura: form.local_captura.value, // NOVO CAMPO SALVO AQUI
        cidade: pSel.cidade,
        estado: "MG",
        modalidade_tipo: form.modalidade.value,
        tipo_pescaria: form.tipo_pescaria.value,
        tipo_embarcacao: form.tipo_pescaria.value === 'Embarcado' ? form.tipo_embarcacao.value : null,
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
        <form onSubmit={fazerLogin} className="bg-white p-8 rounded-2xl w-full max-w-sm border-t-8 border-yellow-400 shadow-2xl">
          <h2 className="text-xl font-black uppercase italic mb-6">Acesso Master</h2>
          <input type="password" placeholder="Senha" className="w-full p-4 border-2 rounded-xl mb-4 outline-none font-bold" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase hover:bg-gray-800">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
           <a href="/" className="text-[10px] font-black uppercase text-gray-400 italic">← Ver Site</a>
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
                <input name="nome" placeholder="Nome Completo" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="cidade" placeholder="Cidade Base" required className="w-full p-3 border-2 rounded font-bold" />
                <input name="foto" type="file" accept="image/*" required className="w-full text-xs" />
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-lg">Salvar Membro</button>
              </form>
            ) : (
              <form onSubmit={handleCaptura} className="space-y-4">
                <select name="pescador_id" required className="w-full p-3 border-2 rounded font-black bg-gray-50">
                  <option value="">Selecione o Pescador</option>
                  {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Data</label>
                    <input name="data_captura" type="date" required className="w-full p-3 border-2 rounded font-bold bg-gray-50 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Local (Rio/Lagoa)</label>
                    <input name="local_captura" placeholder="Ex: Rio Doce" required className="w-full p-3 border-2 rounded font-bold bg-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded font-black">
                    {Object.keys(especiesData).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <select name="subespecie" className="p-3 border-2 rounded font-black">
                    {especiesData[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input name="tamanho" type="number" step="0.1" placeholder="Tamanho (cm)" required className="p-3 border-2 rounded font-black" />
                  <select name="modalidade" className="p-3 border-2 rounded font-black text-sm">
                    <option value="Absoluto">Absoluto</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border-2 space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Modalidade de Pesca</label>
                    <select name="tipo_pescaria" value={tipoPescaria} onChange={(e) => setTipoPescaria(e.target.value)} className="w-full p-2 border rounded font-bold text-xs bg-white">
                      <option value="Embarcado">Embarcado</option>
                      <option value="Barranco">Barranco</option>
                    </select>
                  </div>
                  {tipoPescaria === 'Embarcado' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-yellow-600 uppercase ml-1">Embarcação</label>
                      <select name="tipo_embarcacao" className="w-full p-2 border-2 border-yellow-400 rounded font-bold text-xs bg-white">
                        <option value="Caiaque">Caiaque</option>
                        <option value="Barco">Barco</option>
                      </select>
                    </div>
                  )}
                  <input name="carretilha" placeholder="Carretilha/Molinete" className="w-full p-2 border rounded text-xs" />
                  <input name="vara" placeholder="Vara" className="w-full p-2 border rounded text-xs" />
                  <input name="isca" placeholder="Isca Utilizada" className="w-full p-2 border rounded text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 border rounded bg-gray-50">
                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Foto Peixe</p>
                    <input name="f_cap" type="file" required className="w-full text-[10px]" />
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Foto Medição</p>
                    <input name="f_med" type="file" required className="w-full text-[10px]" />
                  </div>
                </div>
                <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black uppercase rounded shadow-xl hover:bg-gray-800 transition-all">Lançar Recorde</button>
              </form>
            )}
            {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 uppercase animate-bounce">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
