import express from 'express';
import { blogUpload } from '../Middleware/blogMulter.js';
import { createBlog, getAllBlogs, getBlogById } from '../Controllers/blogController.js';

const router = express.Router();

router.post("/create", blogUpload.single("banner"), createBlog);
router.get("/getallblog", getAllBlogs);
router.get("/blogbyid/:id", getBlogById);
export default router;