

export default function BlogLivePreview() {
    return (
        <div className='shadow-sm border border-gray-300 rounded p-4'>
            <div className='p-4 border border-gray-300 rounded'>



                <div className="mb-4 flex justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Title PLaceholder
                        </h1>
                        <div>
                            <p className="text-xs text-gray-500">
                                <span className="font-semibold ">Date:-</span>
                                <span>{Date.now()}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <img src="./logo/logo72.png" className="w-10 rounded-full" />
                        <div>
                            <p className="text-sm font-medium">Author Name</p>
                            <p className="text-xs text-gray-500">Role</p>
                        </div>
                    </div>

                </div>

                <div>
                    <div>
                        <p className="text-sm font-medium mb-2">Image</p>
                        <div className="mt-4 border border-gray-300 rounded-lg p-2 w-full h-64 flex items-center justify-center bg-gray-50">
                            <img src="./logo/logo72.png" className="w-xs opacity-25" />
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
