// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('login.js carregado');
    // Adicione seu código JavaScript aqui, se necessário.
    // Ex: validação básica de formulário antes do envio.

    const loginForm = document.querySelector('.auth-form'); // Ou um ID específico
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            // Exemplo de validação básica
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput.value || !passwordInput.value) {
                // alert('Por favor, preencha todos os campos.'); // Use uma div de erro na UI real
                console.warn('Campos de login vazios.');
                // event.preventDefault(); // Impedir envio se a validação falhar
            }
            // A validação principal deve ser feita no servidor
        });
    }
});