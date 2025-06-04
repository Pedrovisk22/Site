const mapViewport = document.querySelector('.map-viewport');
const mapContent = document.querySelector('.map-content');
const gameMap = document.getElementById('gameMap');
const mapMarkers = document.getElementById('mapMarkers');
const tooltip = document.getElementById('tooltip'); // Agora position: fixed no CSS

let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX;
let startY;
const originalMapWidth = 1000;
const originalMapHeight = 1000;

function initializeMap() {
    // Estas dimensões agora serão as do .map-viewport, que tem uma altura fixa
    const viewportWidth = mapViewport.offsetWidth;
    const viewportHeight = mapViewport.offsetHeight;

    // Garante que o mapa comece visível e preenchendo a área do viewport
    // Ajustado para um zoom inicial mais razoável se o mapa for muito maior que o viewport
    scale = Math.min(
        viewportWidth / originalMapWidth,
        viewportHeight / originalMapHeight
    );
    // Definir limites razoáveis para zoom
    scale = Math.max(0.5, Math.min(scale, 3)); // Mínimo 0.5x, Máximo 3x

    // Centraliza o mapa no viewport
    translateX = (viewportWidth - originalMapWidth * scale) / 2;
    translateY = (viewportHeight - originalMapHeight * scale) / 2;

    applyTransform();
    positionMarkers(); // Marcadores são posicionados uma única vez, a escala do mapa cuida do resto
}

function applyTransform() {
    mapContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function positionMarkers() {
    // Esta função apenas define a posição ORIGINAL dos marcadores.
    // A escala e a translação do mapContent se aplicam a eles automaticamente.
    const markers = mapMarkers.querySelectorAll('.marker');
    markers.forEach(marker => {
        const x = parseFloat(marker.dataset.x);
        const y = parseFloat(marker.dataset.y);
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    });
}

mapViewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    mapViewport.classList.add('grabbing');
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
});

mapViewport.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Impede o scroll da página enquanto arrasta o mapa
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
});

mapViewport.addEventListener('mouseup', () => {
    isDragging = false;
    mapViewport.classList.remove('grabbing');
});

mapViewport.addEventListener('mouseleave', () => {
    isDragging = false;
    mapViewport.classList.remove('grabbing');
});

mapViewport.addEventListener('wheel', (e) => {
    e.preventDefault(); // Impede o scroll da página ao rolar a roda sobre o mapa

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const oldScale = scale;
    const zoomAmount = 0.1;
    
    if (e.deltaY < 0) { // Zoom in
        scale += zoomAmount;
    } else { // Zoom out
        scale -= zoomAmount;
    }

    scale = Math.max(0.2, Math.min(scale, 3)); // Limites de zoom

    // Calcula nova translação para manter o ponto do mouse fixo
    // (mouseX - translateX) é a posição do mouse em relação ao *conteúdo* do mapa
    translateX = mouseX - ((mouseX - translateX) / oldScale) * scale;
    translateY = mouseY - ((mouseY - translateY) / oldScale) * scale;

    applyTransform();
});

mapMarkers.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('marker')) {
        const marker = e.target;
        const name = marker.dataset.name;
        tooltip.textContent = name;
        tooltip.classList.add('visible');
        
        // As coordenadas do tooltip agora são relativas à janela (viewport)
        const rect = marker.getBoundingClientRect(); // Pega a posição do marcador na tela
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)'; // Centraliza o tooltip acima do marcador
    }
});

mapMarkers.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('marker')) {
        tooltip.classList.remove('visible');
    }
});

// A inicialização do mapa pode ser atrasada para garantir que todos os elementos foram renderizados
// window.addEventListener('load', initializeMap); // Pode ser tarde demais se o EJS for lento
document.addEventListener('DOMContentLoaded', initializeMap); // Melhor para garantir que o DOM está pronto
window.addEventListener('resize', initializeMap); // Recalcula ao redimensionar a janela