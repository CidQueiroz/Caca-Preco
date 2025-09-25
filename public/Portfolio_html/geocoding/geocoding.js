document.addEventListener('DOMContentLoaded', () => {
    const geocodeBtn = document.getElementById('geocode-btn');
    const modal = document.getElementById('geocoding-modal');
    const modalBody = document.getElementById('modal-description');
    const closeBtn = modal.querySelector('.close-button');

    geocodeBtn.addEventListener('click', () => {
        const cep = document.getElementById('cep-input').value;
        const number = document.getElementById('number-input').value;

        if (!cep || !number) {
            showModal("<p>Por favor, preencha o CEP e o número.</p>");
            return;
        }

        showModal("<p>Buscando...</p>");

        fetch(`https://cep.awesomeapi.com.br/json/${cep}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 404) {
                    showModal("<p>CEP não encontrado.</p>");
                } else {
                    showModal(`
                        <h2>Resultado</h2>
                        <p><b>Endereço:</b> ${data.address}, <b>Numero</b> ${number}</p>
                        <p><b>Bairro:</b> ${data.district}</p>
                        <p><b>Cidade:</b> ${data.city} -  <b>Estado:</b> ${data.state}</p>
                        <p><b>CEP:</b> ${cep}</p>
                        <p><b>Latitude:</b> ${data.lat} <b>Longitude:</b> ${data.lng}</p>
                    `);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                showModal("<p>Ocorreu um erro ao buscar o CEP.</p>");
            });
    });

    function showModal(content) {
        modalBody.innerHTML = content;
        openModal(modal);
    }
});
