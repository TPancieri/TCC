
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

        // Preenche data e hora automaticamente
        const agora = new Date();
        const dataFormatada = agora.toISOString().split('T')[0]; // yyyy-mm-dd
        const horaFormatada = agora.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

        document.getElementById('data').value = dataFormatada;
        document.getElementById('hora').value = horaFormatada;

        // Enviar o formulário (sem imagem por enquanto)
        e.target.submit();

        alert('Relato enviado com sucesso!');
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
