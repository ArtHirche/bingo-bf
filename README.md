# 🏴‍☠️ Bingo Pirata: Bando Black Flags • Navio Jack Down 🎲

> ⚡ **AVISO DE VIBECODE & ÉTICA**: Este projeto é um **VIBECODE** experimental — idealizado, arquitetado e gerado via **Vibe Coding** com Inteligência Artificial para diversão, uso recreativo entre amigos e aprendizado. 
> 
> 🛑 **NÃO INCENTIVAMOS A VENDA DE SOFTWARES VIBECODADOS**: Não incentivamos, apoiamos ou compactuamos com a comercialização de sites, plataformas ou softwares gerados por IA ("vibecodados") que possuam falhas de segurança, ausência de testes aprofundados ou falta de auditoria de código profissional. Projetos gerados em fluxo criativo não devem ser vendidos como produtos finais para terceiros sem a devida blindagem, conformidade (LGPD/GDPR) e auditoria de segurança rigorosa.

---

![Banner Bingo Pirata](https://img.shields.io/badge/Vibe_Coding-100%25_AI_Generated-f59e0b?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61dafb?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js_+_Express_5-339933?style=for-the-badge&logo=node.js)
![SocketIO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socketdotio)
![SQLite](https://img.shields.io/badge/Database-SQLite_(WAL)-003b57?style=for-the-badge&logo=sqlite)

---

## ⚓ Sobre o Projeto

O **Bingo Pirata dos Sete Mares** é uma aplicação web multiplayer em tempo real com estética temática de piratas inspirada no lendário bando **Black Flags** a bordo do temido navio **Jack Down**.

O jogo utiliza cartelas clássicas de **30 números** (grade 5x6 balanceada no intervalo de 1 a 90), conta com painel exclusivo de sorteio para o **Capitão (Moderador)** com disparador de canhão e um botão épico de **"GRITAR BINGO! 🏴‍☠️"** para os **Marujos (Jogadores)** com validação instantânea no servidor.

---

## 🎮 Funcionalidades Épicas

### 👑 1. Cabine de Comando do Capitão (Moderador)
- **Canhão de Sorteio Incandescente**: Animação e som de explosão de canhão a cada pedra sorteada.
- **Sorteio Manual ou Automático**: Dispare uma pedra por vez ou ative o temporizador automático (a cada 3s, 5s ou 8s).
- **Painel Geral de 90 Pedras**: Visão em tempo real de todas as pedras já chamadas, destacando a última pedra sorteada em vermelho pulsante.
- **Voz do Imediato (PT-BR)**: Narração sintetizada por voz falando as pedras sorteadas (*"Número 42!"*).
- **Gestão da Rodada**: Iniciar partida, pausar e reiniciar (gerando automaticamente novas cartelas para todos os marujos).

### ⚔️ 2. Convés dos Marujos (Jogadores)
- **Cartelas de 30 Números em Pergaminho**: Grade 5x6 balanceada em 6 colunas, com número de série único de tesouro (`TESOURO-XXXX-999`).
- **Carimbo de Caveira ☠️**: Toque na pedra para marcar com feedback sonoro de batida em madeira.
- **Auxiliar do Papagaio 🦜 (Auto-Marcar)**: Botão de auxílio que carimba instantaneamente todas as pedras que já foram sorteadas pelo Capitão.
- **Até 2 Cartelas por Marujo**: Cada jogador joga com 1 ou até 2 cartelas simultâneas de 30 pedras com alternância rápida em abas.

### 💰 3. O Botão "GRITAR BINGO! 🏴‍☠️" e Validação Server-Side
- **Validação Segura por Linha**: O servidor SQLite + Socket.IO valida a conclusão de qualquer linha perfeita (Horizontal de 6 pedras, Vertical de 5 pedras ou Diagonal de 5 pedras).
- **Vitória Legítima**:
  - Chuva torrencial de moedas de ouro e confetes na tela de todos os participantes.
  - Fanfarra triunfal sintetizada via Web Audio API.
  - Registro perpétuo do vencedor no **Livro de Ouro dos Campeões**.
  - Recompensa de 500 moedas de ouro para o campeão.
- **Alarme Falso**: Alerta sonoro cômico de buzina pirata e aviso do papagaio no chat alertando a tripulação sobre o grito prematuro.

### 💬 4. Taverna do Navio (Chat em Tempo Real)
- Mensagens ao vivo com frases rápidas piratas (*"Ahoy, marujos! ⚓"*, *"Quase BINGO! 🔥"*, *"O tesouro é meu! 💰"*).

### 🔊 5. Áudio 100% Sintetizado (Zero Dependência de Arquivos Externos)
- Sintetizador Web Audio API customizado para tiros de canhão, moedas de ouro, carimbos, fanfarras e buzinas.

---

## 🛠️ Arquitetura e Tecnologias

```
bingo-pirata/
├── server/                  # Backend Node.js + Express + Socket.IO
│   ├── index.js             # Servidor HTTP & WebSockets + Distribuição do Frontend
│   ├── db.js                # Banco SQLite (better-sqlite3 com WAL mode)
│   ├── auth.js              # Autenticação JWT + Bcrypt
│   ├── gameManager.js       # Regras do Bingo 30 números, Sorteio e Validação
│   └── socketHandler.js     # Eventos multiplayer em tempo real
├── client/                  # Frontend Vite + React
│   ├── src/
│   │   ├── components/      # Canhão, Cartela 30 números, Chat, Modal de Vitória
│   │   ├── context/         # AuthContext e SocketContext
│   │   ├── pages/           # Lobby, AuthPage, ModeratorPage, PlayerPage
│   │   ├── styles/          # pirate.css (Design System Pirata Completo)
│   │   └── utils/           # audio.js (Web Audio API & Web Speech)
│   └── index.html
└── package.json             # Scripts unificados com concurrently
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18+
- npm instalado

### 1. Instalar as dependências
```bash
# Na pasta raiz (instala dependências do servidor e do cliente automaticamente via postinstall)
npm install
```

### 2. Rodar a aplicação em desenvolvimento (Servidor + Cliente)
```bash
npm run dev
```

### 3. Acessar no Navegador
- **Aplicação Web (Vite)**: [http://localhost:5173](http://localhost:5173) (com Hot Reload)
- **Servidor Backend & API**: [http://localhost:4000](http://localhost:4000)

---

## 🏴‍☠️ Contas de Teste Rápido

Você pode clicar nos botões de acesso rápido na tela de login ou utilizar as credenciais:

| Cargo / Posto | Usuário / E-mail | Senha | Descrição |
| :--- | :--- | :--- | :--- |
| 👑 **Capitão (Mod)** | `capitao@pirata.com` | `senha123` | Controla os canhões e o sorteio |
| ⚓ **Marujo Jack** | `marujo@pirata.com` | `senha123` | Jogador com cartelas de 30 pedras |
| 🗡️ **Anne Bonny** | `anne@pirata.com` | `senha123` | Rainha dos Corsários |

---

## 🛡️ Manifesto de Segurança & Responsabilidade (Anti-Venda de Vibecodes Inseguros)

> ⚠️ **Atenção da Comunidade Dev**:
> 
> 1. **Vibe Coding para Protótipos e Diversão**: Criar sistemas rápidos com auxílio de IA é fantástico para prototipar, criar jogos com amigos e explorar ideias inovadoras.
> 2. **Não Venda Software Inseguro**: Vender soluções geradas por IA ("vibecodadas") sem auditoria técnica de segurança, sem sanitização completa, sem controle de sessão robusto e sem testes de penetração é uma prática irresponsável que coloca dados e empresas em risco.
> 3. **Auditoria Obrigatória para Produção**: Qualquer software que venha a ser comercializado precisa passar por revisão de código humano experiente, análise de vulnerabilidades (OWASP), validações criptográficas e testes automatizados.
> 
> *Aprenda, divirta-se, vibecodeie com paixão, mas nunca comercialize código frágil como se fosse software de nível corporativo.*

---

## 📜 Licença

Este projeto é software livre dedicado ao domínio público sob a licença **[The Unlicense](https://unlicense.org/)** (equivalente ao CC0 / Domínio Público). Veja o arquivo [LICENSE](/LICENSE) para mais detalhes. Sinta-se livre para copiar, modificar, estudar e navegar por novos mares de forma ética e responsável! 🏴‍☠️