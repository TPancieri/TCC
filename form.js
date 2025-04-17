import { configurarAutocomplete } from './autocomplete.js';

const map = L.map('map').setView([-16.6869, -49.2648], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;
const markerRef = { current: marker };


map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  document.getElementById('latitude').value = lat.toFixed(6);
  document.getElementById('longitude').value = lng.toFixed(6);

  if (markerRef.current) {
    markerRef.current.setLatLng([lat, lng]);
  } else {
    markerRef.current = L.marker([lat, lng]).addTo(map);
  }

  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
    const data = await resp.json();
    const addr = data.address;
    const rua = addr.road || '';
    const praca = addr.square || '';
    const bairro = addr.suburb || addr.neighbourhood || '';
    const cidade = addr.city || addr.town || addr.village || '';
    const localResumido = [praca || rua, bairro, cidade].filter(Boolean).join(', ');
    document.getElementById('local').value = localResumido || 'Endereço não encontrado';
  } catch {
    document.getElementById('local').value = 'Erro ao buscar endereço';
  }
});

// Data e hora no submit
document.getElementById('relatoForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const agora = new Date();
  document.getElementById('data').value = agora.toISOString().split('T')[0];
  document.getElementById('hora').value = agora.toTimeString().slice(0,5);
  e.target.submit();
  alert('Relato enviado com sucesso!');
});

// Controle de localização do Leaflet
const locateControl = L.control({ position: 'topleft' });
locateControl.onAdd = () => {
  const btn = L.DomUtil.create('button', 'leaflet-control-locate');
  btn.title = 'Usar minha localização atual';
  btn.type = 'button';

  btn.onclick = () => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
      timeout: 10000
    });
  };

  return btn;
};
locateControl.addTo(map);

// Ao encontrar a localização
map.on('locationfound', async (e) => {
  const { lat, lng } = e.latlng;
  document.getElementById('latitude').value = lat.toFixed(6);
  document.getElementById('longitude').value = lng.toFixed(6);

  if (markerRef.current) {
    markerRef.current.setLatLng(e.latlng);
  } else {
    markerRef.current = L.marker(e.latlng).addTo(map);
  }

  // reverse geocode para preencher o campo local
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
    const data = await resp.json();
    const addr = data.address;
    const rua = addr.road || '';
    const praca = addr.square || '';
    const bairro = addr.suburb || addr.neighbourhood || '';
    const cidade = addr.city || addr.town || addr.village || '';
    const localResumido = [praca || rua, bairro, cidade].filter(Boolean).join(', ');
    document.getElementById('local').value = localResumido || 'Endereço não encontrado';
  } catch {
    document.getElementById('local').value = 'Erro ao buscar endereço';
  }
});

// Se falhar ao localizar
map.on('locationerror', () => {
  alert('Não foi possível acessar sua localização.');
});

// inicializar autocomplete
configurarAutocomplete('local', map, markerRef);


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
