/* =================================================================
   MAQUINA DE REFRI VIRTUAL
   Fundamentos e Arquitetura de Desenvolvimento Web - USP
   JavaScript Vanilla + AJAX + Drag and Drop
   ================================================================= */

const URL_API = "https://api.jsonbin.io/v3/b/69d64173aaba882197d7779a";

// --- Estado global da maquina ---
let saldoAtual    = 0.0;
let listaRefris   = [];

// Contadores de moedas presentes na carteira
let quantidadeM25  = 0;
let quantidadeM50  = 0;
let quantidadeM100 = 0;

// Flag para evitar que musica seja iniciada antes de interacao do usuario
let musicaIniciada = false;

// --- Referencias aos elementos do DOM ---
const visorSaldo    = document.getElementById('visor-saldo');
const telaMensagem  = document.getElementById('tela-mensagem');
const vitrine       = document.getElementById('vitrine');
const gradeBotoes   = document.getElementById('grade-botoes');
const fendaMoeda    = document.getElementById('fenda-moeda');
const areaSaida     = document.getElementById('area-saida');
const tampaDisp     = document.getElementById('tampa-dispensador');
const areaCarteira  = document.getElementById('area-carteira');
const fundoGatinhos = document.getElementById('fundo-gatinhos');
const contM25       = document.getElementById('cont-25');
const contM50       = document.getElementById('cont-50');
const contM100      = document.getElementById('cont-100');
const totalCarteira = document.getElementById('total-carteira');
const btnMusica     = document.getElementById('btn-musica');

/* =================================================================
   SINTESE DE AUDIO
   Sons e musica gerados inteiramente via Web Audio API (sem arquivos)
   ================================================================= */
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// Garantir que o contexto esta ativo (navegadores suspendem antes de interacao)
function garantirAudio() {
    if (ctx.state === 'suspended') ctx.resume();
}

/* ----------------------------------------------------------------
   Sons de efeito (SFX)
   ---------------------------------------------------------------- */
function tocarSom(tipo) {
    garantirAudio();
    const osc   = ctx.createOscillator();
    const ganho = ctx.createGain();
    const agora = ctx.currentTime;
    osc.connect(ganho);
    ganho.connect(ctx.destination);

    switch (tipo) {
        case 'clique':
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, agora);
            osc.frequency.exponentialRampToValueAtTime(600, agora + 0.08);
            ganho.gain.setValueAtTime(0.05, agora);
            ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.1);
            osc.start(agora); osc.stop(agora + 0.1);
            break;

        case 'arrastar':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, agora);
            osc.frequency.linearRampToValueAtTime(400, agora + 0.08);
            ganho.gain.setValueAtTime(0.03, agora);
            ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.08);
            osc.start(agora); osc.stop(agora + 0.08);
            break;

        case 'moeda':
            // Tintim de moeda entrando na maquina
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1100, agora);
            osc.frequency.setValueAtTime(1400, agora + 0.05);
            osc.frequency.exponentialRampToValueAtTime(800, agora + 0.15);
            ganho.gain.setValueAtTime(0.12, agora);
            ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.18);
            osc.start(agora); osc.stop(agora + 0.18);
            break;

        case 'troco':
            // Varias moedas caindo em sequencia (troco devolvido)
            [0, 0.10, 0.20, 0.30].forEach((delay, i) => {
                const o2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                o2.connect(g2); g2.connect(ctx.destination);
                o2.type = 'sine';
                const freqs = [900, 1100, 1300, 1050];
                o2.frequency.setValueAtTime(freqs[i], agora + delay);
                o2.frequency.exponentialRampToValueAtTime(600, agora + delay + 0.12);
                g2.gain.setValueAtTime(0.1, agora + delay);
                g2.gain.exponentialRampToValueAtTime(0.001, agora + delay + 0.14);
                o2.start(agora + delay); o2.stop(agora + delay + 0.14);
            });
            return;

        case 'dispensar':
            // Ronco mecanico grave
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, agora);
            osc.frequency.exponentialRampToValueAtTime(40, agora + 0.6);
            ganho.gain.setValueAtTime(0.1, agora);
            ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.6);
            osc.start(agora); osc.stop(agora + 0.6);
            break;

        case 'erro':
            // Buzina descendente de erro
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, agora);
            osc.frequency.exponentialRampToValueAtTime(130, agora + 0.3);
            ganho.gain.setValueAtTime(0.1, agora);
            ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.3);
            osc.start(agora); osc.stop(agora + 0.3);
            break;
    }
}

/* ----------------------------------------------------------------
   Musica de fundo - Sequenciador retro
   Melodia estilo Chip-Tune criada com notas em Hz
   ---------------------------------------------------------------- */
