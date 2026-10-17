const mensagemEl = document.querySelector("#mensagem");
const chaveEl = document.querySelector("#chave");
const chaveDecifrarEl = document.querySelector("#chave-decifrar");
const avisoEl = document.querySelector("#aviso");
const cifradoEl = document.querySelector("#cifrado");
const recuperadaEl = document.querySelector("#recuperada");
const detalheEl = document.querySelector("#detalhe-recuperada");
const statusEl = document.querySelector("#status-recuperada");
const resumoEl = document.querySelector("#resumo-chave");
const tabelaEl = document.querySelector("#tabela");
const copiarBtn = document.querySelector("#btn-copiar");

let hexAtual = "";

function bytesDeTexto(texto) {
  return new TextEncoder().encode(texto);
}

function rc4(chave, dados) {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) S[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + S[i] + chave[i % chave.length]) & 255;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
  }

  const saida = new Uint8Array(dados.length);
  const fluxo = new Uint8Array(dados.length);
  let i = 0;
  j = 0;

  for (let n = 0; n < dados.length; n += 1) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
    const z = S[(S[i] + S[j]) & 255];
    fluxo[n] = z;
    saida[n] = dados[n] ^ z;
  }

  return { saida, fluxo };
}

function paraHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexEspacado(hex) {
  return hex.match(/.{1,2}/g)?.join(" ") ?? "";
}

function deHex(texto) {
  const limpo = texto.replace(/\s+/g, "").toLowerCase();
  if (!limpo || limpo.length % 2 !== 0 || /[^0-9a-f]/.test(limpo)) return null;
  const bytes = new Uint8Array(limpo.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(limpo.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function textoDeBytes(bytes) {
  try {
    const texto = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { texto, valido: true };
  } catch {
    return { texto: hexEspacado(paraHex(bytes)), valido: false };
  }
}

function escapar(texto) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function caractereVisivel(byte) {
  if (byte >= 32 && byte <= 126) return escapar(String.fromCharCode(byte));
  return "·";
}

function quantidade(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function exigir(condicao, mensagem) {
  if (condicao) return true;
  avisoEl.textContent = mensagem;
  return false;
}

function limparAviso() {
  avisoEl.textContent = "";
}

function marcarStatus(tipo, rotulo) {
  statusEl.className = `pill ${tipo}`;
  statusEl.textContent = rotulo;
}

function mostrarTabela(plano, fluxo, cifrado) {
  const limite = 32;
  const linhas = [];
  const total = Math.min(plano.length, limite);

  for (let n = 0; n < total; n += 1) {
    const p = plano[n];
    const z = fluxo[n];
    const c = cifrado[n];
    linhas.push(`
      <tr>
        <td>${n + 1}</td>
        <td>${caractereVisivel(p)}</td>
        <td>${p.toString(16).padStart(2, "0")}</td>
        <td>${z.toString(16).padStart(2, "0")}</td>
        <td>${c.toString(16).padStart(2, "0")}</td>
        <td>${(p ^ z).toString(16).padStart(2, "0")}</td>
      </tr>
    `);
  }

  if (plano.length > limite) {
    linhas.push(`<tr><td colspan="6" class="empty">Mais ${plano.length - limite} bytes ocultos nesta tabela.</td></tr>`);
  }

  tabelaEl.innerHTML = linhas.join("");
}

function descreverChave(chave, quantidadeBytes) {
  const amostra = [...chave].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join(" ");
  const resto = chave.length > 8 ? "…" : "";
  resumoEl.textContent = `A chave tem ${quantidade(chave.length, "byte", "bytes")} (${amostra}${resto}) e gerou ${quantidade(quantidadeBytes, "byte", "bytes")} de fluxo. O texto cifrado guarda só o resultado do XOR.`;
}

function cifrar() {
  limparAviso();
  const mensagem = mensagemEl.value;
  const chaveTexto = chaveEl.value;

  if (!exigir(mensagem.length > 0, "Digite a mensagem original.")) return;
  if (!exigir(chaveTexto.length > 0, "Digite a chave.")) return;

  const chave = bytesDeTexto(chaveTexto);
  const plano = bytesDeTexto(mensagem);
  const { saida, fluxo } = rc4(chave, plano);

  hexAtual = paraHex(saida);
  cifradoEl.textContent = hexEspacado(hexAtual);
  copiarBtn.disabled = false;
  chaveDecifrarEl.value = chaveTexto;

  const recuperado = textoDeBytes(rc4(chave, saida).saida);
  recuperadaEl.textContent = recuperado.texto;
  detalheEl.textContent = "A decifragem usou a mesma chave e recriou o mesmo fluxo.";
  marcarStatus("ok", "Chave correta");
  descreverChave(chave, plano.length);
  mostrarTabela(plano, fluxo, saida);
}

function decifrar() {
  limparAviso();
  const cifra = deHex(cifradoEl.textContent);
  const chaveTexto = chaveDecifrarEl.value || chaveEl.value;

  if (!exigir(cifra, "O texto cifrado precisa estar em hexadecimal, com pares de dígitos.")) return;
  if (!exigir(chaveTexto.length > 0, "Digite a chave de decifragem.")) return;

  const chave = bytesDeTexto(chaveTexto);
  const { saida, fluxo } = rc4(chave, cifra);
  const recuperado = textoDeBytes(saida);
  recuperadaEl.textContent = recuperado.texto;

  const original = mensagemEl.value;
  const bateu = recuperado.valido && recuperado.texto === original;

  if (bateu) {
    detalheEl.textContent = "A mensagem original foi recuperada.";
    marcarStatus("ok", "Chave correta");
  } else if (!recuperado.valido) {
    detalheEl.textContent = "Esta chave não produziu texto legível.";
    marcarStatus("bad", "Chave diferente");
  } else {
    detalheEl.textContent = "O resultado não é a mensagem original.";
    marcarStatus("bad", "Chave diferente");
  }

  descreverChave(chave, cifra.length);
  mostrarTabela(saida, fluxo, cifra);
}

function carregarExemplo() {
  mensagemEl.value = "Plaintext";
  chaveEl.value = "Key";
  chaveDecifrarEl.value = "Key";
  cifrar();
}

async function copiar() {
  if (!hexAtual) return;
  try {
    await navigator.clipboard.writeText(hexAtual);
  } catch {
    const area = document.createElement("textarea");
    area.value = hexAtual;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  copiarBtn.textContent = "Copiado";
  setTimeout(() => {
    copiarBtn.textContent = "Copiar hex";
  }, 1200);
}

document.querySelector("#btn-cifrar").addEventListener("click", cifrar);
document.querySelector("#btn-decifrar").addEventListener("click", decifrar);
document.querySelector("#btn-exemplo").addEventListener("click", carregarExemplo);
copiarBtn.addEventListener("click", copiar);

chaveEl.addEventListener("input", () => {
  chaveDecifrarEl.value = chaveEl.value;
});

const teste = paraHex(rc4(bytesDeTexto("Key"), bytesDeTexto("Plaintext")).saida);
if (teste !== "bbf316e8d940af0ad3") {
  avisoEl.textContent = "A implementação não conferiu o vetor clássico do RC4.";
}
