// public/js/ranking.js

document.addEventListener('DOMContentLoaded', () => {
    const rankingTypeButtons = document.querySelectorAll('.ranking-type-selection .btn');
    const searchInput = document.getElementById('rankingSearchInput');
    const searchBtn = document.getElementById('rankingSearchBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    // Função para atualizar a URL e redirecionar
    function updateRanking() {
        const currentUrl = new URL(window.location.href);
        const params = currentUrl.searchParams;

        // Tipo de ranking (level ou resets)
        const selectedType = document.querySelector('.ranking-type-selection .btn.active')?.dataset.rankingType || 'level';
        params.set('type', selectedType);

        // Termo de pesquisa
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }

        // Tamanho da página (manter o mesmo ou definir um padrão)
        // params.set('pageSize', 20); // Você pode fixar isso aqui ou tornar configurável na UI

        // Redireciona para a nova URL
        window.location.href = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
    }

    // Lógica para mudar o tipo de ranking
    rankingTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            rankingTypeButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');
            // Reseta a página para 1 ao mudar o tipo de ranking ou search
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('page', 1); // Volta para a primeira página
            window.history.pushState({}, '', currentUrl.toString()); // Atualiza URL sem recarregar
            updateRanking();
        });
    });

    // Lógica para pesquisa
    searchBtn.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('page', 1); // Volta para a primeira página
        window.history.pushState({}, '', currentUrl.toString()); // Atualiza URL sem recarregar
        updateRanking();
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click(); // Simula o clique no botão de busca
        }
    });

    // Lógica de paginação
    prevPageBtn.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        let currentPage = parseInt(currentUrl.searchParams.get('page')) || 1;
        if (currentPage > 1) {
            currentUrl.searchParams.set('page', currentPage - 1);
            window.location.href = currentUrl.toString();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        let currentPage = parseInt(currentUrl.searchParams.get('page')) || 1;
        // Não é estritamente necessário verificar totalPages aqui, o servidor já trata o limite
        // Mas podemos adicionar uma verificação de `totalPages` se passada para o JS para evitar requisições desnecessárias.
        // Por enquanto, o botão estará desabilitado via EJS, então o clique não ocorrerá.
        currentUrl.searchParams.set('page', currentPage + 1);
        window.location.href = currentUrl.toString();
    });

    // Manter o campo de busca preenchido e o botão de tipo de ranking ativo na recarga
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';
    const initialRankingType = urlParams.get('type') || 'level';

    searchInput.value = initialSearch;
    rankingTypeButtons.forEach(button => {
        if (button.dataset.rankingType === initialRankingType) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
});