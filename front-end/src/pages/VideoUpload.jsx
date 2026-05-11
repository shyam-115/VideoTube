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
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/home" />
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-32 bg-violet-500/10 dark:bg-violet-500/5 blur-3xl -z-10 rounded-full"></div>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Upload Video</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg font-medium">Share your content with the world</p>
          </div>

          {error && (
            <div className="mb-8 p-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl dark:bg-red-900/20 dark:text-red-400 border border-red-200/50 dark:border-red-800/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/40 shrink-0">⚠️</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2.5">
                Video Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 outline-none shadow-sm"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 outline-none shadow-sm resize-y"
                placeholder="Describe your video"
                required
              />
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2.5">
                Video File
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="video"
                  name="video"
                  onChange={handleChange}
                  accept="video/*"
                  className="w-full px-1 py-1 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-500/10 file:text-violet-600 dark:file:text-violet-400 hover:file:bg-violet-100 dark:hover:file:bg-violet-500/20 file:cursor-pointer file:transition-colors transition-colors hover:border-violet-400/50 cursor-pointer"
                  required
                />
                {formData.video && (
                  <button
                    type="button"
                    onClick={() => removeFile('video')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.video && (
                <div className="mt-3 flex items-center space-x-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-4 py-2 rounded-lg inline-flex max-w-full">
                  <Video className="w-4 h-4 shrink-0" />
                  <span className="truncate">{formData.video.name}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2.5">
                Thumbnail Image
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-1 py-1 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 file:cursor-pointer file:transition-colors transition-colors hover:border-indigo-400/50 cursor-pointer"
                  required
                />
                {formData.thumbnail && (
                  <button
                    type="button"
                    onClick={() => removeFile('thumbnail')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.thumbnail && (
                <div className="mt-3 flex items-center space-x-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg inline-flex max-w-full">
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{formData.thumbnail.name}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-6 mt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="flex-1 px-6 py-3.5 text-base font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={uploading}
                className="flex-[2] relative inline-flex items-center justify-center px-6 py-3.5 overflow-hidden text-base font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <div className="flex items-center justify-center">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2.5" />
                      Upload Video
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;