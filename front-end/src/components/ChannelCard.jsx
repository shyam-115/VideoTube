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
    <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500 hover:-translate-y-1">
      <Link to={`/channel/${channel.username}`} className="block">
        <div className="flex items-center space-x-4 mb-4 group">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all duration-300"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {channel.fullname}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
              @{channel.username}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
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
          className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 transition-all duration-300 w-full disabled:opacity-50"
        >
          <span className="relative px-4 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline"></div>
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