let musicaRodando   = false;
let proximoTempo    = 0;
let indicePasso     = 0;
let temporizadorMus = null;

// Sequencia de notas: [frequencia Hz, duracao em beats]
// Baseada em escala pentatonica maior para soar alegre e retro
const MELODIA = [
    [523, 1], [659, 1], [784, 1], [880, 2],
    [784, 1], [659, 1], [523, 1], [392, 2],
    [440, 1], [523, 1], [659, 1], [784, 2],
    [659, 1], [523, 1], [440, 1], [392, 2],
    [523, 2], [659, 2], [784, 1], [659, 1],
    [523, 2], [392, 2], [440, 1], [523, 1],
    [659, 2], [784, 2], [880, 1], [784, 1],
    [659, 2], [523, 4]
];

// Baixo: acorde simples acompanhando a melodia
const BAIXO = [
    [130, 4], [147, 4], [165, 4], [174, 4],
    [130, 4], [147, 4], [165, 4], [174, 4]
];

const BPM         = 160;
const BEAT        = 60 / BPM;
const LOOK_AHEAD  = 0.1; // segundos antecipados para escalonar notas

let indiceBaixo = 0;

function tocarNota(freq, inicio, duracao, volume, forma) {
    const osc   = ctx.createOscillator();
    const ganho = ctx.createGain();

    osc.connect(ganho);
    ganho.connect(ctx.destination);

    osc.type = forma;
    osc.frequency.setValueAtTime(freq, inicio);

    // Envelope ADSR simplificado: attack + decay + sustain + release
    ganho.gain.setValueAtTime(0, inicio);
    ganho.gain.linearRampToValueAtTime(volume, inicio + 0.01);
    ganho.gain.setValueAtTime(volume * 0.7, inicio + duracao * 0.3);
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao - 0.02);

    osc.start(inicio);
    osc.stop(inicio + duracao);
}

function agendar() {
    while (proximoTempo < ctx.currentTime + LOOK_AHEAD) {
        const [freqMel, beats] = MELODIA[indicePasso % MELODIA.length];
        const dur = beats * BEAT;

        // Melodia principal em onda quadrada (chip-tune classico)
        tocarNota(freqMel, proximoTempo, dur * 0.85, 0.06, 'square');
        // Melodia oitava acima, mais suave
        tocarNota(freqMel * 2, proximoTempo, dur * 0.5, 0.02, 'square');

        // Baixo em onda triangular a cada 4 beats
        if (indicePasso % 4 === 0) {
            const [freqBx, beatsBx] = BAIXO[indiceBaixo % BAIXO.length];
            tocarNota(freqBx, proximoTempo, beatsBx * BEAT * 0.9, 0.04, 'triangle');
            indiceBaixo++;
        }

        proximoTempo += dur;
        indicePasso++;
    }
    temporizadorMus = setTimeout(agendar, 25);
}

function iniciarMusica() {
    garantirAudio();
    if (musicaRodando) return;
    musicaRodando = true;
    proximoTempo  = ctx.currentTime + 0.1;
    indicePasso   = 0;
    indiceBaixo   = 0;
    agendar();
    btnMusica.textContent = '🎵 MUSICA: ON';
    btnMusica.classList.add('ativo');
}

function pararMusica() {
    musicaRodando = false;
    clearTimeout(temporizadorMus);
    btnMusica.textContent = '🎵 MUSICA: OFF';
    btnMusica.classList.remove('ativo');
}

function alternarMusica() {
    garantirAudio();
    if (musicaRodando) pararMusica();
    else iniciarMusica();
}

/* =================================================================
   UTILITARIOS
   ================================================================= */

// Formata numero em reais: 6.5 -> "R$ 6,50"
function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// Atualiza o visor LED de saldo
function atualizarVisor() {
    visorSaldo.textContent = formatarMoeda(saldoAtual);
}

// Exibe mensagem na tela da maquina (substitui alert)
function exibirMensagem(texto, classe = 'info') {
    telaMensagem.textContent = texto;
    telaMensagem.className   = `tela-mensagem pixel-borda ${classe}`;
    setTimeout(() => {
        telaMensagem.className   = 'tela-mensagem pixel-borda';
        telaMensagem.textContent = 'Insira moedas!';
    }, 4000);
}

// Recalcula e exibe o resumo da carteira (quantidades e total)
function atualizarResumoCarteira() {
    contM25.textContent  = quantidadeM25;
    contM50.textContent  = quantidadeM50;
    contM100.textContent = quantidadeM100;
    const totalCentavos  = (quantidadeM25 * 25) + (quantidadeM50 * 50) + (quantidadeM100 * 100);
    totalCarteira.textContent = formatarMoeda(totalCentavos / 100);
}

