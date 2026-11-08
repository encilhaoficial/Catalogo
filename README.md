# Catálogo Encilha

Catálogo online em HTML, CSS e JavaScript puro (sem instalação, sem banco de dados).

## Estrutura

```
index.html        página
css/styles.css    visual
js/config.js      configurações (planilha, WhatsApp, ordem das abas, fotos)
js/csv.js         leitor de CSV
js/produtos.js    carrega e organiza os produtos
js/ui.js          desenha as abas e os cards
js/main.js        liga tudo
produtos.csv      planilha local (reserva): colunas Produto, Categoria, Preço
assets/           logos
fotos/            fotos dos produtos
```

## De onde vêm os produtos

1. **Planilha do Drive** (`Produtos`): o site tenta ler direto dela. Ela precisa estar
   compartilhada como "Qualquer pessoa com o link pode ver". O ID e o nome da aba ficam
   em `js/config.js`.
2. **`produtos.csv`** na raiz: usado quando a planilha do Drive não responde.
   Para atualizar, no Google Sheets use Arquivo > Fazer download > CSV e substitua o arquivo.

As colunas obrigatórias são `Produto`, `Categoria`, `Preço` e `No Catálogo`. Preencha
`No Catálogo` com `Sim` para exibir um produto; `Não`, vazio ou qualquer outro valor o
mantém fora do site. As abas do site nascem das categorias dos produtos exibidos. Uma
coluna opcional `Foto` pode indicar o nome de um arquivo da pasta `fotos/`. O CSV local
de reserva também precisa ter essas colunas para funcionar quando a planilha não estiver
disponível. O preço pode ser informado com ou sem `R$`, usando vírgula ou ponto como
separador decimal.

## Fotos

Salve em `fotos/` com o nome do produto sem acentos, minúsculo e com hífens, em `.jpg`
ou `.png`. Exemplo: "Buçal Coruja" vira `fotos/bucal-coruja.jpg`. Sem foto, aparece a logo.
Use fotos verticais (4:5): elas aparecem inteiras, sem corte.

Para itens iguais disponíveis em cores diferentes, acrescente `-cor-<cor>` ao nome de
cada produto e foto, por exemplo `bucal-funciona-cor-preto.png` e
`bucal-funciona-cor-bege.png`. As cores aparecem juntas no mesmo card, com as fotos
dividindo o espaço.

## Testar no computador

Os módulos JS exigem um endereço http. Dentro da pasta, rode `python3 -m http.server 8000`
e abra http://localhost:8000. Abrir o `index.html` com duplo clique não funciona.

## Publicar de graça

Envie a pasta inteira para Netlify Drop, GitHub Pages ou Cloudflare Pages.
