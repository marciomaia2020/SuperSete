document.addEventListener("DOMContentLoaded", function () {
  const colunas = document.querySelectorAll('.coluna');

  colunas.forEach(coluna => {
    const numeros = coluna.querySelectorAll('.numero');

    numeros.forEach(numero => {
      numero.addEventListener('click', function () {
        // Alternar a seleção do número clicado
        this.classList.toggle('selecionado');
      });
    });
  });

  document.getElementById('gerarJogos').addEventListener('click', function () {
    const modo = document.getElementById('modo').value;
    let jogo = [];
    let erro = false;

    // Obter todos os números selecionados
    const selecionados = document.querySelectorAll('.numero.selecionado');
    const totalSelecionados = selecionados.length;

    if (modo === 'padrao') {
      // Modo padrão: verificar se há exatamente 1 número por coluna
      colunas.forEach((coluna, index) => {
        const selecionadosColuna = coluna.querySelectorAll('.numero.selecionado');

        if (selecionadosColuna.length !== 1) {
          erro = true; // Marca um erro se houver mais de um ou nenhum número selecionado na coluna
        } else {
          jogo.push(selecionadosColuna[0].textContent);
        }
      });

      if (!erro && jogo.length === 7) {
        // Exibir o jogo gerado em um elemento HTML
        const resultado = document.getElementById('resultado');
        resultado.innerHTML = `<div class="resultado-box resultado-correto">Jogo Gerado: <span class="resultado-numeros">${jogo.join(' | ')}</span></div>`;

        // Habilitar botões de exportação
        document.getElementById('exportExcel').disabled = false;
        document.getElementById('exportTxt').disabled = false;

        // Limpar as seleções
        colunas.forEach(coluna => {
          coluna.querySelectorAll('.numero').forEach(n => n.classList.remove('selecionado'));
        });
      } else if (erro) {
        alert('Por favor, selecione exatamente um número em cada coluna.');
      }

    } else if (modo === 'personalizado') {
      // Modo personalizado: verificar o total e a distribuição dos números
      if (totalSelecionados < 8 || totalSelecionados > 21) {
        erro = true;
        alert('Você deve selecionar entre 8 e 21 números.');
      } else {
        colunas.forEach((coluna, index) => {
          const selecionadosColuna = coluna.querySelectorAll('.numero.selecionado');
          const selecionadosCount = selecionadosColuna.length;

          if (totalSelecionados >= 8 && totalSelecionados <= 14) {
            // Para 8 a 14 números, cada coluna deve ter 1 ou 2 números
            if (selecionadosCount < 1 || selecionadosCount > 2) {
              erro = true;
            }
          } else if (totalSelecionados >= 15 && totalSelecionados <= 21) {
            // Para 15 a 21 números, cada coluna deve ter 2 ou 3 números
            if (selecionadosCount < 2 || selecionadosCount > 3) {
              erro = true;
            }
          }
        });

        if (erro) {
          alert('Número inválido de seleções em uma ou mais colunas. Verifique os requisitos para o número total de seleções.');
        } else {
          // Adicionar números selecionados ao jogo sem rótulos
          jogo = Array.from(selecionados).map(n => n.textContent);

          // Exibir o jogo gerado em um elemento HTML com fundo destacado e bordas arredondadas
          const resultado = document.getElementById('resultado');
          
          // Formatando a exibição dos resultados por coluna
          let resultadoFormatado = '<div class="resultado-box">Jogo Gerado: <div class="resultado-numeros">';
          colunas.forEach((coluna, index) => {
            const selecionadosColuna = coluna.querySelectorAll('.numero.selecionado');
            const numerosColuna = Array.from(selecionadosColuna).map(n => n.textContent).join(', ');
            resultadoFormatado += `<div class="coluna-formatada">Coluna ${index + 1}: ${numerosColuna}</div>`;
          });
          resultadoFormatado += '</div></div>';
          
          resultado.innerHTML = resultadoFormatado;

          // Habilitar botões de exportação
          document.getElementById('exportExcel').disabled = false;
          document.getElementById('exportTxt').disabled = false;

          // Limpar as seleções
          colunas.forEach(coluna => {
            coluna.querySelectorAll('.numero').forEach(n => n.classList.remove('selecionado'));
          });
        }
      }
    }
  });
});

/* Função para obter o jogo gerado */
function obterJogoGerado() {
  const resultado = document.getElementById('resultado');
  return Array.from(resultado.querySelectorAll('.resultado-numeros')).map(n => n.textContent.split(' | ')).flat();
}

/* Evento de clique para os botões */
document.getElementById('exportExcel').addEventListener('click', function () {
  const jogo = obterJogoGerado(); // Função que retorna os números gerados
  exportToExcel(jogo);
});

document.getElementById('exportTxt').addEventListener('click', function () {
  const jogo = obterJogoGerado(); // Função que retorna os números gerados
  exportToText(jogo);
});

/* EXPORTAÇÃO PARA EXCEL */
function exportToExcel(jogo) {
  // Cria uma matriz onde cada número é colocado em uma célula separada horizontalmente na primeira linha
  const wsData = [jogo];

  // Converte a matriz em uma planilha, começando na célula A1
  const ws = XLSX.utils.aoa_to_sheet(wsData, {origin: 'A1'});

  // Adiciona estilos de centralização
  ws['!cols'] = wsData[0].map(() => ({ wpx: 20})); // Define uma largura padrão para as colunas (pode ajustar se necessário)

  // Adiciona estilos para centralizar o conteúdo das células
  Object.keys(ws).forEach(cell => {
    if (cell[0] === 'A' || cell[0] === 'B' || cell[0] === 'C' || cell[0] === 'D') {
      ws[cell].s = {
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        }
      };
    }
  });

  // Cria um novo livro de trabalho e adiciona a planilha
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jogo");

  // Converte o livro de trabalho em um arquivo e aciona o download
  XLSX.writeFile(wb, 'JogosSuper7.xlsx');
}

/* EXPORTAÇÃO PARA TXT */
function exportToText(jogo) {
  // Cria um conteúdo de texto com os números separados por espaço
  const texto = jogo.join(' ');

  // Cria um blob com o conteúdo de texto
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });

  // Cria um link para download do blob
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'JogosSuper7.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
