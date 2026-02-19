import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { channelApi, subscriptionApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import VideoCard from '../components/VideoCard.jsx';
import BackButton from '../components/BackButton.jsx';

const ChannelProfile = () => {
  const { username } = useParams(); // Use username from URL params
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Fetch channel profile by username
        const channelRes = await channelApi.getChannelProfileByUsername(username);
        const fetchedChannel = channelRes.data.data;
        setChannel(fetchedChannel);

        if (fetchedChannel) {
          const channelId = fetchedChannel._id; // Get the ID from the fetched data

          // Step 2: Use the channelId for subsequent requests
          const videosRes = await channelApi.getChannelVideos(channelId);
          setVideos(videosRes.data.data.docs || []);

          const subCountRes = await subscriptionApi.getSubscriberCount(channelId);
          setSubscriberCount(subCountRes.data.data.count);

          if (user && user._id !== channelId) {
            const isSubRes = await subscriptionApi.isSubscribed(channelId);
            setIsSubscribed(isSubRes.data.data.isSubscribed);
          }
        } else {
          setError('Channel not found.');
        }
      } catch (err) {
        console.error('Failed to fetch channel data:', err);
        setError('Failed to load channel. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChannelData();
    }
  }, [username, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('You need to be logged in to subscribe.');
      return;
    }
    if (user._id === channel?._id) {
      toast.error("You can't subscribe to your own channel.");
      return;
    }
    
    try {
      const channelId = channel._id;
      if (isSubscribed) {
        await subscriptionApi.unsubscribe(channelId);
      } else {
        await subscriptionApi.subscribe(channelId);
      }
      setIsSubscribed(!isSubscribed);
      
      // Re-fetch count for accuracy
      const subCountRes = await subscriptionApi.getSubscriberCount(channelId);
      setSubscriberCount(subCountRes.data.data.count);
    } catch (err) {
      console.error('Subscription toggle failed:', err);
    }
  };

  if (loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-600 dark:text-red-500 mt-8">{error}</div>;
  if (!channel) return <div className="text-center mt-8 text-gray-900 dark:text-white">Channel not found.</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      {/* Channel Header */}
      <div className="rounded-2xl border border-gray-200 p-6 mb-8 bg-white/80 backdrop-blur dark:bg-gray-800/80 dark:border-gray-700">
        {channel.coverImage && (
          <div className="mb-6">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{channel.fullname}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">@{channel.username}</p>
              <p className="text-gray-500 dark:text-gray-500">{subscriberCount} subscribers • {videos.length} videos</p>
            </div>
          </div>

          {user && user._id !== channel._id && (
            <button
              onClick={handleSubscribe}
              className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-lg font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 transition-all duration-300"
            >
              <span className="relative px-6 py-3 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0">
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Videos</h2>
        {videos.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">No videos uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelProfile;