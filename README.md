<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🚽 Torneio do Trono

**O aplicativo web definitivo para registrar, ranquear e coroar o verdadeiro rei (ou rainha) do trono!**

</div>

---

## 📖 Sobre o Projeto

**Torneio do Trono** é um aplicativo web bem-humorado feito para grupos de amigos que desejam manter um registro competitivo e divertido de suas... idas ao banheiro. Com direito a ranking, histórico detalhado da galera, coroações mensais e apelidos muito criativos!

## ✨ Funcionalidades

- 🏆 **Ranking Dinâmico:** Veja quem está liderando o placar no mês ou na semana.
- 📜 **Histórico (Timeline):** Acompanhe o registro com informações de "nível de esforço" e localização.
- 👑 **Coroação Mensal:** Modal automático que declara o campeão do mês anterior.
- 🗣️ **Apelidos Divertidos:** Cada participante ganha um apelido hilário gerado automaticamente.
- 🔒 **Autenticação Segura:** Login via Google utilizando o Firebase Auth.
- 🔔 **Notificações:** Sistema de Toasts e efeitos sonoros para celebrar as entradas.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as melhores ferramentas do ecossistema moderno:

- **Frontend:** [React](https://reactjs.org/) (v19) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (v4) + Animações com [Motion](https://motion.dev/)
- **Backend & BD:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Ícones & UI:** [Lucide React](https://lucide.dev/) + Canvas Confetti

## 🚀 Como Rodar Localmente

Siga os passos abaixo para testar o aplicativo em sua própria máquina.

### Pré-requisitos
- **Node.js** (versão 18+)
- Uma conta no [Firebase](https://firebase.google.com/) (caso queira usar seu próprio banco de dados e Auth).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/leooaguiarr/torneio_trono.git
   cd torneio_trono
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   - Crie um arquivo `.env.local` na raiz do projeto (você pode usar o `.env.example` como base).
   - Adicione suas configurações do Firebase e, se necessário, a `GEMINI_API_KEY`.

4. **Inicie o Servidor Local:**
   ```bash
   npm run dev
   ```

5. **Acesse:** Abra o navegador em `http://localhost:3000`.

## 🤝 Contribuição & Fork

Este projeto foi feito de forma puramente recreativa. Sinta-se totalmente à vontade para fazer um **fork**, personalizar as brincadeiras e hospedar para o seu próprio grupo de amigos!

---
<div align="center">
Feito com 💩 e muita diversão!
</div>