/* ======================================================= */
/* --- FUNÇÕES GLOBAIS REUTILIZÁVEIS --- */
/* ======================================================= */
function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.style.display = 'flex';
    setTimeout(() => modalElement.classList.add('show'), 10);
}

function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('show');
    setTimeout(() => modalElement.style.display = 'none', 400);
}

document.addEventListener('click', function(event) {
    const closeTrigger = event.target.closest('.close-button, .close-modal, #modal-close-btn');
    if (closeTrigger) {
        const modalToClose = event.target.closest('.modal');
        if (modalToClose) {
            closeModal(modalToClose);
        }
    }

    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    /* ======================================================= */
    /* --- LÓGICA GLOBAL DO TEMA --- */
    /* ======================================================= */
    const themeToggleButton = document.getElementById('theme-toggle-btn');

    if (themeToggleButton) {
        const body = document.body; // <<<< O ALVO CORRETO
        const currentTheme = localStorage.getItem('theme');


        // Função central para aplicar o tema
        const applyTheme = (theme) => {
            body.setAttribute('data-theme', theme); // <<<< APLICA NO BODY
            
            const icon = themeToggleButton.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            localStorage.setItem('theme', theme);
        };

        // Aplica o tema inicial ao carregar a página
        if (currentTheme) {
            applyTheme(currentTheme);
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }

        // Adiciona o evento de clique para alternar o tema
        themeToggleButton.addEventListener('click', () => {
            const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    /* ======================================================= */
    /* --- LÓGICA GLOBAL DO MODAL DE CONTATO --- */
    /* ======================================================= */
    const contactLink = document.getElementById('global-contact-link');
    const modalPlaceholder = document.createElement('div');
    modalPlaceholder.id = 'contact-modal-placeholder';
    document.body.appendChild(modalPlaceholder);

    let isModalLoaded = false;

    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            const contactModal = document.getElementById('contact-modal');

            if (isModalLoaded && contactModal) {
                openModal(contactModal);
            } else if (!isModalLoaded) {
                fetch('/public/comum/modal_contato.html')
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.text();
                    })
                    .then(html => {
                        modalPlaceholder.innerHTML = `<div class="modal" id="contact-modal">${html}</div>`;
                        isModalLoaded = true;
                        const newModal = document.getElementById('contact-modal');
                        
                        newModal.querySelector('.close-button').addEventListener('click', () => closeModal(newModal));
                        newModal.querySelector('.close-modal').addEventListener('click', () => closeModal(newModal));
                        newModal.addEventListener('click', (event) => {
                            if (event.target === newModal) closeModal(newModal);
                        });

                        openModal(newModal);
                    })
                    .catch(error => console.error('Error fetching contact modal:', error));
            }
        });
    }

    /* ======================================================= */
    /* --- LÓGICA GLOBAL PARA O BOTÃO VOLTAR AO TOPO --- */
    /* ======================================================= */
    const backToTopButton = document.getElementById('back-to-top-btn');

    if (backToTopButton) {
    window.addEventListener('scroll', () => {
        // Se o usuário rolou mais de 300px para baixo
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
}
});
