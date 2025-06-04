// public/js/ranking.js

document.addEventListener('DOMContentLoaded', () => {
    const rankingTypeSelection = document.getElementById('ranking-type-selection');
    const searchInput = document.getElementById('rankingSearchInput');
    const searchBtn = document.getElementById('rankingSearchBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const paginationControls = document.querySelector('.pagination-controls'); // Select the container

    // Function to update URL and reload page
    const updateRanking = (type, search, page) => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('type', type);
        currentUrl.searchParams.set('search', search);
        currentUrl.searchParams.set('page', page);
        currentUrl.searchParams.set('pageSize', <%= pageSize %>); // Use EJS variable for page size

        // Add a class for potential CSS transition before navigating
        const tableContainer = document.getElementById('ranking-table-container');
        if (tableContainer) {
             tableContainer.classList.add('fade-out');
             // Add a small delay before navigation to allow transition to start
             setTimeout(() => {
                  window.location.href = currentUrl.toString();
             }, 200); // 200ms delay for fade-out transition
        } else {
            // If container not found, navigate immediately
             window.location.href = currentUrl.toString();
        }
    };

    // Handle Ranking Type Selection
    if (rankingTypeSelection) {
        rankingTypeSelection.addEventListener('click', (event) => {
            const button = event.target.closest('.btn');
            if (button && !button.classList.contains('active')) {
                const newType = button.dataset.rankingType;
                const currentSearch = searchInput ? searchInput.value : '';
                // Reset to page 1 when changing ranking type
                updateRanking(newType, currentSearch, 1);
            }
        });
    }

    // Handle Search
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const currentType = document.querySelector('.ranking-type-selection .btn.active').dataset.rankingType;
            const newSearch = searchInput.value;
             // Reset to page 1 when performing a new search
            updateRanking(currentType, newSearch, 1);
        });

         // Allow search on Enter key press in the input field
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission if input is part of a form
                searchBtn.click(); // Trigger the search button click handler
            }
        });
    }

    // Handle Pagination (Previous/Next buttons and Page Numbers)
    if (paginationControls) {
        paginationControls.addEventListener('click', (event) => {
            const target = event.target;
            const currentType = document.querySelector('.ranking-type-selection .btn.active').dataset.rankingType;
            const currentSearch = searchInput ? searchInput.value : '';
            const currentPage = <%= currentPage %>; // Use EJS variable
            const totalPages = <%= totalPages %>; // Use EJS variable
            const pageSize = <%= pageSize %>; // Use EJS variable

            if (target.id === 'prevPageBtn' && currentPage > 1) {
                 updateRanking(currentType, currentSearch, currentPage - 1);
            } else if (target.id === 'nextPageBtn' && currentPage < totalPages) {
                 updateRanking(currentType, currentSearch, currentPage + 1);
            } else if (target.classList.contains('page-number') && !target.classList.contains('active')) {
                 const newPage = parseInt(target.textContent);
                 if (!isNaN(newPage)) { // Ensure it's a number (excludes '...')
                     updateRanking(currentType, currentSearch, newPage);
                 }
            }
        });
    }

    // Update "Last Updated" time placeholder (Client-side approach)
     const lastUpdatedSpan = document.getElementById('last-updated-time');
     if(lastUpdatedSpan) {
         const now = new Date();
         const hours = String(now.getHours()).padStart(2, '0');
         const minutes = String(now.getMinutes()).padStart(2, '0');
         const day = String(now.getDate()).padStart(2, '0');
         const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
         const year = now.getFullYear();
         lastUpdatedSpan.textContent = `${day}/${month}/${year} às ${hours}:${minutes}`;
     }

});