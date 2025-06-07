// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    const navTabs = document.querySelectorAll('.dashboard-nav .nav-tab');
    const tabPanes = document.querySelectorAll('.dashboard-tab-content .tab-pane');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTabId = tab.getAttribute('data-tab');

            navTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetTabId + '-tab').classList.add('active');

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
            // The background for creation is set to default in accountController,
            // so we don't need to pass it from here for new character creation.
            // const background = document.getElementById('background').value;

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
                    body: JSON.stringify({ characterName, sex }) // Removed background from here
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
            });
        });
        const initialSex = sexInputHidden.value || '1';
        // Corrected template literal syntax
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
                    // Corrected template literal syntax
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

    // FIX: Corrected class selector for delete button
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.btn-delete-char')) { // Changed from .data-char-delete
            const deleteButton = event.target.closest('.btn-delete-char');
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

    const editCharModal = document.getElementById('editCharModal');
    const closeEditModalBtn = document.getElementById('btn-close-edit-modal');
    const cancelEditModalBtn = document.getElementById('btn-cancel-edit');
    const formEditChar = document.getElementById('form-edit-char');
    const editCharIdInput = document.getElementById('edit-char-id');
    const selectedBackgroundValueInput = document.getElementById('selected-background-value');
    const backgroundOptionsGrid = editCharModal ? editCharModal.querySelector('.background-options-grid') : null;
    const editCharModalTitle = document.getElementById('edit-char-modal-title');
    const editCharErrorDiv = editCharModal ? editCharModal.querySelector('.edit-char-error') : null;
    const editCharSuccessDiv = editCharModal ? editCharModal.querySelector('.edit-char-success') : null;


    function showEditCharError(message) {
        if (editCharErrorDiv) {
            editCharErrorDiv.textContent = message;
            editCharErrorDiv.style.display = 'block';
            if (editCharSuccessDiv) editCharSuccessDiv.style.display = 'none';
        }
    }

    function showEditCharSuccess(message) {
        if (editCharSuccessDiv) {
            editCharSuccessDiv.textContent = message;
            editCharSuccessDiv.style.display = 'block';
            if (editCharErrorDiv) editCharErrorDiv.style.display = 'none';
        }
    }

    function hideEditCharMessages() {
        if (editCharErrorDiv) editCharErrorDiv.style.display = 'none';
        if (editCharSuccessDiv) editCharSuccessDiv.style.display = 'none';
    }

    function selectBackgroundThumbnail(value) {
        if (!backgroundOptionsGrid || !selectedBackgroundValueInput) return;

        backgroundOptionsGrid.querySelectorAll('.background-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });

        // Corrected template literal syntax
        const selectedThumb = backgroundOptionsGrid.querySelector(`.background-thumbnail[data-background-value="${value}"]`);
        if (selectedThumb) {
            selectedThumb.classList.add('active');
            selectedBackgroundValueInput.value = value;
        } else {
            // Fallback to default background if the selected one doesn't exist (e.g., if char.background was 0)
            const defaultThumb = backgroundOptionsGrid.querySelector(`.background-thumbnail[data-background-value="1"]`); // Assuming background 1 is default
            if (defaultThumb) {
                defaultThumb.classList.add('active');
                selectedBackgroundValueInput.value = '1';
            } else {
                selectedBackgroundValueInput.value = value; // Keep original if no default found
            }
        }
        console.log('Selected background:', selectedBackgroundValueInput.value);
    }


    if (backgroundOptionsGrid) {
        backgroundOptionsGrid.addEventListener('click', (event) => {
            const thumbnail = event.target.closest('.background-thumbnail');
            if (thumbnail) {
                const bgValue = thumbnail.getAttribute('data-background-value');
                selectBackgroundThumbnail(bgValue);
            }
        });
    }


    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.btn-edit-char')) {
            const editButton = event.target.closest('.btn-edit-char');
            const charId = editButton.getAttribute('data-id');
            const charName = editButton.getAttribute('data-name');
            const charBackground = editButton.getAttribute('data-background');

            if (editCharModal && editCharIdInput && editCharModalTitle && selectedBackgroundValueInput) {
                editCharIdInput.value = charId;
                // Corrected template literal syntax
                editCharModalTitle.textContent = `Editar ${charName}`;
                hideEditCharMessages();

                selectBackgroundThumbnail(charBackground || '1'); // Default to '1' if charBackground is null or 0

                editCharModal.style.display = 'block';
            }
        }
    });

    if (closeEditModalBtn && editCharModal) {
        closeEditModalBtn.addEventListener('click', () => {
            editCharModal.style.display = 'none';
        });
    }
    if (cancelEditModalBtn && editCharModal) {
        cancelEditModalBtn.addEventListener('click', () => {
            editCharModal.style.display = 'none';
        });
    }

    if (editCharModal) {
        window.addEventListener('click', (event) => {
            if (event.target === editCharModal) {
                editCharModal.style.display = 'none';
            }
        });
    }

    if (formEditChar) {
        formEditChar.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideEditCharMessages();

            const characterId = editCharIdInput.value;
            const selectedBackground = selectedBackgroundValueInput.value;


            if (!characterId || selectedBackground === undefined) {
                showEditCharError('Dados inválidos para atualização.');
                return;
            }

            try {
                // Corrected template literal syntax
                const response = await fetch(`/api/characters/${characterId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ background: parseInt(selectedBackground, 10) })
                });

                const result = await response.json();

                if (result.success) {
                    showEditCharSuccess(result.message);
                    setTimeout(() => {
                        editCharModal.style.display = 'none';
                        window.location.reload();
                    }, 1500);
                } else {
                    showEditCharError(result.message);
                }

            } catch (error) {
                console.error('Erro na requisição de edição:', error);
                showEditCharError('Ocorreu um erro ao salvar as alterações. Tente novamente.');
            }
        });
    }

    document.body.addEventListener('change', async (event) => {
        if (event.target.classList.contains('private-toggle')) {
            const toggle = event.target;
            const charId = toggle.getAttribute('data-char-id');
            const isPrivate = toggle.checked; // This is already a boolean

            try {
                // Corrected template literal syntax
                const response = await fetch(`/api/characters/${charId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isPrivate: isPrivate }) // Send boolean directly
                });

                const result = await response.json();

                if (result.success) {
                    console.log(result.message);
                    // No need to reload, the UI state (checkbox) already reflects the change.
                    // alert(result.message); // Optionally show a temporary alert
                } else {
                    toggle.checked = !isPrivate; // Revert the toggle if update failed
                    alert(`Erro: ${result.message}`);
                }

            } catch (error) {
                console.error('Erro ao alternar privacidade:', error);
                toggle.checked = !isPrivate; // Revert on network/server error
                alert('Erro ao alternar privacidade. Tente novamente.');
            }
        }
    });

});