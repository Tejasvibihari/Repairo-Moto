import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';

export default function BlogEditor() {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [banner, setBanner] = useState(null);
    let editorContent = content;

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        setBanner(file);
        console.log('Banner uploaded:', file);
    };

    

    const handleEditorChange = (newContent) => {
        editorContent = newContent;
     
        console.log(editorContent)
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const blogData = {
            title,
            description,
            content,
            banner,
        };
        console.log('Blog Data:', blogData);
        
    };

    return (
        <section>
            <form
                className="my-6 p-4 border shadow border-gray-300"
                onSubmit={handleSubmit}
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="title">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="description"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="uploadeBanner">
                        Upload Banner
                    </label>
                    <input
                        id="uploadeBanner"
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleBannerUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Content
                    </label>
                    <JoditEditor
                        ref={editor}
                        value={content}
                        onChange={handleEditorChange}
                        config={{
                            height: 350,
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Submit Blog
                </button>
            </form>
        </section>
    );
}