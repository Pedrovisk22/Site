
const colorMap = [
    "#000000", "#050505", "#0a0a0a", "#0f0f0f", "#141414", "#1a1a1a", "#1f1f1f", "#242424", "#292929", "#2e2e2e", "#333333", "#383838", "#3d3d3d", "#424242", "#474747", "#4d4d4d", "#525252", "#575757", "#5c5c5c", "#616161", "#666666", "#6b6b6b", "#707070", "#757575", "#7a7a7a", "#808080", "#858585", "#8a8a8a", "#8f8f8f", "#949494", "#999999", "#9e9e9e", "#a3a3a3", "#a8a8a8", "#adadad", "#b2b2b2", "#b8b8b8", "#bdbdbd", "#c2c2c2", "#c7c7c7", "#cccccc", "#d1d1d1", "#d6d6d6", "#dbdbdb", "#e0e0e0", "#e5e5e5", "#ebebeb", "#f0f0f0", "#f5f5f5", "#fafafa", "#ffffff", // 0-51: Grayscale
    "#ff0000", "#b20000", "#800000", "#4c0000", "#ff4c4c", "#b23333", "#802424", "#4c1515", // 52-59: Reds
    "#00ff00", "#00b200", "#008000", "#004c00", "#4cff4c", "#33b233", "#248024", "#154c15", // 60-67: Greens
    "#0000ff", "#0000b2", "#000080", "#00004c", "#4c4cff", "#3333b2", "#242480", "#15154c", // 68-75: Blues
    "#ffff00", "#b2b200", "#808000", "#4c4c00", "#ffff4c", "#b2b233", "#808024", "#4c4c15", // 76-83: Yellows
    "#ff00ff", "#b200b2", "#800080", "#4c004c", "#ff4cff", "#b233b2", "#802480", "#4c154c", // 84-91: Magentas
    "#00ffff", "#00b2b2", "#008080", "#004c4c", "#4cffff", "#33b2b2", "#248080", "#154c4c", // 92-99: Cyans
    "#ff8000", "#b25a00", "#804000", "#4c2600", "#ff9933", "#b26b24", "#804d15", "#4c2e09", // 100-107: Oranges
    "#80ff00", "#5ab200", "#408000", "#264c00", "#99ff33", "#6bb224", "#4d8015", "#2e4c09", // 108-115: Lime/Chartreuse
    "#0080ff", "#005ab2", "#004080", "#00264c", "#3399ff", "#246bb2", "#154d80", "#092e4c", // 116-123: Azure/Deep Blue
    "#8000ff", "#5a00b2", "#400080", "#26004c", "#9933ff", "#6b24b2", "#4d1580", "#2e094c", // 124-131: Violets/Purples
];

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function getColorRgb(colorIndex) {
    if (colorIndex === undefined || colorIndex === null) {
        colorIndex = 0; // Default color (e.g., white or black, depending on your map[0])
    }
    // Ensure index is within bounds
    colorIndex = Math.max(0, Math.min(colorMap.length - 1, colorIndex));
    const hex = colorMap[colorIndex];
    return hexToRgb(hex);
}

module.exports = {
    getColorRgb
};
