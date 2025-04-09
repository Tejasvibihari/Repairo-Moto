import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import CircularLoading from './ui/CircularLoading.jsx';
import { Plus } from 'lucide-react';

export default function BlogEditor() {


    // state management
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [loading] = useState(false);
    const [title, setTitle] = useState('');
    const [banner, setBanner] = useState(null);
    // variables 
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
            content: editorContent,
            banner,
        };
        console.log('Blog Data:', blogData);

    };

    return (
        <div className='shadow-sm border border-gray-300 rounded p-4'>
            <form
                className='p-4 border border-gray-300 rounded'
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
                    <label className="block text-sm font-medium mb-2" htmlFor="uploadeBanner">
                        Upload Banner
                    </label>
                    <input
                        id="uploadeBanner"
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleBannerUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-300 rounded cursor-pointer"
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


                <button type="submit" className="bg-primary mt-4  font-semibold hover:bg-transparent hover:text-primary  border-primary border text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark">
                    {loading ? <div className='flex items-center justify-center'> <CircularLoading size={20} /></div> : <div className='flex flex-row space-x-2'><span><Plus /></span><span>Submit Blog</span></div>}
                </button>
            </form>
        </div>
    );
}