import React, { useState, useRef } from 'react';
import api from '../api.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function PatientFileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error: showError } = useNotification();
  const fileInputRef = useRef(null);

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      showError('Please select a file.');
      return;
    }
    setProgress(0);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    try {
      await api.post('/patient-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      success('File uploaded successfully!');
      setFile(null);
      setDescription('');
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUpload) onUpload();
    } catch (err) {
      showError(err.response?.data?.message || 'Upload failed');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-blue-800 mb-3">Upload Medical Document</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select File</label>
          <div className="flex items-center">
            <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-600">{file ? file.name : 'Choose file'}</span>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <input 
            id="description"
            type="text" 
            placeholder="Brief description of the document" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        
        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
          </div>
        )}
        
        {/* Using global notification system instead of local messages */}
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
