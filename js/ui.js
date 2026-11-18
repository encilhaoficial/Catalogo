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
  const caminhoFoto = produto.foto ? `${CONFIG.pastaFotos}/${produto.foto}` : "";
  const fotoWebp = produto.foto
    ? /\.[^./\\]+$/.test(produto.foto)
      ? caminhoFoto.replace(/\.[^./\\]+$/, ".webp")
      : `${caminhoFoto}.webp`
    : "";
  const candidatas = produto.foto
    ? [...new Set([fotoWebp, caminhoFoto])]
    : CONFIG.extensoesFoto.map((ext) => `${CONFIG.pastaFotos}/${produto.slug}.${ext}`);

  let tentativa = 0;
  img.alt = produto.nome;
  img.loading = "lazy";
  img.width = 800;
  img.height = 1000;
  img.src = candidatas[0];
  img.addEventListener("error", () => {
    tentativa += 1;
    if (tentativa < candidatas.length) img.src = candidatas[tentativa];
    else img.replaceWith(criarPlaceholder());
  });
  return img;
}

function fotosDoProduto(produto) {
  const fotos = produto.foto.split("|").map((foto) => foto.trim()).filter(Boolean);
  return fotos.length ? fotos.map((foto) => ({ ...produto, foto })) : [produto];
}

let galeria;

function obterGaleria() {
  if (galeria) return galeria;

  const dialogo = criar("dialog", "galeria");
  const topo = criar("div", "galeria-topo");
  const fechar = criar("button", "galeria-fechar", "×");
  fechar.type = "button";
  fechar.setAttribute("aria-label", "Fechar visualização");

  const palco = criar("div", "galeria-palco");
  const marca = criar("div", "galeria-marca");
  marca.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 4; i++) {
    marca.append(criar("span", "", "ENCILHA · @ENCILHAOFICIAL"));
  }

  const anterior = criar("button", "galeria-nav galeria-anterior", "‹");
  anterior.type = "button";
  anterior.setAttribute("aria-label", "Foto anterior");
  const proxima = criar("button", "galeria-nav galeria-proxima", "›");
  proxima.type = "button";
  proxima.setAttribute("aria-label", "Próxima foto");
  const contador = criar("p", "galeria-contador");
  contador.setAttribute("aria-live", "polite");

  topo.append(fechar);
  palco.append(marca, anterior, proxima);
  dialogo.append(topo, palco, contador);
  document.body.append(dialogo);

  let imagens = [];
  let indice = 0;
  let acionador;
  let imagemAtual;

  function mostrarImagem() {
    const imagem = criarImagem(imagens[indice]);
    imagem.className = "galeria-imagem";
    imagem.loading = "eager";
    imagem.alt = `${imagens[indice].nome}, foto ${indice + 1} de ${imagens.length}`;
    if (imagemAtual) imagemAtual.replaceWith(imagem);
    else palco.prepend(imagem);
    imagemAtual = imagem;
    contador.textContent = `${indice + 1} / ${imagens.length}`;
    anterior.hidden = imagens.length < 2;
    proxima.hidden = imagens.length < 2;
  }

  function navegar(direcao) {
    if (imagens.length < 2) return;
    indice = (indice + direcao + imagens.length) % imagens.length;
    mostrarImagem();
  }

  fechar.addEventListener("click", () => dialogo.close());
  anterior.addEventListener("click", () => navegar(-1));
  proxima.addEventListener("click", () => navegar(1));
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  dialogo.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      evento.preventDefault();
      dialogo.close();
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      navegar(-1);
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault();
      navegar(1);
    }
  });
  dialogo.addEventListener("cancel", (evento) => {
    evento.preventDefault();
    dialogo.close();
  });
  dialogo.addEventListener("close", () => {
    if (acionador && acionador.isConnected) acionador.focus();
  });

  let toqueInicial;
  palco.addEventListener("pointerdown", (evento) => {
    toqueInicial = evento.target === anterior || evento.target === proxima
      ? undefined
      : evento.clientX;
  });
  palco.addEventListener("pointerup", (evento) => {
    if (toqueInicial === undefined) return;
    const distancia = evento.clientX - toqueInicial;
    toqueInicial = undefined;
    if (Math.abs(distancia) > 50) navegar(distancia < 0 ? 1 : -1);
  });
  palco.addEventListener("pointercancel", () => {
    toqueInicial = undefined;
  });

  galeria = {
    abrir(produtos, controle) {
      imagens = produtos.flatMap(fotosDoProduto);
      indice = 0;
      acionador = controle;
      dialogo.setAttribute("aria-label", `Fotos de ${produtos[0].nome}`);
      mostrarImagem();
      if (!dialogo.open) dialogo.showModal();
      fechar.focus();
    },
  };
  return galeria;
}

function abrirGaleria(produtos, controle) {
  obterGaleria().abrir(produtos, controle);
}

// Mostra todas as fotos lado a lado; sem foto, mostra a logo.
function criarFoto(produtos) {
  const caixa = criar("button", "card-foto");
  caixa.type = "button";
  caixa.setAttribute("aria-label", `Ampliar fotos de ${produtos[0].nome}`);
  const imagens = produtos.flatMap(fotosDoProduto).map(criarImagem);
  if (imagens.length > 1) {
    caixa.classList.add("card-foto-variacoes");
    if (imagens.length > 2) caixa.classList.add("card-foto-multiplas");
  }
  caixa.append(...imagens);
  caixa.addEventListener("click", () => abrirGaleria(produtos, caixa));
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

  const botaoNome = criar("button", "card-nome", titulo);
  botaoNome.type = "button";
  botaoNome.addEventListener("click", () => abrirGaleria(produtos, botaoNome));

  corpo.append(botaoNome, criarPreco(produtos), botao);
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
