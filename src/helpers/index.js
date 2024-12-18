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


  export const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };
  

  export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  export const formatarData = (data)=>{
    if (!data) return "-";
  
    // Converte a string para o formato ISO caso necessário
    const dataFormatada = new Date(data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
  
    if (isNaN(dataFormatada)) return "Data inválida";
    
    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return dataFormatada.toLocaleString("pt-BR", options);
  }
  export const formatarHorasMinutos = (horas, minutos) => {
    const hh = String(horas).padStart(2, "0");
    const mm = String(minutos).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  
  