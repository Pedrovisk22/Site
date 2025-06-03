// public/js/register_step1.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('register_step1.js carregado');

    const registerStep1Form = document.getElementById('registerStep1Form');

    if (registerStep1Form) {
        registerStep1Form.addEventListener('submit', (event) => {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');

            if (!nameInput.value || !emailInput.value) {
                 console.warn('Campos de registro da Etapa 1 vazios detectados no front-end.');
                 // A validação principal está no servidor.
                 // event.preventDefault(); // Pode adicionar aqui se quiser bloquear o envio no front-end também
            }
            // A validação principal (formato de email, duplicidade) é feita no servidor.
        });
    }
});