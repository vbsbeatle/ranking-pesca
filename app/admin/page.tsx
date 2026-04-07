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

  const especiesData: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }
  const [grupo, setGrupo] = useState("Tucunaré")

  // Verifica a senha (usando a variável que você definiu na Vercel)
  const fazerLogin = (e: any) => {
    e.preventDefault()
    // A Vercel injeta a variável, mas para segurança no navegador 
    // vamos comparar com o que você definiu. 
    // NOTA: Para um sistema profissional usaríamos Auth do Supabase, 
    // mas para o grupo, esta "tranca" de variável de ambiente funciona bem!
    if (senhaInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || senhaInput === "suasenhaqui") {
       setLogado(true)
       carregarPescadores()
    } else {
       alert("Senha Incorreta!")
    }
  }

  async function carregarPescadores() {
    const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (data) setPescadores(data)
  }

  async function handlePescador(e: any) {
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
        url_foto: url
      }])
      setMsg('Pescador cadastrado!')
      form.reset()
      carregarPescadores()
    } catch (err) { setMsg('Erro no cadastro') }
    setLoading(false)
  }

  async function handleCaptura(e: any) {
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
        cidade: pSel.cidade,
        estado: "MG",
        modalidade_tipo: form.modalidade.value,
        tipo_pescaria: form.tipo_pescaria.value,
        carretilha: form.carretilha.value,
        vara: form.vara.value,
        isca: form.isca.value,
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        nome_cientifico: "Registro"
      }])
      setMsg('Captura registrada com sucesso!')
      form.reset()
    } catch (err) { setMsg('Erro ao salvar captura') }
    setLoading(false)
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={fazerLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-2xl font-black uppercase italic mb-6">Acesso Restrito</h2>
          <input 
            type="password" 
            placeholder="Digite a Senha Master" 
            className="w-full p-4 border-2 rounded-xl mb-4 outline-none focus:border-yellow-400"
            onChange={(e) => setSenhaInput(e.target.value)}
          />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase hover:bg-gray-800 transition-all">
            Entrar no Painel
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border-b-8 border-yellow-400">
        <div className="flex bg-black">
          <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase italic ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>1. Membros</button>
          <button onClick={() => setAba('captura')} className={`flex-1 p-4 font-black uppercase italic ${aba === 'captura' ? 'bg-yellow-400 text-black' : 'text-white'}`}>2. Capturas</button>
        </div>

        <div className="p-6">
          {aba === 'pescador' ? (
            <form onSubmit={handlePescador} className="space-y-4">
              <input name="nome" placeholder="Nome Completo" required className="w-full p-3 border-2 rounded" />
              <input name="cidade" placeholder="Cidade (Ex: Gov. Valadares)" required className="w-full p-3 border-2 rounded" />
              <label className="block text-[10px] font-black text-gray-400 uppercase">Foto do Perfil</label>
              <input name="foto" type="file" accept="image/*" required className="w-full text-xs" />
              <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-bold rounded uppercase shadow-lg">
                {loading ? 'Salvando...' : 'Cadastrar Pescador'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCaptura} className="space-y-4">
              <select name="pescador_id" required className="w-full p-3 border-2 rounded font-bold bg-gray-50">
                <option value="">Quem pescou?</option>
                {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              
              <div className="grid grid-cols-2 gap-4">
                <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded font-bold">
                  {Object.keys(especiesData).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <select name="subespecie" className="p-3 border-2 rounded font-bold">
                  {especiesData[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="tamanho" type="number" step="0.1" placeholder="Tamanho (cm)" required className="p-3 border-2 rounded font-bold" />
                <select name="modalidade" className="p-3 border-2 rounded font-bold">
                  <option value="Absoluto">Absoluto</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed space-y-3">
                <h3 className="font-black text-[10px] uppercase text-gray-400">Equipamento Utilizado</h3>
                <select name="tipo_pescaria" className="w-full p-2 border rounded text-sm font-bold">
                  <option value="Barranco">Barranco</option>
                  <option value="Embarcado">Embarcado</option>
                </select>
                <input name="carretilha" placeholder="Carretilha / Molinete" className="w-full p-2 border rounded text-sm" />
                <input name="vara" placeholder="Vara" className="w-full p-2 border rounded text-sm" />
                <input name="isca" placeholder="Isca" className="w-full p-2 border rounded text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-gray-400">
                <div>Foto Peixe <input name="f_cap" type="file" required className="mt-1 w-full" /></div>
                <div>Foto Medida <input name="f_med" type="file" required className="mt-1 w-full" /></div>
              </div>

              <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-black rounded uppercase shadow-xl">
                {loading ? 'Processando...' : 'Lançar no Ranking'}
              </button>
            </form>
          )}
          {msg && <p className="mt-4 text-center font-black text-sm text-yellow-600 uppercase italic animate-bounce">{msg}</p>}
        </div>
      </div>
    </div>
  )
}
