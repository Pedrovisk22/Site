// routes/avatar.js

const express = require('express');
const router = express.Router();
const { promiseDb } = require('../db'); // Ensure you have promiseDb exported from db.js
const { renderOutfit } = require('../utils/outfitRenderer'); // Assuming this exists and works

// GET /avatar/:name - Rota para gerar a imagem do personagem
router.get('/avatar/:name', async (req, res) => {
    const characterName = req.params.name;

    if (!characterName) {
        return res.status(400).send('Nome do personagem não fornecido.');
    }

    let connection;
    try {
        connection = await promiseDb.getConnection();

        // Fetch player data including look attributes
        const [players] = await connection.execute(
            'SELECT looktype, lookhead, lookbody, looklegs, lookfeet, sex FROM players WHERE name = ? AND deleted = 0 LIMIT 1',
            [characterName]
        );

        if (players.length === 0) {
            console.warn(`[AvatarRoute] Character not found: ${characterName}`);
            // Serve a default "not found" image if available, or just 404
            // Example: return res.sendFile(path.join(__dirname, '..', 'public', 'assets', 'images', 'default_avatar_notfound.png'));
            return res.status(404).send('Personagem não encontrado.');
        }

        const player = players[0];

        // Render the outfit image
        const pngBuffer = await renderOutfit({
            looktype: player.looktype,
            lookhead: player.lookhead,
            lookbody: player.lookbody,
            looklegs: player.looklegs,
            lookfeet: player.lookfeet,
            // sex: player.sex // Sex might be needed by your specific renderOutfit function
        });

        // Send the image buffer
        res.setHeader('Content-Type', 'image/png');
        res.send(pngBuffer);

    } catch (error) {
        console.error(`[AvatarRoute] Error rendering avatar for ${characterName}:`, error);
        // Respond with an error image or just a 500 error
         // Example: return res.sendFile(path.join(__dirname, '..', 'public', 'assets', 'images', 'default_avatar_error.png'));
        res.status(500).send('Erro ao gerar a imagem do personagem.');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;