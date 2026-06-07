"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/message', auth_1.optionalAuthMiddleware, chatController_1.chatRoute);
exports.default = router;
