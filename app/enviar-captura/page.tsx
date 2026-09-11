'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EnviarCaptura() {
  const [pescadores, setPescadores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msgSuccess, setMsgSuccess] = useState(false)
  const [grupo, setGrupo] = useState("Tucunaré")
  const [tipoPescaria, setTipoPescaria] = useState("Barranco")

  const subMap: any = {
    "Tucunaré": ["Açu", "Paca", "Azul", "Amarelo", "Borboleta", "Popoca", "Pinima", "Royal", "Xingu", "Tapajós", "Hibrido"],
    "Dourado": ["Dourado comum", "Tabarana"],
    "Traíra": ["Comum", "do Sudeste", "Intermediária", "Curupira", "Azul/do Sul", "Cazumbá"],
    "Trairão": ["Comum", "Macrophthalmus", "Aimara"]
  }

  const diretores = [
    { nome: "Farid Neto", fone: "(033)99197-4444", link: "https://wa.me/5533991974444?text=Olá%20Farid,%20estou%20enviando%20o%20vídeo%20de%20soltura%20da%20minha%20captura%20cadastrada%20no%20PeixeBook." },
    { nome: "Victor Sabbagh", fone: "(033)99929-3377", link: "https://wa.me/5533999293377?text=Olá%20Victor,%20estou%20enviando%20o%20vídeo%20de%20soltura%20da%20minha%20captura%20cadastrada%20no%20PeixeBook." },
    { nome: "Rildo Flankin", fone: "(033)99919-5522", link: "https://wa.me/5533999195522?text=Olá%20Rildo,%20estou%20enviando%20o%20vídeo%20de%20soltura%20da%20minha%20captura%20cadastrada%20no%20PeixeBook." },
    { nome: "Douglas Gomes", fone: "(033)99107-0656", link: "https://wa.me/5533991070656?text=Olá%20Douglas,%20estou%20enviando%20o%20vídeo%20de%20soltura%20da%20minha%20captura%20cadastrada%20no%20PeixeBook." }
  ]

  useEffect(() => {
    async function carregarPescadores() {
      const { data } = await supabase.from('pescadores').select('*').order('nome_completo')
      if (data) setPescadores(data)
    }
    carregarPescadores()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsgSuccess(false)
    const form = e.currentTarget

    try {
      const pescadorId = form.pescador_id.value
      const pSel = pescadores.find(p => p.id === pescadorId)
      
      const fileCap = (form.elements.namedItem('f_cap') as HTMLInputElement).files?.[0]
      const fileMed = (form.elements.namedItem('f_med') as HTMLInputElement).files?.[0]

      if (!fileCap || !fileMed) {
        alert("Por favor, envie as duas fotos obrigatórias.")
        setLoading(false)
        return
      }

      // Upload Foto Peixe + Pescador
      const nCap = `pendentes/${Date.now()}-cap.jpg`
      const { error: errCap } = await supabase.storage.from('fotos-pesca').upload(nCap, fileCap)
      if (errCap) throw errCap
      const urlCap = supabase.storage.from('fotos-pesca').getPublicUrl(nCap).data.publicUrl

      // Upload Foto Régua
      const nMed = `pendentes/${Date.now()}-med.jpg`
      const { error: errMed } = await supabase.storage.from('fotos-pesca').upload(nMed, fileMed)
      if (errMed) throw errMed
      const urlMed = supabase.storage.from('fotos-pesca').getPublicUrl(nMed).data.publicUrl

      const tipoEmbarcacao = tipoPescaria === 'Embarcado' ? form.tipo_embarcacao.value : ''
      const modalidadeFinal = tipoEmbarcacao ? `${tipoPescaria} (${tipoEmbarcacao})` : tipoPescaria

      // Insere com status 'pendente'
      const { error: insertErr } = await supabase.from('recordes').insert([{
        pescador_id: pSel.id,
        nome_pescador: pSel.nome_completo,
        data_captura: form.data_captura.value,
        local_captura: form.local_captura.value,
        cidade: pSel.cidade || 'Não informada',
        estado: 'MG',
        grupo_especie: grupo,
        subespecie: form.subespecie.value,
        tamanho_cm: parseFloat(form.tamanho.value),
        url_foto_captura: urlCap,
        url_foto_medicao: urlMed,
        modalidade_tipo: form.categoria.value,
        tipo_pescaria: modalidadeFinal,
        vara: form.vara.value,
        carretilha: form.carretilha.value,
        isca: form.isca.value,
        nome_cientifico: "Registro Oficial TR",
        status: 'pendente'
      }])

      if (insertErr) throw insertErr

      setMsgSuccess(true)
      form.reset()
      setGrupo("Tucunaré")
      setTipoPescaria("Barranco")
    } catch (err: any) {
      alert("Erro ao enviar captura: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase italic text-yellow-400">Registrar Captura</h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">Envie seu troféu para análise da arbitragem</p>
        </header>

        {/* QUADRO INFORMATIVO DE VÍDEO DE SOLTURA E WHATSAPP */}
        <div className="bg-zinc-900 border-2 border-yellow-400 rounded-3xl p-6 mb-8 shadow-2xl">
          <p className="text-xs md:text-sm font-bold text-zinc-200 leading-relaxed mb-4 text-center">
             Enviei o vídeo com a soltura do peixe via WhatsApp para um dos diretores do <span className="text-yellow-400 font-black">Trilhas do Rio</span> para que sua captura seja aprovada:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {diretores.map(d => (
              <a 
                key={d.nome} 
                href={d.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-zinc-800 hover:bg-green-600 hover:text-white p-3 rounded-2xl border border-zinc-700 flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-[10px] font-black uppercase text-yellow-400 group-hover:text-white">{d.nome}</p>
                  <p className="text-xs font-bold">{d.fone}</p>
                </div>
                <span className="text-lg">💬</span>
              </a>
            ))}
          </div>
        </div>

        {msgSuccess && (
          <div className="bg-yellow-400 text-black p-6 rounded-3xl mb-8 font-black text-center uppercase italic border-4 border-white animate-bounce shadow-2xl">
            🏆 Captura enviada com sucesso! Aguarde a aprovação do Admin para figurar no ranking.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border border-zinc-800 space-y-6 text-black">
          {/* PESCADOR */}
          <div>
            <label className="block text-white text-[10px] font-black uppercase mb-2">Pescador(a) *</label>
            <select name="pescador_id" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none">
              <option value="">Selecione seu nome na lista...</option>
              {pescadores.map(p => (
                <option key={p.id} value={p.id}>{p.nome_completo}</option>
              ))}
            </select>
          </div>

          {/* DATA E LOCAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-[10px] font-black uppercase mb-2">Data da Captura *</label>
              <input name="data_captura" type="date" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none" />
            </div>
            <div>
              <label className="block text-white text-[10px] font-black uppercase mb-2">Local da Captura *</label>
              <input name="local_captura" placeholder="Ex: Rio Doce / Represa" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none" />
            </div>
          </div>

          {/* ESPÉCIE E SUBESPÉCIE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-[10px] font-black uppercase mb-2">Espécie *</label>
              <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="w-full p-4 rounded-2xl font-bold bg-white outline-none">
                {Object.keys(subMap).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white text-[10px] font-black uppercase mb-2">Subespécie *</label>
              <select name="subespecie" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none">
                {subMap[grupo].map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* MEDIÇÃO EM CM (0.5 em 0.5) */}
          <div>
            <label className="block text-white text-[10px] font-black uppercase mb-2">Medição em CM (Ex: 45.0, 45.5, 46.0) *</label>
            <input 
              name="tamanho" 
              type="number" 
              step="0.5" 
              placeholder="00.0" 
              required 
              className="w-full p-4 rounded-2xl font-bold bg-white outline-none text-xl text-yellow-600" 
            />
          </div>

          {/* FOTO DO PESCADOR COM PEIXE */}
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <label className="block text-white text-[10px] font-black uppercase mb-2">Foto do Pescador com o Peixe *</label>
            <input name="f_cap" type="file" accept="image/*" required className="w-full text-xs text-zinc-300" />
          </div>

          {/* FOTO NA RÉGUA */}
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <label className="block text-white text-[10px] font-black uppercase mb-1">Foto do Peixe na Régua *</label>
            <p className="text-[10px] text-yellow-400 font-bold mb-3 italic">
              ⚠️ Observação: A foto deve conter o peixe inteiro sobre a régua, com boca fechada encostada no batente da régua e rabo espalmado.
            </p>
            <input name="f_med" type="file" accept="image/*" required className="w-full text-xs text-zinc-300" />
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="block text-white text-[10px] font-black uppercase mb-2">Categoria *</label>
            <select name="categoria" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none">
              <option value="Absoluto">Absoluto</option>
              <option value="Privado">Privado</option>
            </select>
          </div>

          {/* TIPO DE PESCARIA + EMBARCAÇÃO CONDICIONAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-[10px] font-black uppercase mb-2">Tipo de Pescaria *</label>
              <select 
                value={tipoPescaria} 
                onChange={(e) => setTipoPescaria(e.target.value)} 
                className="w-full p-4 rounded-2xl font-bold bg-white outline-none"
              >
                <option value="Barranco">Barranco</option>
                <option value="Embarcado">Embarcado</option>
              </select>
            </div>

            {tipoPescaria === 'Embarcado' && (
              <div>
                <label className="block text-white text-[10px] font-black uppercase mb-2">Tipo de Embarcação *</label>
                <select name="tipo_embarcacao" required className="w-full p-4 rounded-2xl font-bold bg-white outline-none">
                  <option value="Barco">Barco</option>
                  <option value="Caiaque">Caiaque</option>
                </select>
              </div>
            )}
          </div>

          {/* EQUIPAMENTOS */}
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700 space-y-4">
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">Equipamentos Utilizados</p>
            <div>
              <label className="block text-zinc-400 text-[9px] font-black uppercase mb-1">Vara (Modelo e Libragem) *</label>
              <input name="vara" placeholder="Ex: Shimano Venator 17lbs" required className="w-full p-3 rounded-xl font-bold bg-white outline-none" />
            </div>
            <div>
              <label className="block text-zinc-400 text-[9px] font-black uppercase mb-1">Carretilha / Molinete *</label>
              <input name="carretilha" placeholder="Ex: Curado DC" required className="w-full p-3 rounded-xl font-bold bg-white outline-none" />
            </div>
            <div>
              <label className="block text-zinc-400 text-[9px] font-black uppercase mb-1">Isca Artificial *</label>
              <input name="isca" placeholder="Ex: Zig Zarinha 90" required className="w-full p-3 rounded-xl font-bold bg-white outline-none" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-yellow-400 text-black p-5 rounded-2xl font-black uppercase italic shadow-xl hover:bg-white transition-all text-lg"
          >
            {loading ? 'Subindo Captura...' : 'Submeter Captura para Análise'}
          </button>
        </form>
      </div>
    </div>
  )
}
