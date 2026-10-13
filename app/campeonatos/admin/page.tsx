'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminCampeonatos() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados do Dashboard
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [pescadoresGerais, setPescadoresGerais] = useState<any[]>([])
  const [capturasTorneio, setCapturasTorneio] = useState<any[]>([])
  const [inscritosTorneio, setInscritosTorneio] = useState<any[]>([])
  const [aba, setAba] = useState('novo_camp')
  const [catsSelecionadas, setCatsSelecionadas] = useState<string[]>(['Tucunaré'])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Estado para filtrar inscritos na aba de Inscrições
  const [torneioInscricaoSel, setTorneioInscricaoSel] = useState<string>('')

  const [formData, setFormData] = useState({ nome: '', inicio: '', fim: '', cota_min: '1', cota_max: '5', url_logo: '' })

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        carregarDados()
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (user) carregarDados()
  }, [aba])

  async function carregarDados() {
    const { data: c } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    const { data: p } = await supabase.from('pescadores').select('*').order('nome_completo')
    const { data: cap } = await supabase.from('capturas_torneio').select('*').order('created_at', { ascending: false })
    const { data: ins } = await supabase.from('campeonato_participantes').select('*')
    
    if (c) {
      setCampeonatos(c)
      const ativo = c.find(item => item.status !== 'finalizado')
      if (ativo && !torneioInscricaoSel) {
        setTorneioInscricaoSel(ativo.id)
      }
    }
    if (p) setPescadoresGerais(p)
    if (cap) setCapturasTorneio(cap)
    if (ins) setInscritosTorneio(ins)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) alert("Erro: " + error.message)
    else window.location.reload()
    setLoading(false)
  }

  // --- FUNÇÕES DE GESTÃO ---
  async function handleUploadLogo(e: any) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return
      const filePath = `campeonatos/${Math.random()}.jpg`
      await supabase.storage.from('logos').upload(filePath, file)
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      setFormData({ ...formData, url_logo: data.publicUrl })
      alert("Logo carregada!")
    } catch (err: any) { 
      alert(err.message) 
    } finally { 
      setUploading(false) 
    }
  }

  async function handleUploadPerfil(e: any, pescadorId: string) {
    try {
      const file = e.target.files[0]
      if (!file) return
      const fileName = `${Date.now()}-p`
      await supabase.storage.from('fotos-pesca').upload(fileName, file)
      const { data } = supabase.storage.from('fotos-pesca').getPublicUrl(fileName)
      await supabase.from('pescadores').update({ url_foto: data.publicUrl }).eq('id', pescadorId)
      alert("Foto do pescador atualizada!")
      carregarDados()
    } catch (err: any) { 
      alert("Erro: " + err.message) 
    }
  }

  async function handleSalvarCamp(e: any
