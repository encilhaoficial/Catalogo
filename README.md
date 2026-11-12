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
ferramentas/      utilitários para preparar as fotos
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

As fotos do catálogo são servidas em WebP, com 800 × 1000 pixels (proporção 4:5) e
carregamento sob demanda. Para novos produtos, use essa proporção e prefira arquivos
WebP de poucas dezenas de KB. Salve em `fotos/` com o nome do produto sem acentos,
minúsculo e com hífens, por exemplo `fotos/bucal-coruja.webp`. Arquivos `.jpg` e `.png`
continuam aceitos como alternativa. Sem foto, aparece a logo. Imagens fora de 4:5 são
ajustadas sem cortar o conteúdo.

### Converter fotos para WebP

1. Salve a foto original `.jpg` ou `.png` na pasta `fotos/`, usando o nome do produto
   sem acentos e com hífens, por exemplo `bucal-coruja.png`.
2. Na primeira vez, instale o Pillow, a biblioteca usada para processar as imagens:

```powershell
python -m pip install Pillow
```

3. No terminal aberto na pasta do projeto, rode:

```powershell
python ferramentas/otimizar_fotos.py
```

O script cria `bucal-coruja.webp` ao lado da foto original, redimensionada para
800 × 1000 pixels (4:5). O original é preservado. Cada vez que adicionar fotos, rode o
comando novamente: só as fotos novas ou alteradas serão convertidas. Fotos que já têm
uma versão WebP atualizada serão ignoradas. Fotos muito detalhadas podem passar do
alvo de 70 KB para preservar a qualidade.

### Gerar o nome da foto no Excel

Se o nome do produto estiver na célula `A2`, esta fórmula do Excel 365 gera o nome
correspondente ao arquivo WebP:

```excel
=SE(A2="";"";LET(n;MINÚSCULA(A2);a;SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(n;"á";"a");"à";"a");"â";"a");"ã";"a");"é";"e");"è";"e");"ê";"e");"í";"i");"ì";"i");"î";"i");"ó";"o");"ò";"o");"ô";"o");"õ";"o");"ú";"u");"ù";"u");"û";"u");"ü";"u");"ç";"c");"ý";"y");slug;REGEXREPLACE(a;"[^a-z0-9]+";"-");REGEXREPLACE(slug;"(^-|-$)";"")&".webp"))
```

Por exemplo, `Buçal (Trança de 8)` vira `bucal-tranca-de-8.webp`. Arraste a fórmula
para as outras linhas da coluna. Se a planilha tiver a coluna `Foto`, use o resultado
nela, sem acrescentar `fotos/`. A função `REGEXREPLACE` requer uma versão atual do Excel
365.

Para itens iguais disponíveis em cores diferentes, acrescente `-cor-<cor>` ao nome de
cada produto e foto, por exemplo `bucal-funciona-cor-preto.webp` e
`bucal-funciona-cor-bege.webp`. As cores aparecem juntas no mesmo card, com as fotos
dividindo o espaço.

## Testar no computador

Os módulos JS exigem um endereço http. Dentro da pasta, rode `python3 -m http.server 8000`
e abra http://localhost:8000. Abrir o `index.html` com duplo clique não funciona.

## Publicar de graça

Envie a pasta inteira para Netlify Drop, GitHub Pages ou Cloudflare Pages.
