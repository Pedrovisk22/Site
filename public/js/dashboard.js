// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard.js carregado');

    const navTabs = document.querySelectorAll('.dashboard-nav .nav-tab');
    const tabPanes = document.querySelectorAll('.dashboard-tab-content .tab-pane');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTabId = tab.getAttribute('data-tab');

            navTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetTabId + '-tab').classList.add('active');

            console.log('Aba ativada:', targetTabId);
        });
    });

    const createCharModal = document.getElementById('createCharModal');
    const openCreateModalBtn = document.getElementById('btn-open-create-modal');
    const closeCreateModalBtn = document.getElementById('btn-close-create-modal');
    const cancelCreateModalBtn = document.getElementById('btn-cancel-create');
    const formCreateChar = document.getElementById('form-create-char');
    const createCharErrorDiv = createCharModal ? createCharModal.querySelector('.create-char-error') : null;
    const characterNameInput = document.getElementById('characterName');
    const characterNameFeedback = createCharModal ? createCharModal.querySelector('.character-name-feedback') : null;
    let nameCheckTimeout = null;

    if (openCreateModalBtn && createCharModal) {
        openCreateModalBtn.addEventListener('click', () => {
            createCharModal.style.display = 'block';
            if (formCreateChar) formCreateChar.reset();
            if (createCharErrorDiv) createCharErrorDiv.style.display = 'none';
             if (characterNameFeedback) characterNameFeedback.textContent = '';
        });
    }

    if (closeCreateModalBtn && createCharModal) {
        closeCreateModalBtn.addEventListener('click', () => {
            createCharModal.style.display = 'none';
        });
    }
     if (cancelCreateModalBtn && createCharModal) {
        cancelCreateModalBtn.addEventListener('click', () => {
            createCharModal.style.display = 'none';
        });
    }

    if (createCharModal) {
        window.addEventListener('click', (event) => {
            if (event.target === createCharModal) {
                createCharModal.style.display = 'none';
            }
        });
    }

    function showCreateCharError(message) {
        if (createCharErrorDiv) {
            createCharErrorDiv.textContent = message;
            createCharErrorDiv.style.display = 'block';
        }
    }

    if (formCreateChar) {
        formCreateChar.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (createCharErrorDiv) createCharErrorDiv.style.display = 'none';

            const characterName = document.getElementById('characterName').value;
            const sex = document.getElementById('sex').value;
            const picture = document.getElementById('picture').value;

            if (!characterName || !sex) {
                showCreateCharError('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            try {
                const response = await fetch('/api/characters/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ characterName, sex, picture })
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    createCharModal.style.display = 'none';
                    window.location.reload();
                } else {
                    showCreateCharError(result.message);
                }

            } catch (error) {
                console.error('Erro na requisição de criação de personagem:', error);
                showCreateCharError('Ocorreu um erro ao criar o personagem. Tente novamente.');
            }
        });
    }

    const genderOptionBtns = document.querySelectorAll('.gender-options .gender-option-btn');
    const sexInputHidden = document.getElementById('sex');

    if (genderOptionBtns.length > 0 && sexInputHidden) {
        genderOptionBtns.forEach(button => {
            button.addEventListener('click', () => {
                genderOptionBtns.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                sexInputHidden.value = button.getAttribute('data-sex');
                 console.log('Sexo selecionado:', sexInputHidden.value);
            });
        });
        const initialSex = sexInputHidden.value || '1';
        const initialButton = document.querySelector(`.gender-options .gender-option-btn[data-sex="${initialSex}"]`);
        if (initialButton) {
             initialButton.classList.add('active');
        }
    }

    if (characterNameInput && characterNameFeedback) {
         characterNameInput.addEventListener('input', () => {
             if (nameCheckTimeout) {
                 clearTimeout(nameCheckTimeout);
             }
             const name = characterNameInput.value.trim();
             if (name.length < 3) {
                 characterNameFeedback.textContent = 'Digite pelo menos 3 caracteres.';
                 characterNameFeedback.style.color = 'orange';
                 return;
             }
             if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
                 characterNameFeedback.textContent = 'Nome inválido. Use letras, números e espaços.';
                 characterNameFeedback.style.color = 'red';
                 return;
             }
             if (name.includes('  ')) {
                 characterNameFeedback.textContent = 'Múltiplos espaços não são permitidos.';
                 characterNameFeedback.style.color = 'red';
                 return;
             }

             characterNameFeedback.textContent = 'Verificando...';
             characterNameFeedback.style.color = 'gray';

             nameCheckTimeout = setTimeout(async () => {
                 try {
                     const response = await fetch(`/api/characters/checkname?name=${encodeURIComponent(name)}`);
                     const result = await response.json();
                     if (result.exists) {
                         characterNameFeedback.textContent = 'Nome indisponível.';
                         characterNameFeedback.style.color = 'red';
                     } else {
                         characterNameFeedback.textContent = 'Nome disponível!';
                         characterNameFeedback.style.color = 'green';
                     }
                 } catch (error) {
                     console.error('Erro na verificação de nome:', error);
                     characterNameFeedback.textContent = 'Erro ao verificar nome.';
                     characterNameFeedback.style.color = 'red';
                 }
             }, 500);
         });
    }

    const deleteCharModal = document.getElementById('deleteCharModal');
    const closeDeleteModalBtn = document.getElementById('btn-close-delete-modal');
    const cancelDeleteModalBtn = document.getElementById('btn-cancel-delete');
    const formDeleteChar = document.getElementById('form-delete-char');
    const deleteCharNameSpan = document.getElementById('delete-char-name');
    const deleteCharIdInput = document.getElementById('delete-char-id');
    const deletePasswordInput = document.getElementById('delete-password');
    const deleteCharErrorDiv = deleteCharModal ? deleteCharModal.querySelector('.delete-char-error') : null;

    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.data-char-delete')) {
            const deleteButton = event.target.closest('.data-char-delete');
            const charId = deleteButton.getAttribute('data-id');
            const charName = deleteButton.getAttribute('data-name');

            if (deleteCharModal && deleteCharNameSpan && deleteCharIdInput && deletePasswordInput) {
                deleteCharNameSpan.textContent = charName;
                deleteCharIdInput.value = charId;
                deletePasswordInput.value = '';
                 if (deleteCharErrorDiv) deleteCharErrorDiv.style.display = 'none';
                deleteCharModal.style.display = 'block';
            }
        }
    });


    if (closeDeleteModalBtn && deleteCharModal) {
        closeDeleteModalBtn.addEventListener('click', () => {
            deleteCharModal.style.display = 'none';
        });
    }
     if (cancelDeleteModalBtn && deleteCharModal) {
        cancelDeleteModalBtn.addEventListener('click', () => {
            deleteCharModal.style.display = 'none';
        });
    }

     if (deleteCharModal) {
         window.addEventListener('click', (event) => {
            if (event.target === deleteCharModal) {
                 deleteCharModal.style.display = 'none';
             }
         });
     }

    function showDeleteCharError(message) {
        if (deleteCharErrorDiv) {
            deleteCharErrorDiv.textContent = message;
            deleteCharErrorDiv.style.display = 'block';
        }
    }

    if (formDeleteChar) {
        formDeleteChar.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (deleteCharErrorDiv) deleteCharErrorDiv.style.display = 'none';

            const characterId = document.getElementById('delete-char-id').value;
            const password = document.getElementById('delete-password').value;

            if (!characterId || !password) {
                showDeleteCharError('Por favor, preencha a senha.');
                return;
            }

            try {
                const response = await fetch('/api/characters/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ characterId, password })
                });

                const result = await response.json();

                if (result.success) {
                     alert(result.message);
                    deleteCharModal.style.display = 'none';
                    window.location.reload();
                } else {
                    showDeleteCharError(result.message);
                }

            } catch (error) {
                console.error('Erro na requisição de exclusão:', error);
                showDeleteCharError('Ocorreu um erro ao excluir o personagem. Tente novamente.');
            }
        });
    }

});