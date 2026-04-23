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

  // 1. Monitorar Autenticação
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

  // 2. Funções de Acesso
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      alert("Erro: " + error.message)
    } else {
      window.location.reload()
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  // 3. Cadastrar Pescador
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
        url_foto: url 
      }])
      
      setMsg('Pescador salvo com sucesso!')
      form.reset()
      const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (data) setPescadores(data)
    } catch (err) {
      setMsg('Erro ao cadastrar pescador')
    }
    setLoading(false)
  }

  // 4. Cadastrar Captura
  const handleCaptura = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    try {
      const fCap = form.f_cap.files[0]
      const fMed = form.f_med.files[0]
      const nCap = `${Date.now()}-c`
      const nMed = `${Date.now()}-m`
      
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
        modal
