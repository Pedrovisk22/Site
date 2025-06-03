// public/js/register_step2.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('register_step2.js carregado');

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const passwordStrengthTextDiv = document.getElementById('password-strength-text'); // Texto (Fraca, Forte)
    const passwordStrengthBar = document.getElementById('password-strength-bar'); // A barra visual
    const passwordMatchDiv = document.getElementById('password-match');
    const registerStep2Form = document.getElementById('registerStep2Form');
    const countrySelect = document.getElementById('country');


    // Lista de países (use a mesma lista do script anterior)
     const countries = [
        { code: 'AF', name: 'Afeganistão' }, { code: 'ZA', name: 'África do Sul' }, { code: 'AL', name: 'Albânia' },
        { code: 'DE', name: 'Alemanha' }, { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' },
        { code: 'AI', name: 'Anguilla' }, { code: 'AQ', name: 'Antártida' }, { code: 'AG', name: 'Antígua e Barbuda' },
        { code: 'SA', name: 'Arábia Saudita' }, { code: 'DZ', name: 'Argélia' }, { code: 'AR', name: 'Argentina' },
        { code: 'AM', name: 'Armênia' }, { code: 'AW', name: 'Aruba' }, { code: 'AU', name: 'Austrália' },
        { code: 'AT', name: 'Áustria' }, { code: 'AZ', name: 'Azerbaijão' }, { code: 'BS', name: 'Bahamas' },
        { code: 'BH', name: 'Bahrein' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
        { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Bélgica' }, { code: 'BZ', name: 'Belize' },
        { code: 'BJ', name: 'Benin' }, { code: 'BM', name: 'Bermudas' }, { code: 'BO', name: 'Bolívia' },
        { code: 'BA', name: 'Bósnia e Herzegovina' }, { code: 'BW', name: 'Botsuana' }, { code: 'BR', name: 'Brasil' },
        { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgária' }, { code: 'BF', name: 'Burkina Faso' },
        { code: 'BI', name: 'Burundi' }, { code: 'BT', name: 'Butão' }, { code: 'CV', name: 'Cabo Verde' },
        { code: 'KH', name: 'Camboja' }, { code: 'CA', name: 'Canadá' }, { code: 'QA', name: 'Catar' },
        { code: 'KZ', name: 'Cazaquistão' }, { code: 'CF', name: 'República Centro-Africana' }, { code: 'TD', name: 'Chade' },
        { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' }, { code: 'CY', name: 'Chipre' },
        { code: 'CO', name: 'Colômbia' }, { code: 'KM', name: 'Comores' }, { code: 'CG', name: 'República do Congo' },
        { code: 'CD', name: 'República Democrática do Congo' }, { code: 'KP', name: 'Coreia do Norte' }, { code: 'KR', name: 'Coreia do Sul' },
        { code: 'CI', name: 'Costa do Marfim' }, { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croácia' },
        { code: 'CU', name: 'Cuba' }, { code: 'DK', name: 'Dinamarca' }, { code: 'DJ', name: 'Djibouti' },
        { code: 'DM', name: 'Dominica' }, { code: 'EG', name: 'Egito' }, { code: 'SV', name: 'El Salvador' },
        { code: 'AE', name: 'Emirados Árabes Unidos' }, { code: 'EC', name: 'Equador' }, { code: 'ER', name: 'Eritreia' },
        { code: 'SK', name: 'Eslováquia' }, { code: 'SI', name: 'Eslovênia' }, { code: 'ES', name: 'Espanha' },
        { code: 'US', name: 'Estados Unidos' }, { code: 'EE', name: 'Estônia' }, { code: 'ET', name: 'Etiópia' },
        { code: 'FJ', name: 'Fiji' }, { code: 'PH', name: 'Filipinas' }, { code: 'FI', name: 'Finlândia' },
        { code: 'FR', name: 'França' }, { code: 'GA', name: 'Gabão' }, { code: 'GM', name: 'Gâmbia' },
        { code: 'GH', name: 'Gana' }, { code: 'GE', name: 'Geórgia' }, { code: 'GI', name: 'Gibraltar' },
        { code: 'GD', name: 'Granada' }, { code: 'GR', name: 'Grécia' }, { code: 'GL', name: 'Groenlândia' },
        { code: 'GP', name: 'Guadalupe' }, { code: 'GU', name: 'Guam' }, { code: 'GT', name: 'Guatemala' },
        { code: 'GY', name: 'Guiana' }, { code: 'GF', name: 'Guiana Francesa' }, { code: 'GN', name: 'Guiné' },
        { code: 'GW', name: 'Guiné-Bissau' }, { code: 'GQ', name: 'Guiné Equatorial' }, { code: 'HT', name: 'Haiti' },
        { code: 'HN', name: 'Honduras' }, { code: 'HK', name: 'Hong Kong' }, { code: 'HU', name: 'Hungria' },
        { code: 'YE', name: 'Iêmen' }, { code: 'BV', name: 'Ilha Bouvet' }, { code: 'CX', name: 'Ilha Christmas' },
        { code: 'NF', name: 'Ilha Norfolk' }, { code: 'AX', name: 'Ilhas Aland' }, { code: 'KY', name: 'Ilhas Cayman' },
        { code: 'CC', name: 'Ilhas Cocos (Keeling)' }, { code: 'CK', name: 'Ilhas Cook' }, { code: 'FO', name: 'Ilhas Feroe' },
        { code: 'FK', name: 'Ilhas Malvinas' }, { code: 'MP', name: 'Ilhas Marianas do Norte' }, { code: 'MH', name: 'Ilhas Marshall' },
        { code: 'PN', name: 'Ilhas Pitcairn' }, { code: 'SB', name: 'Ilhas Salomão' }, { code: 'TC', name: 'Ilhas Turks e Caicos' },
        { code: 'UM', name: 'Ilhas Menores Distantes dos Estados Unidos' }, { code: 'VG', name: 'Ilhas Virgens Britânicas' }, { code: 'VI', name: 'Ilhas Virgens Americanas' },
        { code: 'HM', name: 'Ilhas Heard e McDonald' }, { code: 'IE', name: 'Irlanda' }, { code: 'IR', name: 'Irã' },
        { code: 'IQ', name: 'Iraque' }, { code: 'IS', name: 'Islândia' }, { code: 'IL', name: 'Israel' },
        { code: 'IT', name: 'Itália' }, { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japão' },
        { code: 'JO', name: 'Jordânia' }, { code: 'KW', name: 'Kuwait' }, { code: 'LA', name: 'Laos' },
        { code: 'LS', name: 'Lesoto' }, { code: 'LV', name: 'Letônia' }, { code: 'LB', name: 'Líbano' },
        { code: 'LR', name: 'Libéria' }, { code: 'LY', name: 'Líbia' }, { code: 'LI', name: 'Liechtenstein' },
        { code: 'LT', name: 'Lituânia' }, { code: 'LU', name: 'Luxemburgo' }, { code: 'MO', name: 'Macau' },
        { code: 'MK', name: 'Macedônia do Norte' }, { code: 'MG', name: 'Madagascar' }, { code: 'MY', name: 'Malásia' },
        { code: 'MW', name: 'Malawi' }, { code: 'MV', name: 'Maldivas' }, { code: 'ML', name: 'Mali' },
        { code: 'MT', name: 'Malta' }, { code: 'FK', name: 'Ilhas Malvinas' }, { code: 'MP', name: 'Ilhas Marianas do Norte' },
        { code: 'MH', name: 'Ilhas Marshall' }, { code: 'MQ', name: 'Martinica' }, { code: 'MR', name: 'Mauritânia' },
        { code: 'MU', name: 'Maurício' }, { code: 'YT', name: 'Mayotte' }, { code: 'MX', name: 'México' },
        { code: 'FM', name: 'Micronésia' }, { code: 'MZ', name: 'Moçambique' }, { code: 'MD', name: 'Moldávia' },
        { code: 'MC', name: 'Mônaco' }, { code: 'MN', name: 'Mongólia' }, { code: 'ME', name: 'Montenegro' },
        { code: 'MS', name: 'Montserrat' }, { code: 'MA', name: 'Marrocos' }, { code: 'MM', name: 'Mianmar' },
        { code: 'NA', name: 'Namíbia' }, { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' },
        { code: 'NL', name: 'Países Baixos' }, { code: 'AN', name: 'Antilhas Holandesas' }, { code: 'NC', name: 'Nova Caledônia' },
        { code: 'NZ', name: 'Nova Zelândia' }, { code: 'NI', name: 'Nicarágua' }, { code: 'NE', name: 'Níger' },
        { code: 'NG', name: 'Nigéria' }, { code: 'NU', name: 'Niue' }, { code: 'NO', name: 'Noruega' },
        { code: 'OM', name: 'Omã' }, { code: 'PW', name: 'Palau' }, { code: 'PA', name: 'Panamá' },
        { code: 'PG', name: 'Papua Nova Guiné' }, { code: 'PK', name: 'Paquistão' }, { code: 'PY', name: 'Paraguai' },
        { code: 'PE', name: 'Peru' }, { code: 'PF', name: 'Polinésia Francesa' }, { code: 'PL', name: 'Polônia' },
        { code: 'PR', name: 'Porto Rico' }, { code: 'PT', name: 'Portugal' }, { code: 'KE', name: 'Quênia' },
        { code: 'KG', name: 'Quirguistão' }, { code: 'KI', name: 'Kiribati' }, { code: 'GB', name: 'Reino Unido' },
        { code: 'CZ', name: 'República Tcheca' }, { code: 'DO', name: 'República Dominicana' }, { code: 'RE', name: 'Reunião' },
        { code: 'RO', name: 'Romênia' }, { code: 'RW', name: 'Ruanda' }, { code: 'RU', name: 'Rússia' },
        { code: 'EH', name: 'Saara Ocidental' }, { code: 'PM', name: 'Saint Pierre e Miquelon' }, { code: 'WS', name: 'Samoa' },
        { code: 'AS', name: 'Samoa Americana' }, { code: 'SM', name: 'San Marino' }, { code: 'SH', name: 'Santa Helena' },
        { code: 'LC', name: 'Santa Lúcia' }, { code: 'KN', name: 'São Cristóvão e Nevis' }, { code: 'MF', name: 'São Martinho (Parte Francesa)' },
        { code: 'SX', name: 'São Martinho (Parte Holandesa)' }, { code: 'ST', name: 'São Tomé e Príncipe' }, { code: 'VC', name: 'São Vicente e Granadinas' },
        { code: 'SN', name: 'Senegal' }, { code: 'SL', name: 'Serra Leoa' }, { code: 'RS', name: 'Sérvia' },
        { code: 'SG', name: 'Singapura' }, { code: 'SY', name: 'Síria' }, { code: 'SO', name: 'Somália' },
        { code: 'LK', name: 'Sri Lanka' }, { code: 'SZ', name: 'Eswatini' }, { code: 'SD', name: 'Sudão' },
        { code: 'SS', name: 'Sudão do Sul' }, { code: 'SE', name: 'Suécia' }, { code: 'CH', name: 'Suíça' },
        { code: 'SR', name: 'Suriname' }, { code: 'SJ', name: 'Svalbard e Jan Mayen' }, { code: 'TJ', name: 'Tajiquistão' },
        { code: 'TH', name: 'Tailândia' }, { code: 'TW', name: 'Taiwan' }, { code: 'TZ', name: 'Tanzânia' },
        { code: 'TF', name: 'Terras Austrais Francesas' }, { code: 'IO', name: 'Território Britânico do Oceano Índico' }, { code: 'TL', name: 'Timor-Leste' },
        { code: 'TG', name: 'Togo' }, { code: 'TK', name: 'Tokelau' }, { code: 'TO', name: 'Tonga' },
        { code: 'TT', name: 'Trinidad e Tobago' }, { code: 'TN', name: 'Tunísia' }, { code: 'TM', name: 'Turcomenistão' },
        { code: 'TR', name: 'Turquia' }, { code: 'TV', name: 'Tuvalu' }, { code: 'UA', name: 'Ucrânia' },
        { code: 'UG', name: 'Uganda' }, { code: 'UY', name: 'Uruguai' }, { code: 'UZ', name: 'Uzbequistão' },
        { code: 'VU', name: 'Vanuatu' }, { code: 'VA', name: 'Cidade do Vaticano' }, { code: 'VE', name: 'Venezuela' },
        { code: 'VN', name: 'Vietnã' }, { code: 'WF', name: 'Wallis e Futuna' }, { code: 'ZM', name: 'Zâmbia' },
        { code: 'ZW', name: 'Zimbábue' }
     ];


    // Popular o select com países e inicializar Select2
    if (countrySelect) {
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code; // Usar código do país como valor
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });

        // Inicializar Select2
        $(countrySelect).select2({
             placeholder: "Selecione um país...",
             theme: "default" // Use um tema padrão ou personalize com CSS
        });
         // Define o valor selecionado se houver um valor pré-preenchido (do formData)
         // No EJS, você precisaria passar formData.country para cá, talvez via data attribute ou variável JS
         // Exemplo: <select id="country" name="country" required data-preselected="<%= typeof formData !== 'undefined' ? formData.country : '' %>">
         // const preselectedCountry = countrySelect.getAttribute('data-preselected');
         // if(preselectedCountry){
         //      $(countrySelect).val(preselectedCountry).trigger('change');
         // }
    }


    // Função para verificar a força da senha (Front-end)
    function checkPasswordStrength(password) {
        let strength = 0;
        // Implementar as mesmas regras do back-end (mínimo 8, maiúscula, minúscula, número, especial)
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        // Verifica se tem pelo menos um caractere que NÃO é letra, número ou underline
        const hasSpecial = !/^[a-zA-Z0-9_]+$/.test(password) && password.length > 0;


        if (password.length >= minLength) strength++;
        if (hasUpper) strength++;
        if (hasLower) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++; // Conta como um ponto se tiver algum caractere especial

        // Atualizar texto e barra visual
        let strengthText = '';
        let barWidth = 0;
        let barColor = '';

         if (password.length === 0) {
            strengthText = ''; // Nenhum feedback se vazio
            barWidth = 0;
            barColor = 'transparent';
         } else if (strength < 3) { // Fraca ou Média
             strengthText = strength < 2 ? 'Fraca' : 'Média';
             barWidth = strength < 2 ? '25%' : '50%'; // Ex: 25% Fraca, 50% Média
             barColor = strength < 2 ? 'red' : 'orange';
         } else if (strength === 3) {
             strengthText = 'Boa';
             barWidth = '75%';
             barColor = 'yellowgreen';
         } else { // strength >= 4
             strengthText = 'Muito Forte';
             barWidth = '100%';
             barColor = 'green';
         }

        passwordStrengthTextDiv.textContent = strengthText;
        passwordStrengthTextDiv.style.color = barColor;

        // Atualiza a barra
        passwordStrengthBar.style.width = barWidth;
        passwordStrengthBar.style.backgroundColor = barColor;
    }

    // Função para verificar se as senhas coincidem (Front-end)
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length === 0 && password.length === 0) {
             passwordMatchDiv.textContent = ''; // Nenhum feedback se ambos vazios
             passwordMatchDiv.style.color = '';
             return false;
        }
         if (confirmPassword.length === 0) {
              passwordMatchDiv.textContent = 'Confirme a senha.'; // feedback se confirmação vazia mas senha preenchida
              passwordMatchDiv.style.color = 'orange';
              return false;
         }


        if (password === confirmPassword) {
            passwordMatchDiv.textContent = 'As senhas coincidem.';
            passwordMatchDiv.style.color = 'green';
            return true;
        } else {
            passwordMatchDiv.textContent = 'As senhas não coincidem!';
            passwordMatchDiv.style.color = 'red';
            return false;
        }
    }

    // Event listeners para validação em tempo real
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            checkPasswordStrength(passwordInput.value);
            checkPasswordMatch(); // Verifica a coincidência ao digitar a primeira senha
        });
    }
     if (confirmPasswordInput) {
         confirmPasswordInput.addEventListener('input', checkPasswordMatch);
     }

     // Chamada inicial para mostrar o estado se os campos já estiverem preenchidos (ex: erro de validação do server)
     if (passwordInput && passwordInput.value) {
         checkPasswordStrength(passwordInput.value);
     }
     if (confirmPasswordInput && confirmPasswordInput.value) {
         checkPasswordMatch();
     }


    // Validação final no submit (além da validação do servidor)
    if (registerStep2Form) {
        registerStep2Form.addEventListener('submit', (event) => {
             // Verifica se as senhas coincidem antes de enviar
             if (!checkPasswordMatch()) {
                 event.preventDefault();
                 // Opcional: scroll para o erro
                 passwordMatchDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 return;
             }

             // Você pode adicionar aqui uma verificação mínima de força,
             // mas a validação principal de força é feita no servidor.
             // Ex: if (passwordStrengthBar.style.width === '0%') { ... }
             // Ou checkPasswordStrength(passwordInput.value) e impedir se for muito fraca.

             console.log('Formulário de registro da Etapa 2 enviado.');
        });
    }

    // Manter a validação da barra e match mesmo quando a página recarrega com erro
     // (Isto é, se o EJS pré-encher os campos com formData do server)
     if (passwordInput.value || confirmPasswordInput.value) {
         checkPasswordStrength(passwordInput.value);
         checkPasswordMatch();
     }


});