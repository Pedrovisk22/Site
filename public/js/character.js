document.addEventListener('DOMContentLoaded', () => {
    // Lógica para abas (já existente)
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.target.dataset.tab;

            tabLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            e.target.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Lógica do Modal (se existir)
    const openMuralModalBtn = document.getElementById('open-mural-modal-btn');
    const editMuralModal = document.getElementById('editMuralModal');
    const closeMuralModal = document.getElementById('close-mural-modal');
    const cancelMuralEdit = document.getElementById('cancel-mural-edit');
    const muralEditTextarea = document.getElementById('mural-edit-textarea');
    const muralCharCounter = document.getElementById('mural-char-counter');
    const muralDisplay = document.getElementById('mural-display-text');
    const muralEditForm = document.getElementById('mural-edit-form');

    if (openMuralModalBtn) {
        openMuralModalBtn.addEventListener('click', () => {
            editMuralModal.style.display = 'block';
            updateMuralCharCounter(); // Atualiza contador ao abrir
        });

        closeMuralModal.addEventListener('click', () => {
            editMuralModal.style.display = 'none';
        });

        cancelMuralEdit.addEventListener('click', () => {
            editMuralModal.style.display = 'none';
        });

        muralEditTextarea.addEventListener('input', updateMuralCharCounter);

        function updateMuralCharCounter() {
            const currentLength = muralEditTextarea.value.length;
            const maxLength = muralEditTextarea.maxLength;
            muralCharCounter.textContent = `${currentLength}/${maxLength}`;
        }

        muralEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const charId = muralEditForm.dataset.charId;
            const muralMessage = muralEditTextarea.value;

            try {
                const response = await fetch(`/api/character/${charId}/mural`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ muralMessage })
                });

                if (response.ok) {
                    const data = await response.json();
                    muralDisplay.textContent = `"${data.mural_message || 'Este treinador ainda não definiu uma mensagem.'}"`;
                    editMuralModal.style.display = 'none';
                    alert('Mural atualizado com sucesso!');
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao atualizar mural: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Erro de rede ou servidor:', error);
                alert('Ocorreu um erro ao conectar com o servidor.');
            }
        });
    }

    // Lógica para copiar o link (já existente)
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const profileUrl = document.getElementById('profile-url');
            profileUrl.select();
            profileUrl.setSelectionRange(0, 99999); // Para mobile

            navigator.clipboard.writeText(profileUrl.value)
                .then(() => {
                    copyLinkBtn.classList.add('copied');
                    copyLinkBtn.dataset.tooltip = 'Link copiado!';
                    setTimeout(() => {
                        copyLinkBtn.classList.remove('copied');
                        copyLinkBtn.dataset.tooltip = 'Copiar link do perfil';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Falha ao copiar:', err);
                    alert('Erro ao copiar o link. Por favor, tente novamente.');
                });
        });
    }


    // Lógica de Filtro e Pesquisa para as tabelas (NOVO)
    const searchInputs = document.querySelectorAll('.tab-controls .search-input');
    const filterSelects = document.querySelectorAll('.tab-controls .filter-select');

    function applyFilters() {
        searchInputs.forEach(searchInput => {
            const searchTerm = searchInput.value.toLowerCase();
            const targetListId = searchInput.dataset.target;
            const tableBody = document.querySelector(`[data-list-id="${targetListId}"] tbody`);

            if (!tableBody) return;

            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                let isSearchMatch = true;
                let isFilterMatch = true;

                // Checa a pesquisa
                if (searchTerm) {
                    const rowText = row.textContent.toLowerCase();
                    if (!rowText.includes(searchTerm)) {
                        isSearchMatch = false;
                    }
                }

                // Checa o filtro (se houver um select para esta lista)
                const filterSelect = document.querySelector(`.filter-select[data-target="${targetListId}"]`);
                if (filterSelect && filterSelect.value) {
                    const filterValue = filterSelect.value.toLowerCase();
                    // Lógica de filtro mais específica por tipo/raridade/assassino
                    if (targetListId === 'captured-list') {
                        const rarity = row.dataset.pokemonRarity;
                        const type = row.dataset.pokemonType;
                        if (filterValue === 'shiny') {
                            isFilterMatch = (type === 'shiny');
                        } else {
                            isFilterMatch = (rarity === filterValue);
                        }
                    } else if (targetListId === 'defeated-list') {
                        const type = row.dataset.pokemonType;
                        isFilterMatch = (type === filterValue);
                    } else if (targetListId === 'deaths-list') {
                        const killerType = row.dataset.killerType; // Adicione data-killer-type no HTML
                        isFilterMatch = (killerType === filterValue);
                    }
                }

                if (isSearchMatch && isFilterMatch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    searchInputs.forEach(input => input.addEventListener('input', applyFilters));
    filterSelects.forEach(select => select.addEventListener('change', applyFilters));
});