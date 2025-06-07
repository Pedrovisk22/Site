document.addEventListener('DOMContentLoaded', () => {
    const rankingContentSection = document.getElementById('ranking-content-section');
    const searchInput = document.getElementById('rankingSearchInput');
    const searchBtn = document.getElementById('rankingSearchBtn');
    const paginationControls = document.querySelector('.pagination-controls');
    const pageSizeSelection = document.querySelector('.page-size-selection');
    const loadingOverlay = document.getElementById('loading-overlay');
    const rankingTableBody = document.querySelector('.ranking-table tbody');
    const rankingTableContainer = document.getElementById('ranking-table-container');
    const noResultsMessage = rankingContentSection ? rankingContentSection.querySelector('.no-results') : null;

    let currentState = {
        currentPage: parseInt(rankingContentSection?.dataset.currentPage, 10) || 1,
        totalPages: parseInt(rankingContentSection?.dataset.totalPages, 10) || 1,
        pageSize: parseInt(rankingContentSection?.dataset.pageSize, 10) || 5,
        rankingType: rankingContentSection?.dataset.rankingType || 'level',
        search: rankingContentSection?.dataset.searchTerm || '',
        availablePageSizes: JSON.parse(pageSizeSelection?.dataset.availablePageSizes || '[]')
    };
    
    const showLoading = () => {
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    };

    const hideLoading = () => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    };

    const updateURL = (page, pageSize, search) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        url.searchParams.set('pageSize', pageSize);
        url.searchParams.set('search', search);
        history.pushState(null, '', url.toString());
    };

    const preloadImages = (players) => {
        if (!players || players.length === 0) return Promise.resolve();
        const promises = players.map(player => new Promise((resolve) => {
            const avatarImg = new Image();
            avatarImg.src = `/avatar/${player.name}`;
            avatarImg.onload = resolve;
            avatarImg.onerror = resolve; // Continue mesmo se a imagem falhar
            
            // Pré-carregar a bandeira também, usando player.flagCode que já veio do servidor
            const flagImg = new Image();
            flagImg.src = `assets/svg/flags/${player.flagCode || 'BR'}.svg`;
            flagImg.onload = resolve;
            flagImg.onerror = resolve; // Continue mesmo se a imagem falhar
        }));
        return Promise.all(promises);
    };

    const fetchRankingData = async (page, pageSize, search) => {
        showLoading();
        const url = new URL('/ranking', window.location.origin);
        url.searchParams.set('type', currentState.rankingType);
        url.searchParams.set('search', search);
        url.searchParams.set('page', page);
        url.searchParams.set('pageSize', pageSize);

        try {
            const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            await preloadImages(data.players);
            
            currentState = { ...currentState, ...data };
            updateRankingTable(data.players);
            updatePaginationControls(data.currentPage, data.totalPages);
            updatePageSizeButtons(data.pageSize);
            updateNoResultsMessage(data.players.length > 0);
            updateURL(data.currentPage, data.pageSize, data.search);

        } catch (error) {
            console.error('Erro ao buscar dados do ranking:', error);
            updateRankingTable([]); // Limpa a tabela em caso de erro
            updatePaginationControls(1, 1); // Resetar paginação
            updateNoResultsMessage(false); // Exibe mensagem de "sem resultados"
            if (noResultsMessage) {
                noResultsMessage.textContent = 'Ocorreu um erro ao carregar o ranking. Tente novamente mais tarde.';
                noResultsMessage.style.display = 'block';
            }
        } finally {
            hideLoading();
        }
    };

    const updateRankingTable = (players) => {
        if (!rankingTableBody) return;
        rankingTableBody.innerHTML = ''; // Limpa a tabela existente

        if (!players || players.length === 0) {
            if (rankingTableContainer) rankingTableContainer.style.display = 'none';
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            if (paginationControls) paginationControls.style.display = 'none'; // Oculta paginação se não há resultados
            return;
        }
        
        // Exibe a tabela e paginação se houver resultados
        if (rankingTableContainer) rankingTableContainer.style.display = 'block';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
        if (paginationControls) paginationControls.style.display = 'flex';

        players.forEach((player, index) => {
            const globalRank = (currentState.currentPage - 1) * currentState.pageSize + index + 1;
            let rankClass = '';
            if (globalRank === 1) rankClass = 'top-1';
            else if (globalRank === 2) rankClass = 'top-2';
            else if (globalRank === 3) rankClass = 'top-3';

            const isPlayerLoggedIn = window.user && player.account_id === window.user.id;
            const avatarUrl = `/avatar/${player.name}`;
            // Usa player.flagCode que é adicionado no server.js
            const flagUrl = `assets/svg/flags/${player.flagCode || 'BR'}.svg`; // Default para BR no cliente também, por segurança.

            const row = document.createElement('tr');
            row.className = `${rankClass} ${isPlayerLoggedIn ? 'is-logged-in' : ''}`.trim();
            row.dataset.playerId = player.id;
            row.innerHTML = `
                <td class="rank-cell">${globalRank}</td>
                <td class="player-cell">
                    <div class="ranked-avatar-wrapper">
                        <img src="${avatarUrl}" alt="${player.name} Avatar">
                    </div>
                    <div class="ranked-name">
                        <a href="/character/${player.name}">
                            ${isPlayerLoggedIn ? `${player.name} (VOCÊ)` : player.name}
                        </a>
                    </div>
                    <img src="${flagUrl}" alt="Bandeira do Jogador" class="player-flag">
                </td>
                <td class="value-cell">
                    <div class="level-circle ${rankClass}">
                        <span>${player.level}</span>
                    </div>
                </td>`;
            rankingTableBody.appendChild(row);
        });
    };

    const updatePaginationControls = (currentPage, totalPages) => {
        if (!paginationControls || totalPages <= 1) {
            if(paginationControls) paginationControls.innerHTML = '';
            return;
        }
        paginationControls.innerHTML = '';

        const createButton = (id, disabled) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.id = id;
            btn.disabled = disabled;
            btn.innerHTML = `<i class="fas fa-chevron-${id === 'prevPageBtn' ? 'left' : 'right'}"></i>`;
            return btn;
        };
        const createPageLink = (page, isActive) => {
            const link = document.createElement('a');
            link.href = "#";
            link.className = `page-number ${isActive ? 'active' : ''}`;
            link.dataset.page = page;
            link.textContent = page;
            return link;
        };

        paginationControls.appendChild(createButton('prevPageBtn', currentPage === 1));

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Ajusta startPage se houver menos de maxPagesToShow no final
        if (endPage - startPage + 1 < maxPagesToShow && totalPages > maxPagesToShow) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            endPage = totalPages;
        }


        if (startPage > 1) {
            paginationControls.appendChild(createPageLink(1, false));
            if (startPage > 2) paginationControls.insertAdjacentHTML('beforeend', '<span class="pagination-dots">...</span>');
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationControls.appendChild(createPageLink(i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) paginationControls.insertAdjacentHTML('beforeend', '<span class="pagination-dots">...</span>');
            paginationControls.appendChild(createPageLink(totalPages, false));
        }

        paginationControls.appendChild(createButton('nextPageBtn', currentPage === totalPages));
        paginationControls.dataset.currentPage = currentPage;
        paginationControls.dataset.totalPages = totalPages;
    };

    const updatePageSizeButtons = (pageSize) => {
        if (!pageSizeSelection) return;
        pageSizeSelection.querySelectorAll('.btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.pageSize, 10) === pageSize);
        });
        if (rankingContentSection) rankingContentSection.dataset.pageSize = pageSize;
    };

    const updateNoResultsMessage = (hasResults) => {
        if (noResultsMessage) {
            noResultsMessage.style.display = hasResults ? 'none' : 'block';
        }
        if (rankingTableContainer) {
            rankingTableContainer.style.display = hasResults ? 'block' : 'none';
        }
        if (paginationControls) {
             paginationControls.style.display = hasResults ? 'flex' : 'none';
        }
    };

    const handleRankingControlClick = (event) => {
        const target = event.target.closest('button, a.page-number');
        if (!target) return;
        event.preventDefault();

        let newSearch = searchInput ? searchInput.value.trim() : currentState.search;
        let newPage = currentState.currentPage;
        let newPageSize = currentState.pageSize;
        
        if (target.id === 'rankingSearchBtn') {
            if (newSearch !== currentState.search) {
                newPage = 1; // Sempre volta para a primeira página ao pesquisar
            } else {
                return; // Não faz nada se a busca não mudou
            }
        } else if (paginationControls?.contains(target)) {
            if (target.id === 'prevPageBtn' && !target.disabled) {
                newPage--;
            } else if (target.id === 'nextPageBtn' && !target.disabled) {
                newPage++;
            } else if (target.classList.contains('page-number') && target.dataset.page && !target.classList.contains('active')) {
                newPage = parseInt(target.dataset.page, 10);
            } else {
                return; // Não faz nada se o botão está desabilitado ou a página já está ativa
            }
        } else if (pageSizeSelection?.contains(target) && target.dataset.pageSize && !target.classList.contains('active')) {
            newPageSize = parseInt(target.dataset.pageSize, 10);
            if (newPageSize !== currentState.pageSize) {
                newPage = 1; // Sempre volta para a primeira página ao mudar o tamanho
            } else {
                return; // Não faz nada se o tamanho da página não mudou
            }
        } else {
            return; // Clique em um elemento não relevante
        }

        fetchRankingData(newPage, newPageSize, newSearch);
    };
    
    rankingContentSection?.addEventListener('click', handleRankingControlClick);

    searchInput?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const newSearch = searchInput.value.trim();
            if (newSearch !== currentState.search) {
                fetchRankingData(1, currentState.pageSize, newSearch);
            }
        }
    });

    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page'), 10) || 1;
        const pageSize = parseInt(urlParams.get('pageSize'), 10) || currentState.pageSize;
        const search = urlParams.get('search') || '';
        if (page !== currentState.currentPage || pageSize !== currentState.pageSize || search !== currentState.search) {
            fetchRankingData(page, pageSize, search);
        }
    });

    const lastUpdatedSpan = document.getElementById('last-updated-time');
    if (lastUpdatedSpan) {
        const now = new Date();
        lastUpdatedSpan.textContent = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // A paginação inicial e o estado são baseados nos dados do EJS,
    // e o `updateRankingTable` dentro de `fetchRankingData` (chamado no popstate/interações)
    // já lida com a renderização das bandeiras.
    // Não é mais necessário um `setInitialFlags` separado ou chamadas de update diretas no DOMContentLoaded
    // para bandeiras, pois o EJS já renderiza o `flagCode`.
    updatePaginationControls(currentState.currentPage, currentState.totalPages);
    updatePageSizeButtons(currentState.pageSize);
    updateNoResultsMessage(document.querySelectorAll('.ranking-table tbody tr').length > 0);
});