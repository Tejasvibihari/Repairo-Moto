import express from 'express';
import { blogUpload } from '../Middleware/blogMulter.js';
import { createBlog, getAllBlogs } from '../Controllers/blogController.js';

const router = express.Router();

router.post("/create", blogUpload.single("banner"), createBlog);
router.get("/getallblog", getAllBlogs);
export default router;