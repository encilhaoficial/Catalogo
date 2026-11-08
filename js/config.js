// Configurações do catálogo. Edite aqui, sem mexer no resto do código.
export const CONFIG = {
  // Planilha do Google Drive (precisa estar compartilhada como
  // "Qualquer pessoa com o link pode ver"). Se falhar, usa arquivoLocal.
  planilha: {
    ativa: true,
    id: "1s9trEI2abTdo8ONUZucifBI-BCeVd-ZB6SVlY9CpfRY",
    aba: "Produtos",
  },

  // Planilha local na raiz do projeto: colunas Produto, Categoria, Preço.
  arquivoLocal: "produtos.csv",

  // WhatsApp com DDI + DDD + número, só dígitos.
  whatsapp: "5542999665392",

  // Fotos: fotos/<nome-do-produto-sem-acentos>.jpg (ex.: fotos/bucal-coruja.jpg).
  // Uma coluna opcional "Foto" na planilha pode indicar outro arquivo.
  pastaFotos: "fotos",
  extensoesFoto: ["jpg","png"],

  // Ordem das abas. Categorias fora da lista entram no final.
  ordemCategorias: [
    "Buçais",
    "Cabeçadas e Rédeas",
    "Traias de Mula",
    "Peitorais",
    "Maneias",
    "Relhos e Mangos",
    "Bocais",
    "Produtos",
    "Chaveiros",
    "Vestuário",
    "Outros",
  ],

  textoSemPreco: "Orçamento pelo WhatsApp",
};
