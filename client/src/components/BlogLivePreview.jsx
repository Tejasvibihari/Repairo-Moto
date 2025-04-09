

export default function BlogLivePreview() {
    return (
        <div className='shadow-sm border border-gray-300 rounded p-4'>
            <div className='p-4 border border-gray-300 rounded'>



                <div className="mb-4 flex justify-between">
                    <h1>
                        title
                    </h1>
                    <div>
                        <p>
                            Author Name
                        </p>

                        <p className="text-sm text-gray-500">
                            CreatedAt date
                        </p>
                    </div>

                </div>

                <div>
                    <div>
                        <p className="text-sm font-medium mb-2">Image</p>
                        <div className="mt-4 border border-gray-300 rounded-lg p-2 w-full h-64 flex items-center justify-center bg-gray-50">
                            <input
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                id="uploadeBanner"
                                className="object-contain h-full w-full rounded-md"
                                onChange={(e) => console.log(e.target.files[0])}
                            />
                        </div>

                    </div>
                    <div>
                        <p className="text-sm font-medium mb-2">Content</p>
                        <div className="border border-gray-300 rounded p-4">
                            <p>Content goes here...</p>
                        </div>
                    </div>

                </div>


            </div>
        </div>
    );
}
