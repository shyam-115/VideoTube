import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoApi } from '../api/api.js';
import VideoCard from '../components/VideoCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Play, Upload } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videoApi.getAllVideos();
        const data = response.data.data;
        const list = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];
        setVideos(list);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getSortedVideos = () => {
    if (!videos.length) return [];
    
    const sorted = [...videos];
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'views':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return sorted;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading videos..." />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const sortedVideos = getSortedVideos();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/20">
            <Play className="w-12 h-12 text-white ml-2" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">VideoTube</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover, watch, and share amazing videos from creators around the world. 
            Join our community and start your creative journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-lg font-medium text-white rounded-xl group bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/25 active:scale-95"
            >
              <span className="relative px-8 py-3.5 transition-all ease-in duration-75 bg-transparent rounded-[10px] group-hover:bg-opacity-0 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Start Uploading
              </span>
            </Link>
            <Link
              to="/search"
              className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-lg font-medium text-zinc-900 dark:text-white rounded-xl group bg-gradient-to-br from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 dark:from-zinc-800 dark:to-zinc-700 dark:hover:from-zinc-700 dark:hover:to-zinc-600 transition-all duration-300 shadow-sm active:scale-95"
            >
              <span className="relative px-8 py-3.5 transition-all ease-in duration-75 bg-white dark:bg-zinc-900 rounded-[10px] group-hover:bg-opacity-0">
                Explore Videos
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Featured Videos</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 appearance-none font-medium cursor-pointer shadow-sm pr-10"
                >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                  <option value="views">Most Views</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          {sortedVideos.length === 0 ? (
            <EmptyState
              icon={Play}
              title="No videos yet"
              description="Be the first to upload a video!"
              actionLabel="Upload Video"
              onAction={() => navigate('/upload')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20 py-10 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            © {currentYear} VideoTube. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;