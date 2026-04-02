'use client'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Sua lista oficial de espécies e subespécies
  const especiesData: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  const [grupo, setGrupo] = useState("Tucunaré")

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setMsg('Processando recorde...')

    const form = e.target
    const fileCaptura = form.foto_captura.files[0]
    const fileMedicao = form.foto_medicao.files[0]

    try {
      // 1. Upload da Foto de Captura
      const nameCap = `${Date.now()}-captura`
      const { data: dataCap, error: errCap } = await supabase.storage.from('fotos-pesca').upload(nameCap, fileCaptura)
      if (errCap) throw errCap

      // 2. Upload da Foto de Medição
      const nameMed = `${Date.now()}-medicao`
      const { data: dataMed, error: errMed } = await supabase.storage.from('fotos-pesca').upload(nameMed, fileMedicao)
      if (errMed) throw errMed

      // 3. Pegar as URLs públicas das fotos
      const urlCap = supabase.storage.from('fotos-pesca').getPublicUrl(nameCap).data.publicUrl
      const urlMed = supabase.storage.from('fotos-pesca').getPublicUrl(nameMed).data.publicUrl

      // 4. Salvar os dados no Banco
      const { error: errDb } = await supabase.from('recordes').insert([{
        nome_pescador: form.pescador.value,
        grupo_especie: grupo,
        subespecie: form.subespecie.value,
        cidade: form.cidade.value,
        estado: form.estado.value,
        tamanho_cm: parseFloat(form.tamanho.value),
        modalidade_tipo: form.modalidade_tipo.value,
        modalidade_ambiente: form.ambiente.value,
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        nome_cientifico: "Registro Oficial" // Podemos refinar isso depois
      }])

      if (errDb) throw errDb

      setMsg('✅ RECORDE REGISTRADO COM SUCESSO!')
      form.reset()
    } catch (error: any) {
      setMsg('❌ Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border-b-8 border-yellow-400">
        <header className="bg-black text-yellow-400 p-6 flex justify-between items-center">
          <h1 className="text-xl font-black uppercase italic">Novo Recorde</h1>
          <span className="text-xs bg-yellow-400 text-black px-2 py-1 font-bold rounded">ADMIN</span>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="pescador" placeholder="Nome do Pescador" required className="p-2 border-2 rounded outline-none focus:border-yellow-400" />
            <input name="tamanho" type="number" step="0.1" placeholder="Tamanho (cm)" required className="p-2 border-2 rounded outline-none focus:border-yellow-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="p-2 border-2 rounded">
              {Object.keys(especiesData).map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select name="subespecie" className="p-2 border-2 rounded">
              {especiesData[grupo].map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="cidade" placeholder="Cidade" required className="p-2 border-2 rounded" />
            <input name="estado" placeholder="Estado (Ex: AM)" required className="p-2 border-2 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="modalidade_tipo" className="p-2 border-2 rounded">
              <option value="Absoluto">Absoluto</option>
              <option value="Privado">Privado</option>
            </select>
            <select name="ambiente" className="p-2 border-2 rounded">
              <option value="Rios">Rios</option>
              <option value="Lagos e Represas">Lagos e Represas</option>
              <option value="Pesqueiros">Pesqueiros</option>
              <option value="Açudes/Fazendas">Açudes/Fazendas</option>
            </select>
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="text-xs font-bold text-gray-500 uppercase">Foto da Captura</label>
            <input name="foto_captura" type="file" accept="image/*" required className="w-full text-sm" />
            
            <label className="text-xs font-bold text-gray-500 uppercase block mt-2">Foto da Medição</label>
            <input name="foto_medicao" type="file" accept="image/*" required className="w-full text-sm" />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-black text-yellow-400 font-black py-4 rounded uppercase hover:bg-gray-900 transition"
          >
            {loading ? 'ENVIANDO...' : 'REGISTRAR RECORDE'}
          </button>

          {msg && <div className="p-3 bg-gray-100 text-center font-bold text-sm border-2 border-black">{msg}</div>}
        </form>
      </div>
    </div>
  )
}
