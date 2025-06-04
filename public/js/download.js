// public/js/download.js

document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(faqItem => {
                if (faqItem !== item && faqItem.classList.contains('active')) {
                    faqItem.classList.remove('active');
                    faqItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle the clicked item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 10 + "px"; // Add buffer
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });

        // Initialize state: ensure answer height is 0 for closed items
        if (!item.classList.contains('active')) {
             answer.style.maxHeight = null;
        }
    });

    // Note: Smooth Scroll and Animate-on-Scroll are handled by script.js
});