// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoApi, channelApi } from '../api/api.js';
import VideoCard from '../components/VideoCard.jsx';
import ChannelCard from '../components/ChannelCard.jsx';
import BackButton from '../components/BackButton.jsx';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query, activeTab]);

  const searchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'videos') {
        const response = await videoApi.searchVideos(query);
        const data = response.data.data;
        const docs = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];
        setVideos(docs);
      } else {
        const response = await channelApi.searchChannels(query);
        setChannels(response.data.data || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-6 text-center">
        <div className="rounded-3xl border border-zinc-200/50 p-10 bg-white/70 backdrop-blur-xl dark:bg-zinc-900/70 dark:border-zinc-800/50 shadow-xl">
          <div className="flex items-center justify-center mb-4 text-zinc-600 dark:text-zinc-300">
            <SearchIcon className="w-8 h-8 mr-3 text-violet-500" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Search for videos and channels</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">Use the search bar above to start exploring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          Search results for "{query}"
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 relative">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-5 py-2.5 rounded-t-xl font-medium transition-all duration-300 relative ${
              activeTab === 'videos'
                ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
            }`}
          >
            Videos
            {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-500"></div>}
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-5 py-2.5 rounded-t-xl font-medium transition-all duration-300 relative ${
              activeTab === 'channels'
                ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
            }`}
          >
            Channels
            {activeTab === 'channels' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-500"></div>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="min-h-[20vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center mt-8 text-red-500 font-medium">{error}</div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'videos' && (
            <div>
              {videos.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                  No videos found for "{query}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div>
              {channels.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                  No channels found for "{query}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {channels.map((channel) => (
                    <ChannelCard key={channel._id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;