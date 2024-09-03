document.addEventListener('DOMContentLoaded', () => {
  init();
});

const state = {
  currentNumbers: Array(7).fill(null).map(() => []), // Inicializa com 7 colunas, cada uma com array vazio
  savedGames: [],
  numbers: Array.from({ length: 10 }, (_, i) => i), // Números de 0 a 9
  betType: 'simple' // Tipo de aposta inicial
};

function init() {
  renderColumns();
  renderButtons();
  loadSavedGames();
  updateBetType(); // Inicializa com o tipo de aposta padrão
}

function renderColumns() {
  const columnsDiv = document.getElementById('super7-columns');
  columnsDiv.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const columnDiv = document.createElement('div');
    columnDiv.classList.add('column');
    
    const h3 = document.createElement('h3');
    h3.textContent = `Coluna ${i + 1}`;
    columnDiv.appendChild(h3);
    
    const ul = document.createElement('ul');
    ul.classList.add('numbers');
    
    state.numbers.forEach(num => {
      const li = document.createElement('li');
      li.textContent = num;
      li.classList.add('number');
      li.addEventListener('click', () => selectNumber(i, num));
      ul.appendChild(li);
    });

    columnDiv.appendChild(ul);
    columnsDiv.appendChild(columnDiv);
  }
}

function selectNumber(columnIndex, number) {
  if (state.currentNumbers[columnIndex].includes(number)) {
    state.currentNumbers[columnIndex] = state.currentNumbers[columnIndex].filter(num => num !== number);
  } else {
    if (canSelectNumber(columnIndex)) {
      state.currentNumbers[columnIndex].push(number);
    }
  }
  updateColumnSelection();
  checkGameComplete();
}

function canSelectNumber(columnIndex) {
  const numSelected = state.currentNumbers[columnIndex].length;
  if (state.betType === 'simple') {
    return numSelected < 1; // Máximo de 1 número por coluna para aposta simples
  } else {
    const totalSelected = state.currentNumbers.flat().length;
    return numSelected < (state.betType === 'multiple' ? 
      (totalSelected >= 8 && totalSelected <= 14 ? 2 : 3) : 1); // Validação para apostas múltiplas
  }
}

function updateColumnSelection() {
  const columnDivs = document.querySelectorAll('.column');
  
  columnDivs.forEach((columnDiv, index) => {
    const numbers = columnDiv.querySelectorAll('.number');
    numbers.forEach(numberDiv => {
      const number = parseInt(numberDiv.textContent, 10);
      if (state.currentNumbers[index].includes(number)) {
        numberDiv.classList.add('selected-number');
      } else {
        numberDiv.classList.remove('selected-number');
      }
    });
  });
}

function checkGameComplete() {
  const gameComplete = state.currentNumbers.every(nums => nums.length > 0);
  document.getElementById('super7-save-button').disabled = !gameComplete;
}

function renderButtons() {
  const divButtons = document.getElementById('super7-buttons');
  divButtons.innerHTML = '';

  divButtons.appendChild(renderNewGameButton());
  divButtons.appendChild(renderRandomGameButton());
  divButtons.appendChild(renderSaveGameButton());
  divButtons.appendChild(renderClearSavedGamesButton());
  divButtons.appendChild(renderExportGamesButton());
}

function renderNewGameButton() {
  const li = document.createElement('li');
  li.classList.add('button');

  const button = document.createElement('button');
  button.textContent = 'Novo jogo';
  button.addEventListener('click', () => {
    state.currentNumbers = Array(7).fill(null).map(() => []);
    updateColumnSelection();
    checkGameComplete();
  });

  li.appendChild(button);
  return li;
}

function renderRandomGameButton() {
  const li = document.createElement('li');
  li.classList.add('button');

  const button = document.createElement('button');
  button.textContent = 'Jogo aleatório';
  button.addEventListener('click', () => {
    generateRandomGame();
    checkGameComplete(); // Verifica se o jogo gerado é completo antes de habilitar o botão de salvar
  });

  li.appendChild(button);
  return li;
}

function renderSaveGameButton() {
  const li = document.createElement('li');
  li.classList.add('button');

  const button = document.createElement('button');
  button.id = 'super7-save-button';
  button.textContent = 'Salvar jogo';
  button.disabled = true;
  button.addEventListener('click', saveGame);

  li.appendChild(button);
  return li;
}

