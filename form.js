const map = L.map('map').setView([-16.6869, -49.2648], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

map.on('click', async function (e) {
  const { lat, lng } = e.latlng;
  document.getElementById('latitude').value = lat.toFixed(6);
  document.getElementById('longitude').value = lng.toFixed(6);

  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }

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
  } catch (err) {
    console.error(err);
    document.getElementById('local').value = 'Erro ao buscar endereço';
  }
});

document.getElementById('relatoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const agora = new Date();
  const dataFormatada = agora.toISOString().split('T')[0];
  const horaFormatada = agora.toTimeString().split(' ')[0].slice(0, 5);

  document.getElementById('data').value = dataFormatada;
  document.getElementById('hora').value = horaFormatada;

  e.target.submit();
  alert('Relato enviado com sucesso!');
});

// Autocomplete de endereço
const localInput = document.getElementById('local');
let timeout = null;
let suggestionsDiv;

function criarSugestoesDiv() {
  suggestionsDiv = document.createElement('div');
  suggestionsDiv.classList.add('autocomplete-suggestions');
  localInput.parentNode.appendChild(suggestionsDiv);
}

function mostrarSugestoes(sugestoes) {
  suggestionsDiv.innerHTML = '';

  sugestoes.forEach(item => {
    const option = document.createElement('div');
    option.classList.add('autocomplete-option');
    option.textContent = item.display_name;

    option.addEventListener('click', () => {
      localInput.value = item.display_name;
      document.getElementById('latitude').value = item.lat;
      document.getElementById('longitude').value = item.lon;

      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      if (marker) {
        marker.setLatLng([lat, lon]);
      } else {
        marker = L.marker([lat, lon]).addTo(map);
      }
      map.setView([lat, lon], 16);

      suggestionsDiv.innerHTML = '';
    });

    suggestionsDiv.appendChild(option);
  });
}

localInput.addEventListener('input', () => {
  const query = localInput.value.trim();

  if (!suggestionsDiv) criarSugestoesDiv();
  if (timeout) clearTimeout(timeout);

  if (query.length < 3) {
    suggestionsDiv.innerHTML = '';
    return;
  }

  timeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await res.json();
      mostrarSugestoes(data);
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
    }
  }, 500);
});

document.addEventListener('click', (e) => {
  if (suggestionsDiv && !suggestionsDiv.contains(e.target) && e.target !== localInput) {
    suggestionsDiv.innerHTML = '';
  }
});

      // Lógica de upload de imagem 
      /*
      const foto = document.getElementById('foto').files[0];
      if (!foto) {
        alert("Por favor, envie uma imagem.");
        return;
      }

      const uploadData = new FormData();
      uploadData.append('file', foto);
      uploadData.append('upload_preset', 'form_preset');

      try {
        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/dwxku8hlr/image/upload', {
          method: 'POST',
          body: uploadData
        });

        const uploadJson = await uploadRes.json();
        if (uploadJson.error) {
          throw new Error(uploadJson.error.message);
        }

        document.getElementById('imagemUrl').value = uploadJson.secure_url;

        e.target.submit();
        alert('Relato enviado com sucesso!');
      } catch (error) {
        console.error("Erro no upload da imagem:", error);
        alert("Erro ao enviar a imagem: " + error.message);
      }
      */