/* =================================================================
   BUSCA DE DADOS VIA AJAX
   ================================================================= */
async function buscarRefrigerantes() {
    try {
        const resposta = await fetch(URL_API);
        const dados    = await resposta.json();
        listaRefris    = dados.record.bebidas;
        renderizarMaquina();
    } catch (erro) {
        vitrine.innerHTML = '<div class="erro-texto">ERRO DE CONEXAO</div>';
        exibirMensagem('FALHA NO SISTEMA', 'erro');
    }
}

/* =================================================================
   RENDERIZACAO DA INTERFACE
   ================================================================= */
function renderizarMaquina() {
    vitrine.innerHTML     = '';
    gradeBotoes.innerHTML = '';

    listaRefris.forEach((refri, indice) => {
        // Card do refri na vitrine
        const card = document.createElement('div');
        card.className = 'item-refri pixel-borda';
        card.innerHTML = `
            <div class="numero-refri">${indice + 1}</div>
            <div class="wrapper-imagem">
                <img src="${refri.imagem}" alt="${refri.sabor}">
            </div>
            <div class="nome-refri">${refri.sabor}</div>
            <div class="preco-refri">${formatarMoeda(refri.preco)}</div>
        `;
        vitrine.appendChild(card);

        // Botao no painel lateral
        const btn = document.createElement('button');
        btn.className   = 'botao-refri pixel-borda';
        btn.textContent = indice + 1;
        btn.onclick = () => {
            tocarSom('clique');
            processarCompra(refri);
        };
        gradeBotoes.appendChild(btn);
    });
}

/* =================================================================
   LOGICA DE COMPRA E TROCO
   ================================================================= */

// Devolve o troco em moedas fisicas na carteira (greedy: maior para menor)
function devolverTroco(centavos) {
    let restante = Math.round(centavos);
    while (restante >= 100) { adicionarMoedaNaCarteira('100', 1.00); restante -= 100; }
    while (restante >= 50)  { adicionarMoedaNaCarteira('50',  0.50); restante -= 50;  }
    while (restante >= 25)  { adicionarMoedaNaCarteira('25',  0.25); restante -= 25;  }
    // Atualiza o resumo DEPOIS de todas as moedas serem adicionadas
    atualizarResumoCarteira();
}

function processarCompra(refri) {
    if (saldoAtual >= refri.preco) {
        // Usa centavos inteiros para evitar erros de ponto flutuante
        const trocoCentavos = Math.round((saldoAtual - refri.preco) * 100);
        saldoAtual = 0;
        atualizarVisor();

        let mensagem = `${refri.sabor} LIBERADO!`;
        if (trocoCentavos > 0) {
            mensagem += ` TROCO: ${formatarMoeda(trocoCentavos / 100)}`;
            devolverTroco(trocoCentavos);
        }

        tocarSom('dispensar');
        exibirMensagem(mensagem, 'sucesso');
        animarDispensa(refri);
    } else {
        tocarSom('erro');
        exibirMensagem(`SALDO INSUF. FALTAM ${formatarMoeda(refri.preco - saldoAtual)}`, 'erro');
    }
}

/* =================================================================
   ANIMACAO DE DISPENSA (bandeja)
   ================================================================= */
function animarDispensa(refri) {
    tampaDisp.style.transform = 'rotateX(-65deg)';

    const lata    = document.createElement('img');
    lata.src      = refri.imagem;
    lata.alt      = refri.sabor;
    lata.className = 'lata-caindo';
    lata.title    = 'Clique para pegar!';

    // Clicar na lata: som de troco + animacao saindo pela esquerda + crescendo
    lata.addEventListener('click', () => {
        if (lata.classList.contains('lata-saindo')) return;
        tocarSom('troco');
        lata.classList.add('lata-saindo');
        setTimeout(() => lata.remove(), 1900);
    });

    areaSaida.innerHTML = '';
    areaSaida.appendChild(lata);

    // Fecha tampa apos 2s
    setTimeout(() => { tampaDisp.style.transform = 'rotateX(0)'; }, 2000);
    // Remove lata automaticamente apos 8s se nao clicada
    setTimeout(() => { if (areaSaida.contains(lata)) lata.remove(); }, 8000);
}

/* =================================================================
   DRAG AND DROP DE MOEDAS
   ================================================================= */
