import React from 'react';

export default function Home() {
  const especies = ["Tucunaré", "Dourado", "Traíra", "Trairão"];
  
  return (
    <div className="min-h-screen bg-pesca-cinza-claro text-pesca-preto">
      {/* Cabeçalho */}
      <header className="bg-pesca-preto text-pesca-amarelo p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center italic">RECORDES DE PESCA ESPORTIVA</h1>
        <p className="text-center text-sm text-white">Trilhas do Rio Fishing Team</p>
      </header>

      {/* Filtros de Busca */}
      <main className="max-w-6xl mx-auto p-4">
        <section className="bg-white p-6 rounded-lg shadow-md border-t-4 border-pesca-amarelo mb-8">
          <h2 className="font-bold mb-4 uppercase">Filtrar Recordes</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="p-2 border rounded">
              <option>Todas as Espécies</option>
              {especies.map(e => <option key={e}>{e}</option>)}
            </select>
            <input type="text" placeholder="Nome do Pescador" className="p-2 border rounded" />
            <select className="p-2 border rounded">
              <option>Modalidade</option>
              <option>Absoluto</option>
              <option>Privado</option>
            </select>
            <button className="bg-pesca-amarelo font-bold py-2 rounded hover:bg-yellow-500 transition shadow">
              BUSCAR
            </button>
          </div>
        </section>

        {/* Grade de Recordes (Exemplo Visual) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded overflow-hidden shadow hover:shadow-xl transition border border-gray-200">
             <div className="bg-pesca-cinza-escuro h-48 flex items-center justify-center text-gray-400">
               Foto do Peixe
             </div>
             <div className="p-4">
               <span className="bg-pesca-amarelo text-[10px] font-bold px-2 py-1 rounded">TUCUNARÉ-AÇU</span>
               <h3 className="text-xl font-black mt-2">85.5 cm</h3>
               <p className="text-sm text-gray-600">Pescador: Exemplo de Nome</p>
               <p className="text-xs text-gray-400 uppercase mt-2">📍 Rio Uatumã, AM</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
