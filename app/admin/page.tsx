'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [aba, setAba] = useState('pescador') // 'pescador' ou 'captura'
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

  useEffect(() => {
    carregarPescadores()
  }, [])

  async function carregarPescadores() {
    const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
    if (data) setPescadores(data)
  }

  // FUNÇÃO 1: CADASTRAR PESCADOR
  async function handlePescador(e: any) {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const file = form.foto.files[0]
    
    try {
      const fileName = `${Date.now()}-perfil`
      await supabase.storage.from('fotos-pesca').upload(fileName, file)
      const urlFoto = supabase.storage.from('fotos-pesca').getPublicUrl(fileName).data.publicUrl

      await supabase.from('pescadores').insert([{
        nome_completo: form.nome.value,
        cidade: form.cidade.value,
        url_foto: urlFoto
      }])
      setMsg('Pescador cadastrado!')
      form.reset()
      carregarPescadores()
    } catch (err) { setMsg('Erro ao cadastrar') }
    setLoading(false)
  }

  // FUNÇÃO 2: CADASTRAR CAPTURA
  async function handleCaptura(e: any) {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    try {
      // Upload Fotos
      const fCap = form.f_cap.files[0]
      const fMed = form.f_med.files[0]
      const nCap = `${Date.now()}-c`; const nMed = `${Date.now()}-m`
      await supabase.storage.from('fotos-pesca').upload(nCap, fCap)
      await supabase.storage.from('fotos-pesca').upload(nMed, fMed)
      
      const urlCap = supabase.storage.from('fotos-pesca').getPublicUrl(nCap).data.publicUrl
      const urlMed = supabase.storage.from('fotos-pesca').getPublicUrl(nMed).data.publicUrl

      // Busca dados do pescador selecionado para manter compatibilidade
      const pSel = pescadores.find(p => p.id === form.pescador_id.value)

      await supabase.from('recordes').insert([{
        pescador_id: form.pescador_id.value,
        nome_pescador: pSel.nome_completo, // Mantido para o ranking antigo funcionar
        grupo_especie: grupo,
        subespecie: form.subespecie.value,
        tamanho_cm: parseFloat(form.tamanho.value),
        cidade: pSel.cidade,
        estado: "MG", // Pode ajustar
        modalidade_tipo: form.modalidade.value,
        modalidade_ambiente: "Rio/Lago",
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
    } catch (err) { setMsg('Erro no registro') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border-b-8 border-yellow-400">
        <div className="flex bg-black">
          <button onClick={() => setAba('pescador')} className={`flex-1 p-4 font-black uppercase italic ${aba === 'pescador' ? 'bg-yellow-400 text-black' : 'text-white'}`}>1. Novo Pescador</button>
          <button onClick={() => setAba('captura')} className={`flex-1 p-4 font-black uppercase italic ${aba === 'captura' ? 'bg-yellow-400 text-black' : 'text-white'}`}>2. Nova Captura</button>
        </div>

        <div className="p-6">
          {aba === 'pescador' ? (
            <form onSubmit={handlePescador} className="space-y-4">
              <input name="nome" placeholder="Nome Completo" required className="w-full p-3 border-2 rounded" />
              <input name="cidade" placeholder="Cidade/Estado" required className="w-full p-3 border-2 rounded" />
              <label className="block text-xs font-bold text-gray-400 uppercase">Foto do Pescador</label>
              <input name="foto" type="file" accept="image/*" required className="w-full" />
              <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-bold rounded uppercase">{loading ? 'Salvando...' : 'Cadastrar Membro'}</button>
            </form>
          ) : (
            <form onSubmit={handleCaptura} className="space-y-4">
              <select name="pescador_id" required className="w-full p-3 border-2 rounded font-bold">
                <option value="">Selecione o Pescador</option>
                {pescadores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              
              <div className="grid grid-cols-2 gap-4">
                <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-3 border-2 rounded">
                  {Object.keys(especiesData).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <select name="subespecie" className="p-3 border-2 rounded">
                  {especiesData[grupo].map((s:any) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="tamanho" type="number" step="0.1" placeholder="Tamanho (cm)" required className="p-3 border-2 rounded" />
                <select name="modalidade" className="p-3 border-2 rounded">
                  <option value="Absoluto">Absoluto</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed space-y-3">
                <h3 className="font-bold text-xs uppercase text-gray-400">Equipamento e Estilo</h3>
                <select name="tipo_pescaria" className="w-full p-2 border rounded">
                  <option value="Barranco">Barranco</option>
                  <option value="Embarcado">Embarcado</option>
                </select>
                <input name="carretilha" placeholder="Carretilha" className="w-full p-2 border rounded" />
                <input name="vara" placeholder="Vara" className="w-full p-2 border rounded" />
                <input name="isca" placeholder="Isca Utilizada" className="w-full p-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-gray-400">
                <div>Foto Peixe <input name="f_cap" type="file" required className="mt-1" /></div>
                <div>Foto Medida <input name="f_med" type="file" required className="mt-1" /></div>
              </div>

              <button disabled={loading} className="w-full bg-black text-yellow-400 p-4 font-bold rounded uppercase">{loading ? 'Registrando...' : 'Salvar Captura'}</button>
            </form>
          )}
          {msg && <p className="mt-4 text-center font-bold text-sm">{msg}</p>}
        </div>
      </div>
    </div>
  )
}
