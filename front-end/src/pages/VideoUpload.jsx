// src/pages/VideoUpload.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoApi } from '../api/api.js';
import BackButton from '../components/BackButton.jsx';
import { Upload, Video, Image as ImageIcon, FileText, X } from 'lucide-react';

const VideoUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.video) data.append('video', formData.video);
      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

      await videoApi.uploadVideo(data);
      navigate('/home');
    } catch (err) {
      console.error('Upload failed:', err.response?.data);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: null,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-4">
          <BackButton to="/home" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Video</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Share your content with the world</p>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                placeholder="Describe your video"
                required
              />
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video File
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="video"
                  name="video"
                  onChange={handleChange}
                  accept="video/*"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                  required
                />
                {formData.video && (
                  <button
                    type="button"
                    onClick={() => removeFile('video')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.video && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Video className="w-4 h-4" />
                  <span>{formData.video.name}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                  required
                />
                {formData.thumbnail && (
                  <button
                    type="button"
                    onClick={() => removeFile('thumbnail')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.thumbnail && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <ImageIcon className="w-4 h-4" />
                  <span>{formData.thumbnail.name}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="flex-1 relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg group bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                  Cancel
                </span>
              </button>
              
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 disabled:opacity-50"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center flex items-center justify-center">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;