document.addEventListener('DOMContentLoaded', () => {

    // --- Funcionalidade das Abas (Mensagem / Print) ---
    const tabMsg = document.getElementById('tab-msg');
    const tabAnexo = document.getElementById('tab-anexo');
    const paneMsg = document.getElementById('pane-msg');
    const paneAnexo = document.getElementById('pane-anexo');

    if (tabMsg && tabAnexo && paneMsg && paneAnexo) {
        tabMsg.addEventListener('click', () => {
            tabMsg.classList.add('active');
            tabAnexo.classList.remove('active');
            paneMsg.classList.add('active');
            paneAnexo.classList.remove('active');
        });

        tabAnexo.addEventListener('click', () => {
            tabAnexo.classList.add('active');
            tabMsg.classList.remove('active');
            paneAnexo.classList.add('active');
            paneMsg.classList.remove('active');
        });
    }

    // --- Preview de Imagem para Anexo ---
    const screenshotInput = document.getElementById('screenshot');
    const previewImg = document.getElementById('preview-img');

    if (screenshotInput && previewImg) {
        screenshotInput.addEventListener('change', function() {
            // Verifica se um arquivo foi selecionado
            if (this.files && this.files[0]) {
                const file = this.files[0];
                // Verifica se o arquivo é uma imagem
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        previewImg.removeAttribute('hidden'); // Mostra a imagem
                    };
                    reader.readAsDataURL(file); // Lê o arquivo como URL de dados
                } else {
                    // Se não for imagem, esconde o preview e mostra mensagem
                    previewImg.src = '';
                    previewImg.setAttribute('hidden', '');
                    alert('Por favor, selecione um arquivo de imagem (PNG, JPG, JPEG, WEBP).');
                }
            } else {
                // Se nenhum arquivo for selecionado (ou clear), esconde o preview
                previewImg.src = '';
                previewImg.setAttribute('hidden', '');
            }
        });
    }

    // --- Funcionalidade do FAQ (Acordeão) ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item'); // Pega o item FAQ pai
            faqItem.classList.toggle('active'); // Adiciona/remove a classe 'active'
        });
    });

    // --- Envio do Formulário de Contato (Exemplo - Backend Requerido) ---
    const supportForm = document.getElementById('support-form');
    const alertSuccess = document.getElementById('alert-success');
    const alertDanger = document.getElementById('alert-danger');

    if (supportForm) {
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            // Oculta alertas anteriores
            alertSuccess.style.display = 'none';
            alertDanger.style.display = 'none';

            // Em uma aplicação real, você enviaria os dados do formulário para um servidor
            // com `FormData` e `fetch()` ou `XMLHttpRequest`.
            // Exemplo:
            // const formData = new FormData(supportForm);
            // try {
            //     const response = await fetch('/api/submit-support', {
            //         method: 'POST',
            //         body: formData
            //     });
            //     const result = await response.json();
            //     if (result.success) {
            //         alertSuccess.style.display = 'block';
            //         supportForm.reset(); // Limpa o formulário em caso de sucesso
            //         previewImg.src = ''; // Limpa o preview da imagem
            //         previewImg.setAttribute('hidden', '');
            //         tabMsg.click(); // Volta para a aba de mensagem
            //     } else {
            //         alertDanger.style.display = 'block';
            //     }
            // } catch (error) {
            //     console.error('Erro ao enviar formulário:', error);
            //     alertDanger.style.display = 'block';
            // }

            // --- SIMULAÇÃO de Envio (APENAS PARA DEMONSTRAÇÃO) ---
            console.log('Simulando envio de formulário...');
            // Simula um delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            // Simula sucesso ou falha aleatoriamente
            if (Math.random() > 0.3) { // 70% de chance de sucesso
                alertSuccess.style.display = 'block';
                supportForm.reset(); // Limpa o formulário
                previewImg.src = ''; // Limpa o preview da imagem
                previewImg.setAttribute('hidden', '');
                tabMsg.click(); // Volta para a aba de mensagem
                console.log('Mensagem enviada com sucesso (simulado)!');
            } else {
                alertDanger.style.display = 'block';
                console.error('Erro ao enviar mensagem (simulado)!');
            }
            // --- FIM DA SIMULAÇÃO ---
        });
    }

    // --- Adicione as traduções para as novas chaves no seu lang.js ---
    // (Apenas para referência, esta lógica deve estar no seu arquivo lang.js)
    /*
    const translations = {
        'pt-BR': {
            'instagram-title': 'Instagram',
            'instagram-support': 'Siga-nos para novidades, eventos e conteúdos exclusivos.',
            'contact-tab-message': 'Mensagem',
            'contact-tab-attachment': 'Print / Anexo',
            'form-name': 'Nome',
            'form-email': 'E-mail',
            'form-subject': 'Assunto',
            'form-subject-select': 'Selecione',
            'form-subject-bug': 'Bug',
            'form-subject-account': 'Conta',
            'form-subject-payment': 'Pagamento',
            'form-subject-suggestion': 'Sugestão',
            'form-subject-other': 'Outro',
            'form-message': 'Mensagem',
            'form-screenshot-placeholder': 'Arraste a imagem aqui ou clique para selecionar',
            'form-submit': 'Enviar',
            'faq-q7': 'Existe um canal oficial para sugestões?',
            'faq-a7': 'Sim! Você pode enviar suas sugestões através do formulário de contato nesta página, selecionando o assunto "Sugestão". Além disso, temos um canal dedicado no nosso servidor Discord onde a comunidade pode discutir e votar em ideias.',
            'faq-q8': 'Como faço para participar de eventos no jogo?',
            'faq-a8': 'Nossos eventos são anunciados no Discord, Instagram e no Fórum. Fique de olho nesses canais para saber as datas, horários e requisitos de participação. Alguns eventos podem exigir um certo nível ou itens específicos para entrar.',
            // ... outras traduções existentes
        },
        'en-US': {
            'instagram-title': 'Instagram',
            'instagram-support': 'Follow us for news, events, and exclusive content.',
            'contact-tab-message': 'Message',
            'contact-tab-attachment': 'Screenshot / Attachment',
            'form-name': 'Name',
            'form-email': 'Email',
            'form-subject': 'Subject',
            'form-subject-select': 'Select',
            'form-subject-bug': 'Bug',
            'form-subject-account': 'Account',
            'form-subject-payment': 'Payment',
            'form-subject-suggestion': 'Suggestion',
            'form-subject-other': 'Other',
            'form-message': 'Message',
            'form-screenshot-placeholder': 'Drag image here or click to select',
            'form-submit': 'Send',
            'faq-q7': 'Is there an official channel for suggestions?',
            'faq-a7': 'Yes! You can submit your suggestions via the contact form on this page, selecting "Suggestion" as the subject. Additionally, we have a dedicated channel on our Discord server where the community can discuss and vote on ideas.',
            'faq-q8': 'How do I participate in in-game events?',
            'faq-a8': 'Our events are announced on Discord, Instagram, and the Forum. Keep an eye on these channels for dates, times, and participation requirements. Some events may require a certain level or specific items to enter.',
            // ... other existing translations
        }
    };
    */
});