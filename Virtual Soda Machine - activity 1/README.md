# Virtual Soda Machine / Máquina de Refri Virtual
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](#português)

---

## 🇧🇷 Português

### Sobre o Projeto
Uma aplicação web interativa que simula o funcionamento de uma máquina de refrigerantes virtual. Este projeto foi desenvolvido como a Atividade 1 da disciplina de Fundamentos e Arquitetura de Desenvolvimento Web do ICMC - USP. 

O objetivo principal do site é oferecer uma experiência lúdica com muitos gatinhos e sons retros onde o usuário gerencia uma "carteira" de moedas virtuais (você atualizar a página caso precise de mais moedas), insere na máquina e realiza a compra de bebidas, demonstrando na prática conceitos fundamentais de desenvolvimento web, consumo de APIs e manipulação complexa do DOM no navegador.

### Demonstração ao Vivo
Você não precisa baixar ou instalar o repositório para ver o projeto funcionando! A aplicação está no ar e pode ser acessada diretamente pelo link abaixo:
**[Acessar a Virtual Soda Machine](https://Mapnbp.github.io/Fundamentals-and-Architecture-of-Web-Development---USP/Virtual%20Soda%20Machine%20-%20activity%201/)**

### Funcionalidades
* **Drag and Drop de Moedas:** Interação onde o usuário arrasta moedas (R$0.25, R$0.50, R$1.00) da carteira para a fenda da máquina.
* **Áudio Procedural (Web Audio API):** Todos os efeitos sonoros (SFX de moedas, cliques, erros) e a música de fundo estilo *Chip-Tune* (8-bit) são gerados matematicamente via código, sem o uso de arquivos de áudio externos.
* **Consumo de API (AJAX):** A lista de refrigerantes e seus preços é carregada dinamicamente de uma API externa em formato JSON.
* **Cálculo de Troco Inteligente:** A máquina calcula o troco da compra e devolve na carteira do usuário priorizando as moedas de maior valor (algoritmo guloso).
* **Animações e Interface Dinâmica:** Gatinhos animados no fundo usando emojis e animações em CSS para a entrega da lata de refrigerante.

### Tecnologias Utilizadas
* HTML5 & CSS3 (Animações e Layout)
* JavaScript Vanilla (ES6+)
* Fetch API (AJAX)
* Drag and Drop API
* Web Audio API
