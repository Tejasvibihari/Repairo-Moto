import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,

    },
    content: {
        type: String,
        required: true,

    },
    banner: {
        type: String,
    },
    author: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

},
    {
        timestamps: true,
    });
const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
