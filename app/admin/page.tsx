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

  const fazerLogin = (e: any) => {
    e.preventDefault()
    // Substitua "suasenhaqui" pela sua senha real ou use a variável da Vercel
    if (senhaInput === "suasenhaqui") {
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
      setMsg('Captura registrada!')
      form.reset()
    } catch (err) { setMsg('Erro ao salvar') }
    setLoading(false)
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={fazerLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-yellow-400">
          <h2 className="text-2xl font-black uppercase italic mb-6">Área Restrita</h2>
          <input type="password" placeholder="Senha Master" className="w-full p-4 border-2 rounded-xl mb-4 outline-none" onChange={(e) => setSenhaInput(e.target.value)} />
          <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black uppercase">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        
        {/* LINKS DE NAVEGAÇÃO SUPERIOR */}
        <div className="flex justify-between items-center mb-6 px-2">
           <a href="/" className="text-[10px] font-black uppercase text-gray-400 hover:text-black italic">← Site Público</a>
           <a href="/admin/gerenciar" className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic hover:bg-black transition-all shadow-md">
             🗑️ Gerenciar/Excluir Dados
           </a>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-b-8 border-yellow-400">
          <div className="flex bg-black">
            <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font
