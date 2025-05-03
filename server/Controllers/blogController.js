import Blog from "../Models/blogModel.js";


export const createBlog = async (req, res) => {
    try {
        const { title, content, author, status } = req.body;
        const banner = req.file ? `/uploads/blogs/${req.file.filename}` : null;
        console.log(title)

        if (!title || !content || !author) {
            return res.status(400).json({ message: "Title, Content, and Author are required." });
        }

        const newBlog = new Blog({
            title,
            content,
            banner,
            author,
            status: status || "draft"
        });

        const savedBlog = await newBlog.save();

        res.status(201).json({
            message: "Blog created successfully",
            blog: savedBlog
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create blog", error: err.message });
    }
};
