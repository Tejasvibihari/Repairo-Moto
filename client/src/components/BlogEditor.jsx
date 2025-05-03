import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import CircularLoading from './ui/CircularLoading.jsx';
import { Plus } from 'lucide-react';
import axiosClient from '../service/axiosClient.js';
import AlertSnackBar from './ui/AlertSnackBar.jsx';

export default function BlogEditor({ title, setTitle, content, setContent, banner, setBanner }) {
    const editor = useRef(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const handleEditorChange = (newContent) => {
        setContent(newContent); // update actual state!
        // setContent(newContent);
        console.log(editorContent)
    };

    let editorContent = content;

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        setBanner(file);
        console.log('Banner uploaded:', file);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("author", "Admin"); // or pass dynamically
        formData.append("status", "published"); // or "draft"

        if (banner) {
            formData.append("banner", banner);
        }

        try {
            console.log(formData)
            const res = await axiosClient.post("/api/admin/blog/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            // const data = await res.json();
            console.log("Blog created:", res);
            setSnackBarMessage(res.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
            setLoading(false)
            // ✅ Reset form fields
            setTitle("");
            setContent("");
            setBanner(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset file input
            }
        } catch (error) {
            console.error("Error submitting blog:", error);
            setLoading(false)
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity("error"); // Set the message to display in the Snackbar
            setSnackBarOpen(true);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }
    return (

        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />

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
                            ref={fileInputRef}  // ✅ This allows clearing the input programmatically
                            id="uploadeBanner"
                            type="file"
                            accept=".png, .jpg, .jpeg"
                            onChange={handleBannerUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-300 rounded cursor-pointer"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="content">
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
        </>
    );
}