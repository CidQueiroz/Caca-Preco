let listaDeNumerosSorteados = [];
let numeroLimite = 10;
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1

function exibitTextoNaTela(tag, texto) {
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
    responsiveVoice.speak(texto, 'Brazilian Portuguese Female', {rate: 1.2});
}

function mensagemInicial() {
    exibitTextoNaTela('h1', 'Jogo do número Secreto');
    exibitTextoNaTela('p', 'Escolha um número entre 1 e 10:');
}

mensagemInicial()

function verificarChute() {
    let chute = document.querySelector('input').value;

    if (chute == numeroSecreto) {
        exibitTextoNaTela('h1', 'Acertou!');

        palavraTentativas = tentativas > 1 ? 'tentativas' : 'tentativa';

        let mensagensTentativa = `Voce descobriu o numero secreto com ${tentativas} ${palavraTentativas}!`
        
        exibitTextoNaTela('p', mensagensTentativa);

        document.getElementById('reiniciar').removeAttribute('disabled');

    } else {

        if (chute > numeroSecreto) {

            exibitTextoNaTela('p', 'O numero secreto é menor');

        } else {

            exibitTextoNaTela('p', 'O numero secreto é maior');

        }

        tentativas++
        limparCampo();
    }
 }

function gerarNumeroAleatorio() {
    let numeroEscolhido = parseInt(Math.random() * numeroLimite + 1);
    let quantidadeDeElementosNaLista = listaDeNumerosSorteados.length;

    if (quantidadeDeElementosNaLista == numeroLimite) {
        listaDeNumerosSorteados = [];
    }

    if (listaDeNumerosSorteados.includes(numeroEscolhido)) {
        return gerarNumeroAleatorio();
    } else {
        listaDeNumerosSorteados.push(numeroEscolhido);
        console.log(listaDeNumerosSorteados);
        return numeroEscolhido;
    }
}

function limparCampo() {
    chute = document.querySelector('input');
    chute.value = '';
}

function reiniciarJogo() {
    numeroSecreto = gerarNumeroAleatorio();
    limparCampo();
    tentativas = 1;
    mensagemInicial();
    document.getElementById('reiniciar').setAttribute('disabled', true);
}