function renderClearSavedGamesButton() {
  const li = document.createElement('li');
  li.classList.add('button');

  const button = document.createElement('button');
  button.textContent = 'Limpar jogos salvos';
  button.addEventListener('click', clearSavedGames);

  li.appendChild(button);
  return li;
}

function renderExportGamesButton() {
  const li = document.createElement('li');
  li.classList.add('button');

  const button = document.createElement('button');
  button.textContent = 'Exportar jogos salvos';
  button.addEventListener('click', exportSavedGames);

  li.appendChild(button);
  return li;
}

function generateRandomGame() {
  state.currentNumbers = Array(7).fill(null).map(() => []);
  
  let totalNumbers = 0;
  if (state.betType === 'simple') {
    // Para aposta simples, deve haver exatamente 7 números
    totalNumbers = 7;
  } else if (state.betType === 'multiple') {
    // Para aposta múltipla, o número total de números deve estar entre 8 e 21
    totalNumbers = Math.floor(Math.random() * (21 - 8 + 1) + 8);
  }

  const availableNumbers = Array.from({ length: 10 }, (_, i) => i);
  let numbersToPlace = totalNumbers;

  // Primeiro, garantir que cada coluna tenha pelo menos um número
  for (let i = 0; i < 7; i++) {
    if (numbersToPlace > 0) {
      const num = availableNumbers.splice(Math.floor(Math.random() * availableNumbers.length), 1)[0];
      state.currentNumbers[i].push(num);
      numbersToPlace--;
    }
  }

  // Agora, preencher o restante dos números aleatoriamente nas colunas
  while (numbersToPlace > 0) {
    const colIndex = Math.floor(Math.random() * 7);
    if (state.currentNumbers[colIndex].length < (state.betType === 'simple' ? 1 : 3)) {
      const num = availableNumbers.splice(Math.floor(Math.random() * availableNumbers.length), 1)[0];
      state.currentNumbers[colIndex].push(num);
      numbersToPlace--;
    }
  }

  updateColumnSelection();
  checkGameComplete(); // Verifica se o jogo gerado é completo e habilita o botão de salvar
}

function saveGame() {
  const game = state.currentNumbers.map(nums => nums.slice());
  state.savedGames.push(game);
  localStorage.setItem('saved-games-super7', JSON.stringify(state.savedGames));
  loadSavedGames();
  state.currentNumbers = Array(7).fill(null).map(() => []);
  updateColumnSelection();
  checkGameComplete();
}

function clearSavedGames() {
  state.savedGames = [];
  localStorage.removeItem('saved-games-super7');
  loadSavedGames();
}

function exportSavedGames() {
  if (state.savedGames.length === 0) {
    alert('Não há jogos salvos para exportar.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\n";

  state.savedGames.forEach(game => {
    // Garante que cada elemento seja um número simples
    const flattenedGame = game.flat(Infinity).map(value => {
      if (typeof value !== 'number') {
        console.warn('Elemento não numérico encontrado:', value);
        return value.toString(); // Converte para string caso necessário
      }
      return value;
    });

    // Adiciona cada elemento como uma nova coluna no CSV
    flattenedGame.forEach(element => {
      csvContent += element + ",";
    });

    // Adiciona uma nova linha após cada jogo
    csvContent += "\n";
  });

  // Cria um link para download do CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "jogos_salvos_super7.csv");
  document.body.appendChild(link);
  link.click();
}

function loadSavedGames() {
  const savedGamesDiv = document.getElementById('super7-saved-games');
  savedGamesDiv.innerHTML = '';

  const savedGames = localStorage.getItem('saved-games-super7');
  if (savedGames) {
    state.savedGames = JSON.parse(savedGames);
  }

  if (state.savedGames.length === 0) {
    savedGamesDiv.innerHTML = '<p>Nenhum jogo gravado até o momento.</p>';
  } else {
    const h2 = document.createElement('h2');
    h2.textContent = 'Jogos salvos';

    const ul = document.createElement('ul');
    ul.classList.add('saved-games');

    state.savedGames.forEach(game => {
      const li = document.createElement('li');
      li.textContent = game.map(col => col.join('/')).join(' | ');
      ul.appendChild(li);
    });

    savedGamesDiv.appendChild(h2);
    savedGamesDiv.appendChild(ul);
  }
}
