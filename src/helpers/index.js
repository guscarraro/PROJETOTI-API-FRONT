export const formatTomadorName = (tomador) => {
    if (!tomador) return '';
  
    const names = tomador.split(' ');
    const stopWords = ['de', 'da', 'do', '-'];
  
    // Caso seja uma frase longa como "Indústria de Massas de Alimentos Rosane"
    if (stopWords.includes(names[1]?.toLowerCase())) {
      let filteredNames = [names[0]]; // Inclui sempre o primeiro nome
  
      // Busca o próximo nome relevante após as stopWords
      for (let i = 1; i < names.length; i++) {
        if (!stopWords.includes(names[i]?.toLowerCase())) {
          filteredNames.push(names[i]);
  
          // Para a busca após encontrar o segundo nome relevante
          if (filteredNames.length === 2) break;
        }
      }
  
      // Adiciona o último nome, caso exista e seja diferente dos já adicionados
      const lastName = names[names.length - 1];
      if (!filteredNames.includes(lastName)) {
        filteredNames.push(lastName);
      }
  
      return filteredNames.join(' ');
    }
  
    // Caso contrário, retorna os dois primeiros nomes
    return names.slice(0, 2).join(' ');
  };