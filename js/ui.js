import { CONFIG } from "./config.js";
import { normalizar } from "./produtos.js";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function linkWhatsApp(mensagem = "") {
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${CONFIG.whatsapp}${texto}`;
}

function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function criarPlaceholder() {
  const img = criar("img", "placeholder");
  img.src = "assets/logo-icone.png";
  img.alt = "";
  return img;
}

function criarImagem(produto) {
  const img = criar("img");
  const candidatas = produto.foto
    ? [`${CONFIG.pastaFotos}/${produto.foto}`]
    : CONFIG.extensoesFoto.map((ext) => `${CONFIG.pastaFotos}/${produto.slug}.${ext}`);

  let tentativa = 0;
  img.alt = produto.nome;
  img.loading = "lazy";
  img.src = candidatas[0];
  img.addEventListener("error", () => {
    tentativa += 1;
    if (tentativa < candidatas.length) img.src = candidatas[tentativa];
    else img.replaceWith(criarPlaceholder());
  });
  return img;
}

// Mostra as fotos das cores lado a lado; sem foto, mostra a logo.
function criarFoto(produtos) {
  const caixa = criar("div", "card-foto");
  if (produtos.length > 1) {
    caixa.classList.add("card-foto-variacoes");
    if (produtos.length > 2) caixa.classList.add("card-foto-multiplas");
  }
  caixa.append(...produtos.map(criarImagem));
  return caixa;
}

function chaveVariacaoCor(produto) {
  const resultado = produto.slug.match(/^(.*)-cor-(.+)$/);
  return resultado ? `${normalizar(produto.categoria)}:${resultado[1]}` : "";
}

function nomeDaCor(produto) {
  const resultado = produto.slug.match(/-cor-(.+)$/);
  return resultado ? resultado[1].replace(/-/g, " ") : produto.nome;
}

function agruparProdutos(produtos) {
  const grupos = new Map();
  const ordem = [];

  for (const produto of produtos) {
    const chave = chaveVariacaoCor(produto);
    const grupo = chave && grupos.get(chave);
    if (grupo) {
      grupo.push(produto);
    } else {
      const novoGrupo = [produto];
      ordem.push(novoGrupo);
      if (chave) grupos.set(chave, novoGrupo);
    }
  }

  return ordem.flatMap((grupo) => {
    const variantes = [...new Map(grupo.map((produto) => [produto.slug, produto])).values()];
    const cores = new Set(variantes.map(nomeDaCor));
    return cores.size > 1 ? [variantes] : grupo.map((produto) => [produto]);
  });
}

export function contarCards(produtos) {
  return agruparProdutos(produtos).length;
}

function criarPreco(produtos) {
  const precos = new Set(produtos.map((produto) => produto.preco));
  if (precos.size === 1) {
    const preco = produtos[0].preco;
    const temPreco = preco !== null;
    return criar(
      "div",
      temPreco ? "card-preco" : "card-preco sem-preco",
      temPreco ? formatoMoeda.format(preco) : CONFIG.textoSemPreco,
    );
  }

  const lista = criar("div", "card-precos-variacoes");
  produtos.forEach((produto) => {
    const linha = criar("div", "card-preco-variacao");
    const preco = produto.preco === null
      ? CONFIG.textoSemPreco
      : formatoMoeda.format(produto.preco);
    linha.append(criar("span", "", nomeDaCor(produto)), criar("strong", "", preco));
    lista.append(linha);
  });
  return lista;
}

function criarCard(produtos) {
  const produto = produtos[0];
  const titulo = produtos.length > 1
    ? produto.nome.replace(/\s*[\[(]?\s*cor[\s-]+.*$/i, "").trim()
    : produto.nome;
  const card = criar("article", "card");
  const corpo = criar("div", "card-corpo");

  const botao = criar("a", "btn", "Pedir pelo WhatsApp");
  const mensagem = produtos.length > 1
    ? `Olá! Vi no catálogo: ${titulo} (cores: ${produtos.map(nomeDaCor).join(", ")}) e quero saber mais.`
    : `Olá! Vi no catálogo: ${produto.nome} e quero saber mais.`;
  botao.href = linkWhatsApp(mensagem);

  corpo.append(criar("div", "card-nome", titulo), criarPreco(produtos), botao);
  card.append(criarFoto(produtos), corpo);
  return card;
}

export function desenharCategorias(container, categorias, ativa, aoEscolher) {
  container.replaceChildren(
    ...categorias.map((nome) => {
      const botao = criar("button", "", nome);
      botao.type = "button";
      botao.setAttribute("aria-pressed", String(nome === ativa));
      botao.addEventListener("click", () => aoEscolher(nome));
      return botao;
    }),
  );
}

export function filtrarProdutos(produtos, categoria, busca) {
  const termo = normalizar(busca);
  if (termo) {
    const encontrados = produtos.filter((p) => normalizar(p.nome).includes(termo));
    const gruposEncontrados = new Set(encontrados.map(chaveVariacaoCor).filter(Boolean));
    return produtos.filter((p) =>
      encontrados.includes(p) || gruposEncontrados.has(chaveVariacaoCor(p)),
    );
  }
  return produtos.filter((p) => p.categoria === categoria);
}

export function desenharProdutos(container, lista, buscando) {
  if (!lista.length) {
    const aviso = criar("p", "vazio");
    aviso.append(buscando ? "Nada encontrado. " : "Esta linha está sendo atualizada. ");
    const link = criar("a", "", "Fale com a gente pelo WhatsApp");
    link.href = linkWhatsApp();
    aviso.append(link, ".");
    container.replaceChildren(aviso);
    return;
  }
  container.replaceChildren(...agruparProdutos(lista).map(criarCard));
}
