'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({ 
    nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' 
  })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (c) setCampeonatos(c)
    if (p) setPescadoresGerais(p)
  }

  // UPLOAD DA LOGO DO TORNEIO
  async function handleUploadLogo(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return
      const filePath = `campeonatos/${Math.random()}.jpg`
      const { error } = await supabase.storage.from('logos').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      setFormData({ ...formData, url_logo: data.publicUrl })
      alert("Logo carregada!")
    } catch (err: any) { alert(err.message) } finally { setUploading(false) }
  }

  // NOVO: UPLOAD DA FOTO DE PERFIL DO PESCADOR
  async function handleUploadPerfil(e: any, pescadorId: string) {
    try {
      const file = e.target.files[0]
      if (!file) return
      const filePath = `perfis/${pescadorId}-${Math.random()}.jpg`
      const { error } = await supabase.storage.from('perfis').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('perfis').getPublicUrl(filePath)
      const { error: updateErr } = await supabase.from('pescadores').update({ url_foto_perfil: data.publicUrl }).eq('id', pescadorId)
      if (updateErr) throw updateErr
      alert("Foto do pescador atualizada!")
      carregarDados()
    } catch (err: any) { alert("Erro no upload: " + err.message) }
  }

  async function handleSalvarCamp(e: any) {
    e.preventDefault()
    const dados = {
      nome: formData.nome, data_inicio: formData.inicio, data_fim: formData.fim,
      cota_min: parseInt(formData.cota_min), cota_max: parseInt(formData.cota_max),
      categorias: catsSelecionadas, url_logo: formData.url_logo
    }
    if (editandoId) { await supabase.from('campeonatos').update(dados).eq('id', editandoId); setEditandoId(null); }
    else { await supabase.from('campeonatos').insert([dados]) }
    setFormData({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })
    carregarDados()
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-black uppercase italic text-yellow-400 mb-8 border-l-4 border-yellow-400 pl-4">Gestão PeixeBook</h1>
      
      {/* MENU DE ABAS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setAba('novo_camp')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${aba === 'novo
