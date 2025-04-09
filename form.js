const map = L.map('map').setView([-16.6869, -49.2648], 13); // Goiânia

// Marca do Leaflet
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

map.on('click', async function (e) {
    const { lat, lng } = e.latlng;

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }

    // Preenche os campos ocultos
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    // Reverse geocoding com Nominatim
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
        const data = await response.json();

        const address = data.address;

        const rua = address.road || '';
        const praca = address.square || '';
        const bairro = address.suburb || address.neighbourhood || '';
        const cidade = address.city || address.town || address.village || '';

        const localResumido = [praca || rua, bairro, cidade].filter(Boolean).join(', ');

        document.getElementById('local').value = localResumido || 'Endereço não encontrado';
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        document.getElementById('local').value = 'Erro ao buscar endereço';
    }
});

// Juntar data e hora ao submeter o formulário 
document.querySelector('form').addEventListener('submit', function (event) {
    const data = document.getElementById('data').value;
    let hora = document.getElementById('hora').value;

    // Se hora estiver vazia, usa a hora atual
    if (!hora) {
        const agora = new Date();
        hora = agora.toTimeString().slice(0, 5);
    }

    const dataHoraFinal = `${data} | ${hora}`;
    document.getElementById('dataHoraFinal').value = dataHoraFinal;
});
