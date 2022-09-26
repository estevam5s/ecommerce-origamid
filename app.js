const vm = new Vue({
    el: "#app",
    data: {
        produtos: [],
        produto: false,
        carrinho: [],
        carrinhoAtivo: false,
        mensagemAlerta: "item adicionado",
        alertaAtivo: false
    },
    filters: {
        numeroPreco(valor) {
            return valor.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
        }
    },
    computed: {
        carrinhoTotal() {
            let total = 0;
            if (this.carrinho.length) {
                this.carrinho.forEach(item => {
                    total += item.preco;
                })
            }
            return total;
        }
    },
    methods: {
        fetchProdutos() {
            fetch("./api/produtos.json")
                .then(response => response.json())
                .then(json => {
                    this.produtos = json;
                })
        },
        fetchProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
            .then(response => response.json())
            .then(json => {
                this.produto = json;
            })
        },
        abrirModal(id) {
            this.fetchProduto(id);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        },
        fecharModal({target, currentTarget}) {
            if (target === currentTarget) this.produto = false;
        },
        adicionarItem() {
            this.produto.estoque--;
            // Destruturando produto
            const {id, nome, preco} = this.produto;
            this.carrinho.push({id, nome, preco});
            this.alerta(`${nome} adicionado ao carrinho`)
        },
        removerItem(index) {
            this.carrinho.splice(index, 1);
        },
        clickForaCarrinho({target, currentTarget}) {
            if (target === currentTarget) this.carrinhoAtivo = false;
        },
        checarLocalstorage() {
            if (window.localStorage.carrinho) {
                this.carrinho = JSON.parse(window.localStorage.carrinho)
            }
        },
        compararEstoque() {
            const items = this.carrinho.filter( ({id}) => id === this.produto.id);
            this.produto.estoque -= items.length;
        },
        alerta(mensagem) {
            this.mensagemAlerta = mensagem;
            this.alertaAtivo = true;
            setTimeout(() => {
                this.alertaAtivo = false;
            }, 2000)
        },
        router() {
            const hash = document.location.hash;
            if(hash){
                this.fetchProduto(hash.replace("#", ""));
            }
        }
    },
    watch: {
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho); // Salva no LocalStorage
        },
        produto() {
            //Modificar o titulo
            document.title = this.produto.nome || "Techno";

            // Modificar a URL
            const hash = this.produto.id || "";
            history.pushState(null, null, `#${hash}`);
            // Comparar estoque
            if(this.produto){
                this.compararEstoque();
            }
        }
    },
    created() {
        // Executa o fetch na hora que cria o Vue
        this.fetchProdutos();
        this.checarLocalstorage();
        this.router();
    }
})