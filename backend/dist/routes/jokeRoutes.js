"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jokeController_1 = require("../controllers/jokeController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/generate', auth_1.optionalAuthMiddleware, jokeController_1.generateJokeRoute);
router.get('/trending', jokeController_1.getTrendingJokes);
router.get('/random', jokeController_1.getRandomJoke);
router.get('/daily', jokeController_1.getDailyJoke);
router.get('/meme', jokeController_1.generateMemeCaption);
// Actions requiring authentication
router.post('/like/:id', auth_1.authMiddleware, jokeController_1.toggleLike);
router.post('/dislike/:id', auth_1.authMiddleware, jokeController_1.toggleDislike);
router.post('/favorite/:id', auth_1.authMiddleware, jokeController_1.toggleFavorite);
// Comments
router.get('/comments/:jokeId', jokeController_1.getComments);
router.post('/comments/:jokeId', auth_1.authMiddleware, jokeController_1.addComment);
exports.default = router;
