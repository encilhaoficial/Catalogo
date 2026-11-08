import { CONFIG } from "./config.js";
import { lerCsv } from "./csv.js";

// Tira acentos e caixa: "Buçal" -> "bucal".
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function paraSlug(nome) {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "R$ 1.250,00" -> 1250 ; vazio ou texto -> null
export function paraNumero(valor) {
  const limpo = String(valor ?? "").replace(/[^\d,.-]/g, "");
  const ultimaVirgula = limpo.lastIndexOf(",");
  const ultimoPonto = limpo.lastIndexOf(".");
  let normalizado = limpo;

  if (ultimaVirgula >= 0 && ultimoPonto >= 0) {
    const decimal = Math.max(ultimaVirgula, ultimoPonto);
    const separadorMilhar = decimal === ultimaVirgula ? "." : ",";
    normalizado = limpo
      .replaceAll(separadorMilhar, "")
      .replace(decimal === ultimaVirgula ? "," : ".", ".");
  } else if (ultimaVirgula >= 0) {
    normalizado = limpo.replaceAll(",", ".").replace(/\.(?=.*\.)/g, "");
  } else if (ultimoPonto >= 0) {
    const casasDecimais = limpo.length - ultimoPonto - 1;
    if (casasDecimais === 3) {
      normalizado = limpo.replaceAll(".", "");
    } else {
      normalizado = limpo.replace(/\.(?=.*\.)/g, "");
    }
  }

  const numero = parseFloat(normalizado);
  return Number.isNaN(numero) ? null : numero;
}

export function linhasParaProdutos(linhas) {
  const [cabecalho, ...dados] = linhas;
  const coluna = (nome) => cabecalho.findIndex((c) => normalizar(c) === nome);
  const iProduto = coluna("produto");
  const iCategoria = coluna("categoria");
  const iPreco = coluna("preco");
  const iFoto = coluna("foto");
  const iNoCatalogo = coluna("no catalogo");

  if (iProduto < 0 || iCategoria < 0 || iPreco < 0 || iNoCatalogo < 0) {
    throw new Error(
      'A planilha precisa ter as colunas Produto, Categoria, Preço e "No Catálogo".',
    );
  }

  return dados
    .map((l) => ({
      nome: (l[iProduto] ?? "").trim(),
      categoria: (l[iCategoria] ?? "").trim() || "Outros",
      preco: paraNumero(l[iPreco]),
      foto: iFoto >= 0 ? (l[iFoto] ?? "").trim() : "",
      noCatalogo: normalizar(l[iNoCatalogo]) === "sim",
    }))
    .filter((p) => p.nome && p.noCatalogo)
    .map((p) => ({ ...p, slug: paraSlug(p.nome) }));
}

async function baixarTexto(url) {
  const resposta = await fetch(url, { cache: "no-store" });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.text();
}

function urlDaPlanilha() {
  const { id, aba } = CONFIG.planilha;
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(aba)}`;
}

// Tenta a planilha do Drive e, se não der, usa o arquivo local.
export async function carregarProdutos() {
  if (CONFIG.planilha.ativa) {
    try {
      const produtos = linhasParaProdutos(lerCsv(await baixarTexto(urlDaPlanilha())));
      if (produtos.length) return { produtos, origem: "drive" };
    } catch (erro) {
      console.warn("Planilha do Drive indisponível, usando arquivo local.", erro);
    }
  }
  const produtos = linhasParaProdutos(lerCsv(await baixarTexto(CONFIG.arquivoLocal)));
  return { produtos, origem: "local" };
}

export function listarCategorias(produtos) {
  const existentes = [...new Set(produtos.map((p) => p.categoria))];
  const ordem = CONFIG.ordemCategorias;
  const posicao = (c) => (ordem.includes(c) ? ordem.indexOf(c) : ordem.length);
  return existentes.sort((a, b) => posicao(a) - posicao(b));
}
