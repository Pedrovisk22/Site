// public/js/wiki.js

document.addEventListener('DOMContentLoaded', () => {
    // Toggle functionality for Table of Contents (Índice)
    const tocToggle = document.querySelector('.wiki-toc-title .toc-toggle');
    const tocList = document.querySelector('.wiki-toc-list');
    const wikiTocContainer = document.querySelector('.wiki-toc'); // Container to add/remove 'hidden' class

    if (tocToggle && tocList && wikiTocContainer) {
        tocToggle.addEventListener('click', () => {
            // Toggle the 'hidden' class on the container
            wikiTocContainer.classList.toggle('hidden');

            // Update the toggle text
            const isHidden = wikiTocContainer.classList.contains('hidden');
            tocToggle.textContent = isHidden ? '[mostrar]' : '[ocultar]';

            // Optional: Smooth scroll to the top of the TOC when revealing it
            if (!isHidden) {
                 // Add a small delay to allow max-height transition to start
                 setTimeout(() => {
                     const headerHeight = document.querySelector('.header').offsetHeight;
                     const tocTop = wikiTocContainer.getBoundingClientRect().top + window.scrollY;
                     const scrollToPosition = tocTop - headerHeight - 20; // Adjust offset

                     window.scrollTo({
                         top: scrollToPosition,
                         behavior: 'smooth'
                     });
                 }, 100); // Delay slightly less than CSS transition
            }
        });

         // Initially set up based on CSS state (if using hidden class by default)
         // If CSS sets max-height: 0 initially, the text should be '[mostrar]'
         // If CSS sets max-height: auto initially, the text should be '[ocultar]'
         // Let's assume it starts visible based on the print, so initial text is [ocultar]

         // You could also check the initial state and set the text accordingly here.
         // const isInitiallyHidden = wikiTocContainer.classList.contains('hidden');
         // tocToggle.textContent = isInitiallyHidden ? '[mostrar]' : '[ocultar]';
    }

    // Smooth scroll for anchor links within the wiki content
    // Re-using the logic from download.js/script.js if it's general.
    // If scroll is handled by script.js globally, you don't need this here.
    // If script.js handles it globally, remove the smooth scroll part from download.js as well.
    // Assuming script.js handles global smooth scrolling: NO NEED FOR THIS BLOCK IF script.js DOES IT.
    // If script.js does NOT handle it, or you want specific wiki scrolling:
    /*
    document.querySelectorAll('.wiki-content a[href^="#"]').forEach(anchor => {
         // Check if the target ID is on the current page
         const currentPath = window.location.pathname.replace(/\/$/, "");
         const linkPath = new URL(anchor.href, window.location.origin).pathname.replace(/\/$/, ""); // Use window.location.origin for absolute path

         if (currentPath === linkPath || linkPath === "") { // Link points to current page or root (if current page is root)
            anchor.addEventListener('click', function(e) {
                 if (this.getAttribute('href') !== '#') {
                    e.preventDefault();

                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                         const headerHeight = document.querySelector('.header').offsetHeight;
                         const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                         const scrollToPosition = offsetTop - headerHeight - 20; // Adjust offset

                         window.scrollTo({
                             top: scrollToPosition,
                             behavior: 'smooth'
                         });
                    }
                 }
            });
         }
    });
    */

     // Intersection Observer for animate-on-scroll
     // Assuming this is handled by script.js globally. If not, include it here.
     /*
     const elements = document.querySelectorAll('.animate-on-scroll');

     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.classList.add('is-visible');
                 // observer.unobserve(entry.target); // Uncomment if you only want the animation once
             } else {
                 // entry.target.classList.remove('is-visible'); // Uncomment if you want animation to replay
             }
         });
     }, {
         threshold: 0.1,
         rootMargin: '0px 0px -50px 0px'
     });

     elements.forEach(element => {
         observer.observe(element);
     });
     */

});