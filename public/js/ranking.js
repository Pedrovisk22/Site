// public/js/ranking.js

document.addEventListener('DOMContentLoaded', () => {
    const rankingContentSection = document.getElementById('ranking-content-section');
    const searchInput = document.getElementById('rankingSearchInput');
    const searchBtn = document.getElementById('rankingSearchBtn');
    const paginationControls = document.querySelector('.pagination-controls');
    const pageSizeSelection = document.querySelector('.page-size-selection');
    const loadingOverlay = document.getElementById('loading-overlay');
    const rankingTableBody = document.querySelector('.ranking-table tbody');
    const rankingTableContainer = document.getElementById('ranking-table-container');
    // Select the specific .no-results element within the ranking section if needed,
    // or rely on the general selector if there's only one.
    const noResultsMessage = rankingContentSection ? rankingContentSection.querySelector('.no-results') : null;


    // --- Read initial state from data attributes ---
    // These values are set by EJS on the initial render
    let currentState = {
        currentPage: parseInt(rankingContentSection?.dataset.currentPage) || 1,
        totalPages: parseInt(rankingContentSection?.dataset.totalPages) || 1,
        pageSize: parseInt(rankingContentSection?.dataset.pageSize) || 5,
        rankingType: rankingContentSection?.dataset.rankingType || 'level', // Read type from data attribute
        search: rankingContentSection?.dataset.searchTerm || '',
        availablePageSizes: JSON.parse(pageSizeSelection?.dataset.availablePageSizes || '[]')
    };

    const showLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    };

    const hideLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    };

    const updateURL = (page, pageSize, search) => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('type', currentState.rankingType);
        currentUrl.searchParams.set('search', search);
        currentUrl.searchParams.set('page', page);
        currentUrl.searchParams.set('pageSize', pageSize);
        history.pushState(null, '', currentUrl.toString());
    };

    // Function to fetch ranking data from the server
    const fetchRankingData = async (page, pageSize, search) => {
        showLoading();
        const url = new URL('/ranking', window.location.origin);
        url.searchParams.set('type', currentState.rankingType);
        url.searchParams.set('search', search);
        url.searchParams.set('page', page);
        url.searchParams.set('pageSize', pageSize);

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest' // Indicate AJAX request
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update currentState with new data
            currentState = {
                ...currentState,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                pageSize: data.pageSize,
                search: data.search,
                // rankingType and availablePageSizes are assumed to be constant for this page
            };

            updateRankingTable(data.players);
            updatePaginationControls(data.currentPage, data.totalPages);
            updatePageSizeButtons(data.pageSize);
            updateNoResultsMessage(data.players.length > 0);
            updateURL(data.currentPage, data.pageSize, data.search);

        } catch (error) {
            console.error('Erro ao buscar dados do ranking:', error);
            // Display an error message to the user
            updateRankingTable([]); // Clear table on error
            updatePaginationControls(1, 1); // Reset pagination to a default state
            updateNoResultsMessage(false); // Show no results message
            if (noResultsMessage) {
                 noResultsMessage.textContent = 'Ocorreu um erro ao carregar o ranking. Tente novamente mais tarde.';
                 noResultsMessage.style.display = 'block'; // Ensure it's visible
            }

        } finally {
            hideLoading();
        }
    };

    // Function to update the HTML table with fetched player data
    const updateRankingTable = (players) => {
        if (!rankingTableBody) return;

        rankingTableBody.innerHTML = ''; // Clear current table body

        if (!players || players.length === 0) {
            if (rankingTableContainer) rankingTableContainer.style.display = 'none';
            return;
        }

        if (rankingTableContainer) rankingTableContainer.style.display = 'block';

        players.forEach((player, index) => {
            // Calculate global rank based on current state
            const globalRank = (currentState.currentPage - 1) * currentState.pageSize + index + 1;

            let rankClass = '';
            if (globalRank === 1) rankClass = 'top-1';
            else if (globalRank === 2) rankClass = 'top-2';
            else if (globalRank === 3) rankClass = 'top-3';

            // Check if user is logged in and matches the player account_id (Access user from global scope if set)
            const isPlayerLoggedIn = window.user && player.account_id === window.user.id;

            const avatarUrl = `/avatar/${player.name}`;
            // Use player.background if available and not 0, otherwise default to 1
            const backgroundId = player.background && player.background !== 0 ? player.background : 1;
            const backgroundUrl = `/assets/images/characters/backgrounds/background_${backgroundId}.png`;


            const row = document.createElement('tr');
            row.classList.add(rankClass);
             if (isPlayerLoggedIn) {
                row.classList.add('is-logged-in');
            }
            row.dataset.playerId = player.id; // Add data attribute for potential future use

            row.innerHTML = `
                <td class="rank-cell">${globalRank}</td>
                <td class="player-cell">
                    <div class="ranked-avatar-wrapper"
                         style="background-image: url('${backgroundUrl}');">
                        <img src="${avatarUrl}" alt="${player.name} Avatar">
                    </div>
                    <div class="ranked-name">
                        <a href="/character/${player.name}">
                            ${isPlayerLoggedIn ? player.name + ' (VOCÊ)' : player.name}
                        </a>
                    </div>
                </td>
                <td class="value-cell">${player.level}</td>
            `;
            rankingTableBody.appendChild(row);
        });
    };

    // Function to update the pagination controls HTML and state
    const updatePaginationControls = (currentPage, totalPages) => {
         if (!paginationControls) return;

         paginationControls.innerHTML = ''; // Clear current pagination

         const createButton = (text, id, disabled) => {
             const btn = document.createElement('button');
             btn.classList.add('btn', 'btn-secondary');
             if (id) btn.id = id;
             if (disabled) btn.disabled = true;
             btn.innerHTML = id === 'prevPageBtn' ? '<i class="fas fa-chevron-left"></i> Anterior' : (id === 'nextPageBtn' ? 'Próxima <i class="fas fa-chevron-right"></i>' : text);
             return btn;
         };

         const createPageLink = (page, isActive) => {
             const link = document.createElement('a');
             link.href = "#"; // Prevent default link behavior, handle click with JS
             link.classList.add('page-number');
             if (isActive) link.classList.add('active');
             link.dataset.page = page; // Store page number in data attribute
             link.textContent = page;
             return link;
         };

         paginationControls.appendChild(createButton(null, 'prevPageBtn', currentPage === 1));

         // Logic to determine which page numbers to show (same as EJS logic)
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

         if (endPage - startPage + 1 < maxPagesToShow && totalPages > maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
              endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         }

         if (startPage > 1) {
             paginationControls.appendChild(createPageLink(1, false));
             if (startPage > 2) {
                 const dots = document.createElement('span');
                 dots.classList.add('pagination-dots');
                 dots.textContent = '...';
                 paginationControls.appendChild(dots);
             }
         }

         for (let i = startPage; i <= endPage; i++) {
             paginationControls.appendChild(createPageLink(i, i === currentPage));
         }

         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 const dots = document.createElement('span');
                 dots.classList.add('pagination-dots');
                 dots.textContent = '...';
                 paginationControls.appendChild(dots);
             }
             paginationControls.appendChild(createPageLink(totalPages, false));
         }

         paginationControls.appendChild(createButton(null, 'nextPageBtn', currentPage === totalPages));

         // Update data attributes on pagination container to reflect current state
         paginationControls.dataset.currentPage = currentPage;
         paginationControls.dataset.totalPages = totalPages;
     };

    // Function to update the active state of page size buttons
    const updatePageSizeButtons = (pageSize) => {
        if (!pageSizeSelection) return;
        pageSizeSelection.querySelectorAll('.btn').forEach(btn => {
            if (parseInt(btn.dataset.pageSize) === pageSize) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
         // Update data attribute on the main ranking section as a central source of truth
        if (rankingContentSection) rankingContentSection.dataset.pageSize = pageSize;
    };

    // Function to show/hide the "No Results" message
    const updateNoResultsMessage = (hasResults) => {
        if (noResultsMessage) {
            noResultsMessage.style.display = hasResults ? 'none' : 'block';
             // Also hide the table container if there are no results
            if (rankingTableContainer) {
                 rankingTableContainer.style.display = hasResults ? 'block' : 'none';
            }
        } else {
             // If no-results message element doesn't exist, just control the table container
            if (rankingTableContainer) {
                 rankingTableContainer.style.display = hasResults ? 'block' : 'none';
            }
        }
    };


    // --- Event Handling using Delegation ---
    // Listen for clicks on the main ranking section and delegate based on the target
    const handleRankingControlClick = (event) => {
        // Find the closest button or link that was clicked
        const target = event.target.closest('button') || event.target.closest('a');

        // If no relevant element was clicked, do nothing
        if (!target) return;

        // Prevent default actions for elements we handle
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
             // Only prevent default if we determine we will fetch data later
             // or if it's a page link (href="#")
             if (target.href === "#" || target.id === 'prevPageBtn' || target.id === 'nextPageBtn' || pageSizeSelection?.contains(target) || searchBtn === target) {
                 event.preventDefault();
             }
        }


        let newSearch = searchInput ? searchInput.value.trim() : currentState.search;
        let newPage = currentState.currentPage;
        let newPageSize = currentState.pageSize;
        let shouldFetch = false;

        // Handle Search Button
        if (searchBtn === target) {
            newSearch = searchInput.value.trim();
            // Fetch if search term changed or if search was cleared
            if (newSearch !== currentState.search || (newSearch === '' && currentState.search !== '')) {
                newPage = 1; // Reset to first page on new search
                shouldFetch = true;
            } else {
                 // If search didn't change and we are not changing page, do nothing
                 return; // Exit the function
            }
        }
        // Handle Pagination controls (buttons and page number links)
        else if (paginationControls?.contains(target)) {
            if (target.id === 'prevPageBtn' && currentState.currentPage > 1 && !target.disabled) {
                 newPage = currentState.currentPage - 1;
                 shouldFetch = true;
             } else if (target.id === 'nextPageBtn' && currentState.currentPage < currentState.totalPages && !target.disabled) {
                 newPage = currentState.currentPage + 1;
                 shouldFetch = true;
             } else if (target.classList.contains('page-number') && target.dataset.page && !target.classList.contains('active')) {
                 const page = parseInt(target.dataset.page);
                 if (!isNaN(page) && page >= 1 && page <= currentState.totalPages && page !== currentState.currentPage) {
                     newPage = page;
                     shouldFetch = true;
                 }
             } else {
                 return; // Don't fetch if a disabled or inactive pagination control was clicked
             }
        }
        // Handle Page Size Selection buttons
        else if (pageSizeSelection?.contains(target) && target.dataset.pageSize && !target.classList.contains('active')) {
             const size = parseInt(target.dataset.pageSize);
             // Check if the clicked size is available and different from the current size
             if (!isNaN(size) && currentState.availablePageSizes.includes(size) && size !== currentState.pageSize) {
                 newPageSize = size;
                 newPage = 1; // Reset to first page when changing page size
                 shouldFetch = true;
             } else {
                 return; // Don't fetch if a non-page-size button or the active size button was clicked
             }
        } else {
            return; // Do nothing if the clicked target is not a relevant ranking control
        }

        // If any condition triggered a change requiring data fetching
        if (shouldFetch) {
             fetchRankingData(newPage, newPageSize, newSearch);
        }
    };

    // Add the single click listener to the main container
    rankingContentSection?.addEventListener('click', handleRankingControlClick);

    // Handle Search (specifically for Enter key press in the input field)
    if (searchBtn && searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            // Check if the pressed key is Enter
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission or new line in input
                const newSearch = searchInput.value.trim();
                 // Fetch if search term changed or if search was cleared
                if (newSearch !== currentState.search || (newSearch === '' && currentState.search !== '')) {
                     fetchRankingData(1, currentState.pageSize, newSearch); // Always reset to page 1 on search
                 }
            }
        });
    }

    // Handle back/forward button in browser using the popstate event
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        // Read state from URL, defaulting if not present
        const page = parseInt(urlParams.get('page')) || 1;
        const pageSize = parseInt(urlParams.get('pageSize')) || 5;
        const search = urlParams.get('search') || '';
        // Only fetch if the state from history is different from the current state
        if (page !== currentState.currentPage || pageSize !== currentState.pageSize || search !== currentState.search) {
             // fetchRankingData will update the currentState and the UI
            fetchRankingData(page, pageSize, search);
        }
    });


    // Update "Last Updated" time on page load (Client-side approach)
     const lastUpdatedSpan = document.getElementById('last-updated-time');
     if(lastUpdatedSpan) {
         const now = new Date();
         const hours = String(now.getHours()).padStart(2, '0');
         const minutes = String(now.getMinutes()).padStart(2, '0');
         const day = String(now.getDate()).padStart(2, '0');
         const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
         const year = now.getFullYear();
         lastUpdatedSpan.textContent = `${day}/${month}/${year} às ${hours}:${minutes}`;
     }

     // --- Initial Setup on Page Load ---
     // The EJS template already renders the initial table, pagination, and buttons.
     // These lines ensure the JS state and UI elements match the initial EJS render
     // and set up event listeners. They are useful if the EJS render might be slightly
     // off or if you navigate back/forward.
     // Re-render controls based on the initial state read from data attributes.
      updatePaginationControls(currentState.currentPage, currentState.totalPages);
      updatePageSizeButtons(currentState.pageSize);
      // Ensure the no-results message and table container visibility are correct initially
      updateNoResultsMessage(document.querySelectorAll('.ranking-table tbody tr').length > 0);


});