import { Router } from "express";

import {
  getMessages,
  getGallery,
  getVideoTributes,
} from "../controllers/public-content.controller.js";

const router = Router();

// Publicly accessible approved content.
router.get("/messages", getMessages);
router.get("/gallery", getGallery);
router.get("/video-tributes", getVideoTributes);

export default router;
