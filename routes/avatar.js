// routes/avatar.js

const express = require('express');
const router = express.Router();
const { promiseDb } = require('../db'); // Ensure you have promiseDb exported from db.js
const { renderOutfit } = require('../utils/outfitRenderer');

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
            // Player not found or deleted
            console.warn(`[AvatarRoute] Character not found: ${characterName}`);
            // Optionally serve a default "not found" image
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
            // sex: player.sex // Sex is not directly used by the current renderer logic
        });

        // Send the image buffer
        res.setHeader('Content-Type', 'image/png');
        res.send(pngBuffer);

    } catch (error) {
        console.error(`[AvatarRoute] Error rendering avatar for ${characterName}:`, error);
        // Respond with an error image or just a 500 error
        res.status(500).send('Erro ao gerar a imagem do personagem.');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;