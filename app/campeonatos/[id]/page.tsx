function processarRanking(c: any, parts: any[], caps: any[], categoria: string) {
    const COTA_MAXIMA_FIXA = 5 // <-- Defina aqui o limite de peixes que somam no ranking
    const COTA_MINIMA_FIXA = 1  // <-- Mínimo para dar o selo de "Cota Atingida"

    const lista = parts.map(p => {
      // Filtra apenas peixes da categoria selecionada
      const peixesCat = caps
        .filter(cap => cap.pescador_id === p.pescador_id && cap.especie === categoria)
        .sort((a, b) => b.tamanho_cm - a.tamanho_cm) // Organiza do MAIOR para o MENOR

      // PEGA APENAS OS MAIORES ATÉ O LIMITE DA COTA
      const peixesValidos = peixesCat.slice(0, COTA_MAXIMA_FIXA)
      
      // Soma apenas esses peixes válidos
      const soma = peixesValidos.reduce((acc, cur) => acc + parseFloat(cur.tamanho_cm), 0)
      
      return { 
        ...p, 
        pontuacao: soma, 
        qtd: peixesCat.length, 
        atingiuCota: peixesCat.length >= COTA_MINIMA_FIXA 
      }
    })

    setRanking(lista.sort((a, b) => b.pontuacao - a.pontuacao))

    // Big Fish da Categoria continua pegando o maior absoluto de todos
    const maior = caps.filter(cap => cap.especie === categoria).sort((a, b) => b.tamanho_cm - a.tamanho_cm)[0]
    setBigFish(maior)
  }
