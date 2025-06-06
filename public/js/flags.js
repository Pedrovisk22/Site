const countryNameToCodeMap = {
    'Afeganistão': 'AF', 'África do Sul': 'ZA', 'Albânia': 'AL', 'Alemanha': 'DE',
    'Andorra': 'AD', 'Angola': 'AO', 'Anguilla': 'AI', 'Antártida': 'AQ',
    'Antígua e Barbuda': 'AG', 'Arábia Saudita': 'SA', 'Argélia': 'DZ',
    'Argentina': 'AR', 'Armênia': 'AM', 'Aruba': 'AW', 'Austrália': 'AU',
    'Áustria': 'AT', 'Azerbaijão': 'AZ', 'Bahamas': 'BS', 'Bahrein': 'BH',
    'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY', 'Bélgica': 'BE',
    'Belize': 'BZ', 'Benin': 'BJ', 'Bermudas': 'BM', 'Bolívia': 'BO',
    'Bósnia e Herzegovina': 'BA', 'Botsuana': 'BW', 'Brasil': 'BR', 'Brunei': 'BN',
    'Bulgária': 'BG', 'Burkina Faso': 'BF', 'Burundi': 'BI', 'Butão': 'BT',
    'Cabo Verde': 'CV', 'Camboja': 'KH', 'Canadá': 'CA', 'Catar': 'QA',
    'Cazaquistão': 'KZ', 'República Centro-Africana': 'CF', 'Chade': 'TD',
    'Chile': 'CL', 'China': 'CN', 'Chipre': 'CY', 'Colômbia': 'CO',
    'Comores': 'KM', 'República do Congo': 'CG', 'República Democrática do Congo': 'CD',
    'Coreia do Norte': 'KP', 'Coreia do Sul': 'KR', 'Costa do Marfim': 'CI',
    'Costa Rica': 'CR', 'Croácia': 'HR', 'Cuba': 'CU', 'Dinamarca': 'DK',
    'Djibouti': 'DJ', 'Dominica': 'DM', 'Egito': 'EG', 'El Salvador': 'SV',
    'Emirados Árabes Unidos': 'AE', 'Equador': 'EC', 'Eritreia': 'ER',
    'Eslováquia': 'SK', 'Eslovênia': 'SI', 'Espanha': 'ES', 'Estados Unidos': 'US',
    'Estônia': 'EE', 'Etiópia': 'ET', 'Fiji': 'FJ', 'Filipinas': 'PH',
    'Finlândia': 'FI', 'França': 'FR', 'Gabão': 'GA', 'Gâmbia': 'GM',
    'Gana': 'GH', 'Geórgia': 'GE', 'Gibraltar': 'GI', 'Granada': 'GD',
    'Grécia': 'GR', 'Groenlândia': 'GL', 'Guadalupe': 'GP', 'Guam': 'GU',
    'Guatemala': 'GT', 'Guiana': 'GY', 'Guiana Francesa': 'GF', 'Guiné': 'GN',
    'Guiné-Bissau': 'GW', 'Guiné Equatorial': 'GQ', 'Haiti': 'HT',
    'Honduras': 'HN', 'Hong Kong': 'HK', 'Hungria': 'HU', 'Iêmen': 'YE',
    'Ilha Bouvet': 'BV', 'Ilha Christmas': 'CX', 'Ilha Norfolk': 'NF',
    'Ilhas Aland': 'AX', 'Ilhas Cayman': 'KY', 'Ilhas Cocos (Keeling)': 'CC',
    'Ilhas Cook': 'CK', 'Ilhas Feroe': 'FO', 'Ilhas Malvinas': 'FK',
    'Ilhas Marianas do Norte': 'MP', 'Ilhas Marshall': 'MH', 'Ilhas Pitcairn': 'PN',
    'Ilhas Salomão': 'SB', 'Ilhas Turks e Caicos': 'TC', 'Ilhas Menores Distantes dos Estados Unidos': 'UM',
    'Ilhas Virgens Britânicas': 'VG', 'Ilhas Virgens Americanas': 'VI', 'Ilhas Heard e McDonald': 'HM',
    'Irlanda': 'IE', 'Irã': 'IR', 'Iraque': 'IQ', 'Islândia': 'IS',
    'Israel': 'IL', 'Itália': 'IT', 'Jamaica': 'JM', 'Japão': 'JP',
    'Jordânia': 'JO', 'Kuwait': 'KW', 'Laos': 'LA', 'Lesoto': 'LS',
    'Letônia': 'LV', 'Líbano': 'LB', 'Libéria': 'LR', 'Líbia': 'LY',
    'Liechtenstein': 'LI', 'Lituânia': 'LT', 'Luxemburgo': 'LU', 'Macau': 'MO',
    'Macedônia do Norte': 'MK', 'Madagascar': 'MG', 'Malásia': 'MY',
    'Malawi': 'MW', 'Maldivas': 'MV', 'Mali': 'ML', 'Malta': 'MT',
    'Martinica': 'MQ', 'Mauritânia': 'MR', 'Maurício': 'MU', 'Mayotte': 'YT',
    'México': 'MX', 'Micronésia': 'FM', 'Moçambique': 'MZ', 'Moldávia': 'MD',
    'Mônaco': 'MC', 'Mongólia': 'MN', 'Montenegro': 'ME', 'Montserrat': 'MS',
    'Marrocos': 'MA', 'Mianmar': 'MM', 'Namíbia': 'NA', 'Nauru': 'NR',
    'Nepal': 'NP', 'Países Baixos': 'NL', 'Antilhas Holandesas': 'AN',
    'Nova Caledônia': 'NC', 'Nova Zelândia': 'NZ', 'Nicarágua': 'NI',
    'Níger': 'NE', 'Nigéria': 'NG', 'Niue': 'NU', 'Noruega': 'NO',
    'Omã': 'OM', 'Palau': 'PW', 'Panamá': 'PA', 'Papua Nova Guiné': 'PG',
    'Paquistão': 'PK', 'Paraguai': 'PY', 'Peru': 'PE', 'Polinésia Francesa': 'PF',
    'Polônia': 'PL', 'Porto Rico': 'PR', 'Portugal': 'PT', 'Quênia': 'KE',
    'Quirguistão': 'KG', 'Kiribati': 'KI', 'Reino Unido': 'GB', 'República Tcheca': 'CZ',
    'República Dominicana': 'DO', 'Reunião': 'RE', 'Romênia': 'RO', 'Ruanda': 'RW',
    'Rússia': 'RU', 'Saara Ocidental': 'EH', 'Saint Pierre e Miquelon': 'PM',
    'Samoa': 'WS', 'Samoa Americana': 'AS', 'San Marino': 'SM', 'Santa Helena': 'SH',
    'Santa Lúcia': 'LC', 'São Cristóvão e Nevis': 'KN', 'São Martinho (Parte Francesa)': 'MF',
    'São Martinho (Parte Holandesa)': 'SX', 'São Tomé e Príncipe': 'ST',
    'São Vicente e Granadinas': 'VC', 'Senegal': 'SN', 'Serra Leoa': 'SL',
    'Sérvia': 'RS', 'Singapura': 'SG', 'Síria': 'SY', 'Somália': 'SO',
    'Sri Lanka': 'LK', 'Eswatini': 'SZ', 'Sudão': 'SD', 'Sudão do Sul': 'SS',
    'Suécia': 'SE', 'Suíça': 'CH', 'Suriname': 'SR', 'Svalbard e Jan Mayen': 'SJ',
    'Tajiquistão': 'TJ', 'Tailândia': 'TH', 'Taiwan': 'TW', 'Tanzânia': 'TZ',
    'Terras Austrais Francesas': 'TF', 'Território Britânico do Oceano Índico': 'IO',
    'Timor-Leste': 'TL', 'Togo': 'TG', 'Tokelau': 'TK', 'Tonga': 'TO',
    'Trinidad e Tobago': 'TT', 'Tunísia': 'TN', 'Turcomenistão': 'TM', 'Turquia': 'TR',
    'Tuvalu': 'TV', 'Ucrânia': 'UA', 'Uganda': 'UG', 'Uruguai': 'UY',
    'Uzbequistão': 'UZ', 'Vanuatu': 'VU', 'Cidade do Vaticano': 'VA',
    'Venezuela': 'VE', 'Vietnã': 'VN', 'Wallis e Futuna': 'WF', 'Zâmbia': 'ZM',
    'Zimbábue': 'ZW'
};

function getFlagIconPath(countryName) {
    const code = countryNameToCodeMap[countryName] || 'BR'; // Padrão para BR se não encontrar
    return `assets/svg/flags/${code}.svg`;
}