const mapaPrincipalDiv = document.getElementById("mapa");
const mapaAlternativoDiv = document.getElementById("mapaAlternativo");
const toggleBtn = document.getElementById("toggleMapa");

let mostrandoAlternativo = false;

toggleBtn.addEventListener("click", () => {
  if (mostrandoAlternativo) {

    mapaAlternativoDiv.style.display = "none";
    mapaPrincipalDiv.style.display = "block";

    toggleBtn.textContent = "Alternar para Mapa de Calor";


    setTimeout(() => {
      if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
    }, 200);

  } else {
    mapaPrincipalDiv.style.display = "none";
    mapaAlternativoDiv.style.display = "block";

    toggleBtn.textContent = "Voltar para Mapa de Ocorrências";
  }

  mostrandoAlternativo = !mostrandoAlternativo;
});


// Inicializa o mapa
const map = L.map('mapa').setView([-16.6869, -49.2648], 13); // Goiânia

// Adiciona camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Icons
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

let marcadoresAlagamento = [];
let todosDados = [];


// Carregar Pontos de Coleta 
async function carregarPontosColeta() {
  try {
    const response = await fetch('coordenadas_ajustado.json');
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


// Carregar Locais de Alagamento 
async function carregarLocaisAlagamento() {
  try {
    const response = await fetch('alagamentos_completo.json');
    const dados = await response.json();
    todosDados = dados;

    // Criar lista de anos
    const anos = [...new Set(dados.map(p => new Date(p.data).getFullYear()))]
      .sort((a, b) => b - a);

    const filtroSelect = document.getElementById('filtroAno');

    anos.forEach(ano => {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      filtroSelect.appendChild(option);
    });

    const anoPadrao = '2024';

    if (anos.includes(parseInt(anoPadrao))) {
      filtroSelect.value = anoPadrao;
      atualizarMapa(anoPadrao);
    } else {
      filtroSelect.value = 'todos';
      atualizarMapa('todos');
    }

    filtroSelect.addEventListener('change', (e) => {
      atualizarMapa(e.target.value);
    });

  } catch (error) {
    console.error('Erro ao carregar locais de alagamento:', error);
  }
}


// Atualizar marcadores com base no filtro 
function atualizarMapa(anoSelecionado) {

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


// Inicializar
carregarPontosColeta();
carregarLocaisAlagamento();


