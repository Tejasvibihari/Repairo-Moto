import express from 'express';
import { blogUpload } from '../Middleware/blogMulter.js';
import { createBlog } from '../Controllers/blogController.js';

const router = express.Router();

router.post("/create", blogUpload.single("banner"), createBlog);

export default router;