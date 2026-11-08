import { carregarProdutos, listarCategorias } from "./produtos.js";
import {
  contarCards,
  desenharCategorias,
  desenharProdutos,
  filtrarProdutos,
  linkWhatsApp,
} from "./ui.js";

const els = {
  categorias: document.getElementById("categorias"),
  busca: document.getElementById("busca"),
  titulo: document.getElementById("titulo"),
  status: document.getElementById("status"),
  produtos: document.getElementById("produtos"),
  whatsapp: document.getElementById("whatsapp"),
};

const estado = { produtos: [], categorias: [], categoria: "" };

function atualizar() {
  const busca = els.busca.value.trim();
  const lista = filtrarProdutos(estado.produtos, estado.categoria, busca);

  els.titulo.textContent = busca ? `Resultados (${contarCards(lista)})` : estado.categoria;
  desenharCategorias(els.categorias, estado.categorias, busca ? "" : estado.categoria, (nome) => {
    estado.categoria = nome;
    els.busca.value = "";
    atualizar();
    window.scrollTo(0, 0);
  });
  desenharProdutos(els.produtos, lista, Boolean(busca));
}

async function iniciar() {
  els.whatsapp.href = linkWhatsApp();
  els.status.textContent = "Carregando produtos…";

  try {
    const { produtos } = await carregarProdutos();
    estado.produtos = produtos;
    estado.categorias = listarCategorias(produtos);
    estado.categoria = estado.categorias[0] ?? "";
    els.status.textContent = "";
    els.busca.addEventListener("input", atualizar);
    atualizar();
  } catch (erro) {
    console.error(erro);
    els.status.textContent =
      "Não foi possível carregar os produtos.";
  }
}

iniciar();
