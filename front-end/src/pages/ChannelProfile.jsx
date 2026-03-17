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
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-500 font-medium mt-8">{error}</div>;
  if (!channel) return <div className="text-center mt-8 text-zinc-900 dark:text-white font-medium">Channel not found.</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      {/* Channel Header */}
      <div className="rounded-3xl border border-zinc-200/50 p-6 mb-10 bg-white/70 backdrop-blur-xl dark:bg-zinc-900/70 dark:border-zinc-800/50 shadow-xl relative overflow-hidden">
        {channel.coverImage && (
          <div className="mb-8">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-56 object-cover rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-950 shadow-lg"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">{channel.fullname}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-1">@{channel.username}</p>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">{subscriberCount} subscribers • {videos.length} videos</p>
            </div>
          </div>

          {user && user._id !== channel._id && (
            <button
              onClick={handleSubscribe}
              className={`relative inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-white rounded-xl transition-all shadow-sm active:scale-95 ${
                isSubscribed
                  ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Videos</h2>
        {videos.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 font-medium">No videos uploaded yet.</div>
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