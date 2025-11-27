import React from 'react';
import FileUploader from '@/components/FileUploader';

const UploadPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-6 py-8">
            <h1 className="text-2xl font-semibold mb-3">Upload Input Data</h1>
            <p className="text-sm text-black/70 mb-6">Please upload your input_data.xlsx file to get started.</p>
            <div className="bg-white border border-black/10 p-6 rounded-sm shadow-sm">
              <FileUploader />
            </div>
        </div>
    );
};

export default UploadPage;