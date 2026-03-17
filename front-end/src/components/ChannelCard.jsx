import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const ChannelCard = ({ channel }) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const subCountRes = await subscriptionApi.getSubscriberCount(channel._id);
        setSubscriberCount(subCountRes.data.data.count);

        if (user) {
          const isSubRes = await subscriptionApi.isSubscribed(channel._id);
          setIsSubscribed(isSubRes.data.data.isSubscribed);
        }
      } catch (err) {
        console.error('Failed to fetch subscription data:', err);
      }
    };

    fetchSubscriptionData();
  }, [channel._id, user]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('You need to be logged in to subscribe.');
      return;
    }

    if (user._id === channel._id) {
      toast.error("You can't subscribe to your own channel.");
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        await subscriptionApi.unsubscribe(channel._id);
      } else {
        await subscriptionApi.subscribe(channel._id);
      }
      setIsSubscribed(!isSubscribed);
      
      const subCountRes = await subscriptionApi.getSubscriberCount(channel._id);
      setSubscriberCount(subCountRes.data.data.count);
    } catch (err) {
      console.error('Subscription toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-zinc-200/80 hover:border-violet-300/50 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:hover:border-violet-500/50 hover:-translate-y-1.5 backdrop-blur-sm">
      <Link to={`/channel/${channel.username}`} className="block">
        <div className="flex items-center space-x-4 mb-4 group">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-violet-400 dark:group-hover:ring-violet-500 group-hover:scale-105 shadow-sm transition-all duration-300"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
              {channel.fullname}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-200 mt-0.5">
              @{channel.username}
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium mt-1">
              {subscriberCount} subscribers
            </p>
          </div>
        </div>
      </Link>
      
      {channel.coverImage && (
        <div className="mb-4">
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {user && user._id !== channel._id && (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 w-full disabled:opacity-50 shadow-sm hover:shadow-violet-500/25 active:scale-[0.98]"
        >
          <span className="relative px-4 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-[10px] group-hover:bg-opacity-0 w-full text-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block align-middle"></div>
                {isSubscribed ? 'Unsubscribing...' : 'Subscribing...'}
              </>
            ) : (
              isSubscribed ? 'Unsubscribe' : 'Subscribe'
            )}
          </span>
        </button>
      )}
    </div>
  );
};

export default ChannelCard;