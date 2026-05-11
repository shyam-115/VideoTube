import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { videoApi, subscriptionApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";
import { ThumbsUp, ThumbsDown, Play } from "lucide-react";

const VideoDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // "like", "dislike", or null
  const [upNextVideos, setUpNextVideos] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoRes = await videoApi.getVideoById(id);
        setVideo(videoRes.data.data);

        const likesRes = await videoApi.getLikesCount(id);
        setLikes(likesRes.data.data.likes);
        setDislikes(likesRes.data.data.dislikes);

        if (user && videoRes.data.data.owner._id) {
          const subCountRes = await subscriptionApi.getSubscriberCount(
            videoRes.data.data.owner._id
          );
          setSubscriberCount(subCountRes.data.data.count);

          const isSubRes = await subscriptionApi.isSubscribed(
            videoRes.data.data.owner._id
          );
          setIsSubscribed(isSubRes.data.data.isSubscribed);

          const reactionRes = await videoApi.getUserReaction(id);
          setUserReaction(reactionRes.data.data.reaction);
        }
      } catch (err) {
        setError("Failed to fetch video details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // Fetch "Up next" videos (all published, exclude current)
  useEffect(() => {
    const fetchUpNext = async () => {
      try {
        const res = await videoApi.getAllVideos({ limit: 15 });
        const docs = res.data?.data?.docs ?? [];
        const list = Array.isArray(docs) ? docs.filter((v) => v._id !== id) : [];
        setUpNextVideos(list);
      } catch (err) {
        console.error("Failed to fetch up next videos:", err);
      }
    };
    fetchUpNext();
  }, [id]);

  const handleLike = async (type) => {
    if (!user) {
      toast.error("You need to be logged in to like/dislike.");
      return;
    }

    try {
      await videoApi.toggleLike(id, type);

      // Optimistic updates
      if (userReaction === type) {
        if (type === "like") setLikes(likes - 1);
        else setDislikes(dislikes - 1);
        setUserReaction(null);
      } else {
        if (type === "like") {
          setLikes(likes + 1);
          if (userReaction === "dislike") setDislikes(dislikes - 1);
        } else {
          setDislikes(dislikes + 1);
          if (userReaction === "like") setLikes(likes - 1);
        }
        setUserReaction(type);
      }
    } catch (err) {
      console.error(err);
    }
  };



  const handleSubscribe = async () => {
    if (!user) {
      toast.error("You need to be logged in to subscribe.");
      return;
    }
    try {
      if (isSubscribed) {
        await subscriptionApi.unsubscribe(video.owner._id);
      } else {
        await subscriptionApi.subscribe(video.owner._id);
      }
      setIsSubscribed(!isSubscribed);
      const subCountRes = await subscriptionApi.getSubscriberCount(
        video.owner._id
      );
      setSubscriberCount(subCountRes.data.data.count);
    } catch (err) {
      console.error(err);
    }
  };


  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl aspect-video mb-6"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 w-2/3"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 w-1/3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Video not found state
  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-500 dark:text-gray-400 text-6xl mb-4">🎥</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Video not found</h2>
          <p className="text-gray-600 dark:text-gray-400">The video you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* YouTube-like container */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-4 pb-2 hidden md:block">
          <BackButton to="/home" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 pt-0 md:pt-2">
          {/* Main video content */}
          <div className="lg:col-span-8">
            {/* YouTube-like Video Player Section - Sticky on Mobile */}
            <div className="sticky top-[60px] md:top-0 z-40 -mx-4 md:mx-0 mb-4 md:mb-6 bg-zinc-50 dark:bg-zinc-950 pb-2">
              <div className="bg-black md:rounded-2xl overflow-hidden shadow-xl ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
                {/* Video Container with 16:9 aspect ratio */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                  <video
                    controls
                    playsInline
                    src={video.video}
                    poster={video.thumbnail}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{
                      background: '#000',
                    }}
                    preload="metadata"
                    controlsList="nodownload"
                  />

                  {/* Custom overlay for better YouTube-like experience */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/10 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Video Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight tracking-tight">
              {video.title}
            </h1>

            {/* Video Stats and Actions */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              {/* View count and date */}
              <div className="flex items-center space-x-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <span>{video.views ? formatCount(video.views) : '0'} views</span>
                <span>•</span>
                <span>{video.createdAt ? formatDate(video.createdAt) : 'Recently'}</span>
              </div>

              {/* Like / Dislike */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-full shadow-sm shrink-0">
                <button
                  onClick={() => handleLike("like")}
                  className={`flex items-center space-x-2 px-4 py-2.5 md:py-2 rounded-l-full transition-all active:scale-95 md:hover:bg-zinc-200 dark:md:hover:bg-zinc-700 ${userReaction === "like" ? "text-violet-600 dark:text-violet-400" : "text-zinc-700 dark:text-zinc-200 md:hover:text-violet-600 dark:md:hover:text-violet-400"}`}
                >
                  <ThumbsUp className="w-5 h-5 mb-0.5" />
                  <span className="font-semibold text-sm md:text-base">{formatCount(likes)}</span>
                </button>
                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600" />
                <button
                  onClick={() => handleLike("dislike")}
                  className={`flex items-center space-x-2 px-4 py-2.5 md:py-2 rounded-r-full transition-all active:scale-95 md:hover:bg-zinc-200 dark:md:hover:bg-zinc-700 ${userReaction === "dislike" ? "text-red-500 dark:text-red-400" : "text-zinc-700 dark:text-zinc-200 md:hover:text-red-500 dark:md:hover:text-red-400"}`}
                >
                  <ThumbsDown className="w-5 h-5 mt-0.5" />
                  <span className="font-semibold text-sm md:text-base">{formatCount(dislikes)}</span>
                </button>
              </div>
            </div>

            {/* Channel info and subscribe */}
            <div className="flex items-center justify-between rounded-2xl p-4 mb-4 bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800/80 shadow-sm">
              <div className="flex items-center space-x-4">
                <img
                  src={video.owner.avatar}
                  alt={video.owner.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{video.owner.fullname}</p>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{formatCount(subscriberCount)} subscribers</p>
                </div>
              </div>

              {user && (
                <button
                  onClick={handleSubscribe}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 ${isSubscribed
                      ? "bg-zinc-200 text-zinc-800 md:hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:md:hover:bg-zinc-600"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 md:hover:from-violet-500 md:hover:to-indigo-500 text-white shadow-violet-500/25"
                    }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            {/* Description */}
            <div className="rounded-2xl p-5 mb-8 bg-zinc-100/50 dark:bg-zinc-800/30 font-medium text-sm leading-relaxed whitespace-pre-line border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="text-zinc-800 dark:text-zinc-200">
                {video.description.length > 250 ? (
                  <div>
                    <p>{video.description.substring(0, 250)}...</p>
                    <button className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 mt-2 font-bold transition-colors">
                      Show more
                    </button>
                  </div>
                ) : (
                  <p>{video.description}</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar - Up next */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Up next</h3>

              {upNextVideos.length === 0 ? (
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No other videos yet.</p>
              ) : (
                upNextVideos.map((v) => (
                  <Link
                    key={v._id}
                    to={`/video/${v._id}`}
                    className="flex space-x-3 p-2 rounded-xl transition-all hover:bg-white dark:hover:bg-zinc-800/50 group border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50 hover:shadow-sm"
                  >
                    <div className="flex-shrink-0 relative w-40 aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4 className="text-[0.95rem] font-semibold text-zinc-900 dark:text-white line-clamp-2 mb-1.5 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {v.title}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
                        {v.owner?.fullname ?? "Channel"}
                      </p>
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        {formatCount(v.views ?? 0)} views • {formatDate(v.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default VideoDetail;