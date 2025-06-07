// mapa.js

const mapViewport = document.querySelector('.map-viewport');
const mapContent = document.querySelector('.map-content');
const gameMap = document.getElementById('gameMap');
const mapMarkers = document.getElementById('mapMarkers');
const tooltip = document.getElementById('tooltip'); 

let scale = 1;
let translateX = 0;
let translateY = 0;
// isDragging, startX, startY não são mais necessários para arrastar, já foram desativados.
const originalMapWidth = 1000;
const originalMapHeight = 1000;

// Função auxiliar para limitar um valor entre um mínimo e um máximo
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function initializeMap() {
    const viewportWidth = mapViewport.offsetWidth;
    const viewportHeight = mapViewport.offsetHeight;

    // A lógica de escala inicial ainda serve para garantir que o mapa preencha o viewport
    scale = Math.max(
        viewportWidth / originalMapWidth,
        viewportHeight / originalMapHeight
    );
    
    // Limites de zoom
    scale = Math.max(0.5, Math.min(scale, 3)); 

    // Centraliza o mapa no viewport inicialmente
    translateX = (viewportWidth - originalMapWidth * scale) / 2;
    translateY = (viewportHeight - originalMapHeight * scale) / 2;

    applyTransform(); // Aplica a transformação inicial e limita as posições
    positionMarkers(); 
}

function applyTransform() {
    const viewportWidth = mapViewport.offsetWidth;
    const viewportHeight = mapViewport.offsetHeight;
    const scaledMapWidth = originalMapWidth * scale;
    const scaledMapHeight = originalMapHeight * scale;

    let finalTranslateX = translateX;
    let finalTranslateY = translateY;

    // Limita a translação X
    if (scaledMapWidth < viewportWidth) {
        // Se o mapa for menor que o viewport, centraliza
        finalTranslateX = (viewportWidth - scaledMapWidth) / 2;
    } else {
        // Se o mapa for maior, limita dentro das bordas para evitar espaço em branco
        const minX = viewportWidth - scaledMapWidth;
        finalTranslateX = clamp(translateX, minX, 0); // clamp(valor, min, max)
    }

    // Limita a translação Y
    if (scaledMapHeight < viewportHeight) {
        // Se o mapa for menor que o viewport, centraliza
        finalTranslateY = (viewportHeight - scaledMapHeight) / 2;
    } else {
        // Se o mapa for maior, limita dentro das bordas para evitar espaço em branco
        const minY = viewportHeight - scaledMapHeight;
        finalTranslateY = clamp(translateY, minY, 0);
    }
    
    // Atualiza as variáveis globais após o limite
    translateX = finalTranslateX;
    translateY = finalTranslateY;

    mapContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function positionMarkers() {
    const markers = mapMarkers.querySelectorAll('.marker');
    markers.forEach(marker => {
        const x = parseFloat(marker.dataset.x);
        const y = parseFloat(marker.dataset.y);
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    });
}

// Listeners de arrastar (já foram desativados no pedido anterior)
mapViewport.addEventListener('mousedown', (e) => {
    // Conteúdo removido/comentado
});

mapViewport.addEventListener('mousemove', (e) => {
    // Conteúdo removido/comentado
});

mapViewport.addEventListener('mouseup', () => {
    mapViewport.classList.remove('grabbing');
});

mapViewport.addEventListener('mouseleave', () => {
    mapViewport.classList.remove('grabbing');
});

// ALTERAÇÃO AQUI: Evento de roda do mouse para PAN
mapViewport.addEventListener('wheel', (e) => {
    e.preventDefault(); // Impede o scroll da página

    const panSpeed = 2; // Ajuste este valor para controlar a velocidade do pan (quanto maior, mais rápido)

    // Move o mapa com base no delta da roda do mouse
    // e.deltaX para movimento horizontal
    // e.deltaY para movimento vertical
    translateX -= e.deltaX * panSpeed;
    translateY -= e.deltaY * panSpeed;

    applyTransform(); // Aplica a nova translação e garante que está dentro dos limites
});

mapMarkers.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('marker')) {
        const marker = e.target;
        const name = marker.dataset.name;
        tooltip.textContent = name;
        tooltip.classList.add('visible');
        
        const rect = marker.getBoundingClientRect(); 
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)'; 
    }
});

mapMarkers.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('marker')) {
        tooltip.classList.remove('visible');
    }
});

document.addEventListener('DOMContentLoaded', initializeMap); 
window.addEventListener('resize', initializeMap); 