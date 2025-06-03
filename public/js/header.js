// public/js/header.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('header.js carregado');

    const accountDropdown = document.querySelector('.account-dropdown');
    const dropdownToggle = accountDropdown ? accountDropdown.querySelector('.dropdown-toggle') : null;
    const dropdownMenu = accountDropdown ? accountDropdown.querySelector('.dropdown-menu') : null;

    if (dropdownToggle && dropdownMenu) {
        // Função para abrir/fechar o dropdown
        function toggleDropdown() {
            dropdownMenu.classList.toggle('show');
            dropdownToggle.classList.toggle('active'); // Adiciona/remove classe active para estilização (ex: seta)
        }

        // Listener para o botão toggle
        dropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique feche imediatamente se houver um listener no document
            toggleDropdown();
        });

        // Listener para fechar o dropdown quando clicar fora dele
        document.addEventListener('click', (event) => {
            if (dropdownMenu.classList.contains('show') && !accountDropdown.contains(event.target)) {
                 // Se o menu está aberto e o clique foi fora do dropdown
                 dropdownMenu.classList.remove('show');
                 dropdownToggle.classList.remove('active');
            }
        });

         // Opcional: Fechar o dropdown ao clicar em um item do menu (para navegação SPA ou se os links não recarregarem a página)
         dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
             item.addEventListener('click', () => {
                 // Pequeno delay para permitir a navegação antes de fechar visualmente
                 setTimeout(() => {
                     dropdownMenu.classList.remove('show');
                     dropdownToggle.classList.remove('active');
                 }, 100); // Ajuste o delay se necessário
             });
         });
    }


    // Código para o Language Dropdown (se ele existir e precisar de JS)
    const languageDropdown = document.querySelector('.language-dropdown');
    const langDropdownToggle = languageDropdown ? languageDropdown.querySelector('.dropdown-toggle') : null;
    const langDropdownMenu = languageDropdown ? languageDropdown.querySelector('.dropdown-menu') : null;

    if (langDropdownToggle && langDropdownMenu) {
         function toggleLangDropdown() {
            langDropdownMenu.classList.toggle('show');
            langDropdownToggle.classList.toggle('active');
         }

         langDropdownToggle.addEventListener('click', (event) => {
             event.stopPropagation();
             toggleLangDropdown();
         });

         document.addEventListener('click', (event) => {
            if (langDropdownMenu.classList.contains('show') && !languageDropdown.contains(event.target)) {
                 langDropdownMenu.classList.remove('show');
                 langDropdownToggle.classList.remove('active');
            }
        });

        // Listener para fechar ao clicar em um item do menu (e talvez mudar a bandeira/código)
        langDropdownMenu.querySelectorAll('a').forEach(item => {
             item.addEventListener('click', (event) => {
                 // event.preventDefault(); // Descomente se o link não for para navegação real
                 const langCode = item.getAttribute('data-code');
                 const flagSrc = item.querySelector('img').getAttribute('src');

                 // Atualiza a bandeira e o código exibidos no toggle (UI)
                 document.getElementById('selected-flag').setAttribute('src', flagSrc);
                 document.getElementById('selected-lang-code').textContent = langCode;

                 // Implemente aqui a lógica real de mudança de idioma (cookie, localstorage, etc.)
                 console.log('Idioma selecionado:', item.getAttribute('data-lang'));

                 // Fecha o dropdown após a seleção
                 setTimeout(() => { // Delay para a UI atualizar antes de fechar
                     langDropdownMenu.classList.remove('show');
                     langDropdownToggle.classList.remove('active');
                 }, 100);
             });
         });
    }

});