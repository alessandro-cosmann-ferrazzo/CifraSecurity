# Demonstração da Cifra RC4

Aplicação web interativa para demonstração prática e didática do funcionamento do algoritmo de criptografia simétrica **RC4** (*Rivest Cipher 4*).

Desenvolvido para a disciplina de **Cyber Security** do curso de **Engenharia da Computação**.

## 👨‍💻 Autores

* **Daniel Arcego Babicz**
* **Alessandro Cosmann Ferrazzo**

## 📌 Sobre o Projeto

O RC4 é uma cifra de fluxo (*stream cipher*) simétrica que opera combinando byte a byte o texto original com um fluxo pseudoaleatório gerado a partir de uma chave secreta.

Este projeto foi construído para fornecer uma visualização clara e em tempo real de todas as etapas internas do algoritmo, permitindo entender visualmente como uma chave transforma uma mensagem em bytes cifrados via **XOR** e como a decifragem recupera o conteúdo original.

## ✨ Funcionalidades

* **Cifragem e Decifragem em Tempo Real:** Converte qualquer mensagem de texto em formato hexadecimal e vice-versa.
* **Tabela de Inspeção Byte a Byte:** Exibe detalhadamente até 32 bytes da operação, detalhando:
  * Byte original em caractere e hexadecimal (P).
  * Byte do fluxo gerado pela chave (Z).
  * Byte cifrado resultante (C).
  * Operação de validação por XOR (P ⊕ Z).
* **Validação de Chave:** Indicação visual se a decifragem foi bem-sucedida usando a chave correta ou se falhou devido a uma chave divergente.
* **Teste com Vetor Clássico:** Teste automatizado integrado que valida a implementação contra os vetores de teste padrão da RFC do RC4.
* **Exemplo Prático:** Botão para carregar dados de exemplo com um único clique.
* **Cópia Rápida:** Botão para copiar o resultado hexadecimal diretamente para a área de transferência.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com tecnologias puras (Vanilla JS), sem dependências externas:

* **HTML5:** Estruturação semântica e acessível da interface.
* **CSS3:** Estilização responsiva, layout em Grid e Flexbox com variáveis CSS.
* **JavaScript (ES6+):** Implementação pura do algoritmo RC4, manipulação de `Uint8Array` e `TextEncoder`/`TextDecoder`.
* **Java / Eclipse IDE:** Estrutura base de projeto Java/Eclipse para versionamento e suporte no ecossistema acadêmico.

## 🧠 Como Funciona o RC4 (Lógica do Algoritmo)

O algoritmo opera em 3 etapas principais:

1. **KSA (Key-Scheduling Algorithm):**
   * Inicializa um vetor $S$ de 256 bytes (0 a 255).
   * Embaralha o vetor $S$ utilizando a chave fornecida.

2. **PRGA (Pseudo-Random Generation Algorithm):**
   * A partir do estado do vetor $S$, gera uma sequência contínua de bytes pseudoaleatórios ($Z$), um para cada byte da mensagem.

3. **Operação XOR ($\oplus$):**
   * **Cifrar:** $C_i = P_i \oplus Z_i$
   * **Decifrar:** $P_i = C_i \oplus Z_i$
   * *Nota:* Como a mesma chave gera exatamente o mesmo fluxo $Z$, a decifragem utiliza rigorosamente o mesmo processo da cifragem.

## 🚀 Como Executar o Projeto

Como a aplicação web é feita em HTML/CSS/JS puro, **não requer instalação ou servidores node/backend**.

### Opção 1: Direto no Navegador

1. Clone ou baixe este repositório:
   ```bash
   git clone https://github.com/seu-usuario/CifraSeguranca.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador web moderno.

### Opção 2: Pelo Eclipse IDE

1. Abra o Eclipse IDE.
2. Vá em `File > Import... > Existing Projects into Workspace`.
3. Selecione a pasta do projeto.
4. Execute/visualize os arquivos estáticos na pasta do projeto.

## 📖 Exemplo de Uso

1. Abra a aplicação.
2. Clique no botão **"Carregar exemplo"** ou digite manualmente:
   * **Mensagem:** `Plaintext`
   * **Chave:** `Key`
3. Clique em **"Cifrar"**.
4. Observe o resultado retornado na caixa **Mensagem Cifrada**:
   ```text
   bb f3 16 e8 d9 40 af 0a d3
   ```
5. Experimente alterar a **Chave usada na decifragem** para verificar o comportamento da aplicação ao tentar recuperar o texto com uma chave incorreta.

## ⚠️ Limitações e Aspectos de Segurança

O RC4 possui relevância histórica e pedagógica, porém **não deve ser utilizado em ambientes de produção**:

* **Proibido em TLS/SSL:** Banido oficialmente pela RFC 7465 em 2015 devido a vulnerabilidades graves.
* **Reuso de Chave:** Se a mesma chave for utilizada em mensagens diferentes, os fluxos se anulam e expõem os textos originais ($C_1 \oplus C_2 = P_1 \oplus P_2$).
* **Vieses Estatísticos:** Os primeiros bytes do fluxo $Z$ apresentam fragilidades que viabilizam ataques como o *FMS Attack*.

## 📂 Estrutura do Repositório

```text
.
├── index.html          # Interface principal
├── styles.css          # Estilos visuais e layout responsivo
├── app.js              # Implementação do RC4 e manipulação do DOM
├── .gitignore          # Arquivos e pastas ignorados pelo Git
├── .project            # Configuração de projeto do Eclipse
└── .classpath          # Configuração do Java Classpath no Eclipse
```
