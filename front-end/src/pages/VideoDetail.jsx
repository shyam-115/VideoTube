import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { videoApi, subscriptionApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";
import { ThumbsUp, ThumbsDown, Share2, Play, Copy, Check, X, Mail, Code } from "lucide-react";

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
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

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


  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/video/${id}` : "";

  const embedCode = `<iframe width="560" height="315" src="${shareUrl}" title="${video?.title ?? "Video"}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const openShareModal = () => {
    setShareOpen(true);
    setShowEmbedCode(false);
    setLinkCopied(false);
    setEmbedCopied(false);
  };

  const shareText = encodeURIComponent((video?.title ?? "Check out this video") + " " + shareUrl);
  const shareUrls = {
    email: `mailto:?subject=${encodeURIComponent(video?.title ?? "Video")}&body=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video?.title ?? "Video")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: video?.title ?? "Video",
        url: shareUrl,
        text: video?.description?.slice(0, 100) ?? "",
      });
      setShareOpen(false);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* YouTube-like container */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-4 pb-2">
          <BackButton to="/home" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 pt-2">
          {/* Main video content */}
          <div className="lg:col-span-8">
            {/* YouTube-like Video Player Section */}
            <div className="relative mb-4">
              <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                {/* Video Container with 16:9 aspect ratio */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                  <video
                    controls
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
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
              {video.title}
            </h1>

            {/* Video Stats and Actions */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              {/* View count and date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{video.views ? formatCount(video.views) : '0'} views</span>
                <span>•</span>
                <span>{video.createdAt ? formatDate(video.createdAt) : 'Recently'}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {/* Like/Dislike */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
                  <button
                    onClick={() => handleLike("like")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-l-full transition-all hover:bg-gray-200 dark:hover:bg-gray-700 ${userReaction === "like" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-medium">{formatCount(likes)}</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    onClick={() => handleLike("dislike")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-r-full transition-all hover:bg-gray-200 dark:hover:bg-gray-700 ${userReaction === "dislike" ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-400"
                      }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="font-medium">{formatCount(dislikes)}</span>
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={openShareModal}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">Share</span>
                </button>

                {/* More options */}
                
              </div>
            </div>

            {/* Channel info and subscribe */}
            <div className="flex items-center justify-between rounded-xl p-4 mb-4 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={video.owner.avatar}
                  alt={video.owner.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{video.owner.fullname}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatCount(subscriberCount)} subscribers</p>
                </div>
              </div>

              {user && (
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${isSubscribed
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl p-4 mb-6 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                <p className="font-semibold mb-2">Description:</p>
                {video.description.length > 200 ? (
                  <div>
                    <p>{video.description.substring(0, 200)}...</p>
                    <button className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mt-2 font-medium">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Up next</h3>

              {upNextVideos.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No other videos yet.</p>
              ) : (
                upNextVideos.map((v) => (
                  <Link
                    key={v._id}
                    to={`/video/${v._id}`}
                    className="flex space-x-3 p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex-shrink-0 relative w-40 h-24 rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white drop-shadow" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {v.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {v.owner?.fullname ?? "Channel"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
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

      {/* YouTube-style Share modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShareOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 id="share-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Share
              </h2>
              <button
                onClick={() => setShareOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Copy link - YouTube style */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-lg font-medium text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 flex items-center gap-2 shrink-0"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4" /> Link copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share via - Embed, Email, Social */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Share via</p>
                <div className="grid grid-cols-4 gap-3">
                  {/* Embed */}
                  <button
                    type="button"
                    onClick={() => setShowEmbedCode((s) => !s)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Code className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Embed</span>
                  </button>
                  {/* Email */}
                  <a
                    href={shareUrls.email}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Email</span>
                  </a>
                  {/* Twitter/X */}
                  <a
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">X</span>
                  </a>
                  {/* Facebook */}
                  <a
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
                  </a>
                  {/* LinkedIn */}
                  <a
                    href={shareUrls.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">LinkedIn</span>
                  </a>
                  {/* Native share (mobile) */}
                  {typeof navigator !== "undefined" && navigator.share && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="col-span-2 flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">More options...</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Embed code (expandable) */}
              {showEmbedCode && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Embed code</p>
                  <div className="flex gap-2">
                    <textarea
                      readOnly
                      value={embedCode}
                      rows={4}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-mono resize-none"
                    />
                    <button
                      onClick={handleCopyEmbed}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 flex items-center gap-2 shrink-0 self-start"
                    >
                      {embedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {embedCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;