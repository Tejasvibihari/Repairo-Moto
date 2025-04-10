import express from 'express';
import { blogUpload } from '../Middleware/blogMulter';

const router = express.Router();

router.post('/addblog', blogUpload.single('banner'), createBlog)