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
        <div className="rounded-2xl border border-gray-200 p-8 bg-white/80 backdrop-blur dark:bg-gray-800/80 dark:border-gray-700">
          <div className="flex items-center justify-center mb-3 text-gray-600 dark:text-gray-300">
            <SearchIcon className="w-6 h-6 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Search for videos and channels</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Use the search bar above to start exploring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          Search results for "{query}"
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'videos'
                ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'channels'
                ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Channels
          </button>
        </div>
      </div>

      {loading && (
        <div className="min-h-[20vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center mt-8 text-red-600 dark:text-red-500">{error}</div>
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