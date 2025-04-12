export function configurarAutocomplete(localInputId, map, markerRef) {
  const localInput = document.getElementById(localInputId);
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

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L.marker([lat, lon]).addTo(map);
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
        // Restrição por bounding box de Goiânia
        const viewbox = '-49.3958,-16.5679,-49.1371,-16.8037'; // Oeste, Norte, Leste, Sul
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&viewbox=${viewbox}&bounded=1`);
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
}
