// Inicializa o mapa
const map = L.map('mapa').setView([-16.6869, -49.2648], 13); // Goiânia

// Adiciona camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Ícones personalizados
const redIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41]
});

let marcadoresAlagamento = []; // para controlar os marcadores visíveis
let todosDados = []; // armazenar os dados originais

// --- Função 1: carregar Pontos de Coleta (vermelhos) ---
async function carregarPontosColeta() {
  try {
    const response = await fetch('coordenadas.json');
    const dados = await response.json();

    Object.keys(dados).forEach(nome => {
      const ponto = dados[nome];
      if (ponto) {
        const circle = L.circle([ponto.lat, ponto.lon], {
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.3,
          radius: 1500
        }).addTo(map);

        const marker = L.marker([ponto.lat, ponto.lon], { icon: redIcon }).addTo(map);
        const popupContent = `<strong>${nome}</strong><br>${ponto.full_name}`;
        circle.bindPopup(popupContent);
        marker.bindPopup(popupContent);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar pontos de coleta:', error);
  }
}

// --- Função 2: carregar Locais de Alagamento (azuis) ---
async function carregarLocaisAlagamento() {
  try {
    const response = await fetch('alagamentos_completo.json');
    const dados = await response.json();
    todosDados = dados;

    // Cria opções de filtro dinâmicas
    const anos = [...new Set(dados.map(p => new Date(p.data).getFullYear()))].sort((a, b) => b - a);
    const filtroSelect = document.getElementById('filtroAno');

    anos.forEach(ano => {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      filtroSelect.appendChild(option);
    });

    // Exibe todos inicialmente
    atualizarMapa('todos');

    // Evento de filtro
    filtroSelect.addEventListener('change', (e) => {
      atualizarMapa(e.target.value);
    });
  } catch (error) {
    console.error('Erro ao carregar locais de alagamento:', error);
  }
}

// --- Função 3: atualizar marcadores com base no filtro ---
function atualizarMapa(anoSelecionado) {
  // Remove marcadores antigos
  marcadoresAlagamento.forEach(m => map.removeLayer(m));
  marcadoresAlagamento = [];

  const filtrados = anoSelecionado === 'todos'
    ? todosDados
    : todosDados.filter(p => new Date(p.data).getFullYear().toString() === anoSelecionado);

  filtrados.forEach(ponto => {
    const marker = L.marker([ponto.lat, ponto.lon], { icon: blueIcon })
      .bindPopup(`<strong>${ponto.local}</strong><br>Data: ${ponto.data}`)
      .addTo(map);
    marcadoresAlagamento.push(marker);
  });
}

// Executa as duas funções
carregarPontosColeta();
carregarLocaisAlagamento();