function configurarDragAndDrop() {
    fendaMoeda.addEventListener('dragover', (e) => {
        e.preventDefault();
        fendaMoeda.classList.add('arrastando-sobre');
    });

    fendaMoeda.addEventListener('dragleave', () => {
        fendaMoeda.classList.remove('arrastando-sobre');
    });

    fendaMoeda.addEventListener('drop', (e) => {
        e.preventDefault();
        fendaMoeda.classList.remove('arrastando-sobre');

        const valorMoeda = parseFloat(e.dataTransfer.getData('valor'));
        const idMoeda    = e.dataTransfer.getData('id-moeda');

        if (!isNaN(valorMoeda) && idMoeda) {
            tocarSom('moeda');
            saldoAtual += valorMoeda;
            atualizarVisor();

            // Remove a moeda fisica da carteira
            const moedaEl = document.getElementById(idMoeda);
            if (moedaEl) moedaEl.remove();

            // Decrementa contador e atualiza resumo
            if (valorMoeda === 0.25) quantidadeM25  = Math.max(0, quantidadeM25  - 1);
            if (valorMoeda === 0.50) quantidadeM50  = Math.max(0, quantidadeM50  - 1);
            if (valorMoeda === 1.00) quantidadeM100 = Math.max(0, quantidadeM100 - 1);
            atualizarResumoCarteira();
        }
    });
}

/* =================================================================
   MOEDAS NA CARTEIRA
   ================================================================= */

// Cria e insere uma moeda em posicao aleatoria dentro da carteira
function adicionarMoedaNaCarteira(tipo, valor, atualizarUI = false) {
    const moeda = document.createElement('div');
    moeda.className       = `moeda moeda-${tipo}`;
    moeda.dataset.valor   = valor;
    moeda.draggable       = true;
    moeda.style.left      = `${Math.floor(Math.random() * 78)}%`;
    moeda.style.top       = `${Math.floor(Math.random() * 85)}%`;
    moeda.id              = `moeda-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const label = valor === 1.00 ? 'R$1' : `${Math.round(valor * 100)}c`;
    moeda.innerHTML = `<div class="interior-moeda">${label}</div>`;

    moeda.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('valor',    String(valor));
        e.dataTransfer.setData('id-moeda', moeda.id);
        tocarSom('arrastar');
        setTimeout(() => moeda.classList.add('arrastando'), 0);
    });
    moeda.addEventListener('dragend', () => moeda.classList.remove('arrastando'));

    areaCarteira.appendChild(moeda);

    // Atualiza contadores internos
    if (valor === 0.25) quantidadeM25++;
    if (valor === 0.50) quantidadeM50++;
    if (valor === 1.00) quantidadeM100++;

    // Atualiza UI imediatamente se solicitado (ex: ao gerar moedas iniciais)
    if (atualizarUI) atualizarResumoCarteira();
}

// Gera 20 a 30 moedas de cada tipo e popula a carteira
function gerarMoedasIniciais() {
    areaCarteira.innerHTML        = '';
    quantidadeM25 = quantidadeM50 = quantidadeM100 = 0;

    const qtd = () => Math.floor(Math.random() * 11) + 20;
    for (let i = 0; i < qtd(); i++) adicionarMoedaNaCarteira('25',  0.25);
    for (let i = 0; i < qtd(); i++) adicionarMoedaNaCarteira('50',  0.50);
    for (let i = 0; i < qtd(); i++) adicionarMoedaNaCarteira('100', 1.00);

    // Atualiza o resumo UMA vez apos gerar todas as moedas
    atualizarResumoCarteira();
}

/* =================================================================
   GATINHOS ANIMADOS NO FUNDO
   ================================================================= */
const EMOJIS_GATOS = ['🐈', '🐱', '😼', '😻', '😺', '🙀', '😾', '🐾'];

function criarGatinhos() {
    for (let i = 0; i < 9; i++) {
        const div       = document.createElement('div');
        div.className   = 'gatinho';
        div.textContent = EMOJIS_GATOS[i % EMOJIS_GATOS.length];
        div.style.left  = `${Math.floor(Math.random() * 93)}%`;

        const dur   = 8 + Math.random() * 10;
        const delay = -(Math.random() * dur);
        div.style.animationDuration = `${dur}s`;
        div.style.animationDelay   = `${delay}s`;

        const tam   = 4 + Math.random() * 3;
        div.style.fontSize = `${tam}rem`;
        fundoGatinhos.appendChild(div);
    }
}

/* =================================================================
   INICIALIZACAO
   ================================================================= */
// Botao de musica
btnMusica.addEventListener('click', () => {
    alternarMusica();
});

// Inicia musica automaticamente na primeira interacao do usuario
document.addEventListener('click', () => {
    if (!musicaIniciada) {
        musicaIniciada = true;
        iniciarMusica();
    }
}, { once: true });

criarGatinhos();
gerarMoedasIniciais();
configurarDragAndDrop();
buscarRefrigerantes();
