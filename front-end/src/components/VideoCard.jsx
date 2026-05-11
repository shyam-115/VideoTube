// src/components/VideoCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const views = video.views || 0;

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const handleCardClick = () => {
    navigate(`/video/${video._id}`);
  };

  const handleChannelClick = (e) => {
    // Prevent the card's onClick from firing (since this is a real <a> now)
    e.stopPropagation();
  };

  return (
    // Outer element is a div — no nested <a> tags
    <div
      role="article"
      onClick={handleCardClick}
      className="group rounded-2xl overflow-hidden border border-zinc-200/80 md:hover:border-violet-300/50 dark:border-zinc-800/80 dark:md:hover:border-violet-500/50 transition-all duration-300 bg-white dark:bg-zinc-900/50 backdrop-blur-sm md:hover:shadow-xl md:hover:shadow-zinc-200 dark:md:hover:shadow-violet-900/10 md:hover:-translate-y-1.5 flex flex-col h-full active:scale-[0.98] cursor-pointer"
    >
      {/* Thumbnail with overlay */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/20 transition-colors duration-300" />

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-900/90 text-gray-100 backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5 mr-1" /> {formatCount(views)}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[1.05rem] font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 md:group-hover:text-violet-600 dark:md:group-hover:text-violet-400 transition-colors duration-200 leading-snug">
          {video.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          {video.owner?.username ? (
            // This <Link> renders a single <a> — safe because its parent is a <div>
            <Link
              to={`/channel/${video.owner.username}`}
              onClick={handleChannelClick}
              className="truncate pr-2 font-medium text-zinc-600 dark:text-zinc-300 md:hover:text-violet-600 dark:md:hover:text-violet-400 transition-colors active:opacity-70 p-1 -m-1"
              title={video.owner.fullname || video.owner.username}
            >
              {video.owner.fullname || video.owner.username}
            </Link>
          ) : (
            <span className="truncate pr-2 font-medium text-zinc-600 dark:text-zinc-300">
              Unknown Channel
            </span>
          )}
          <span className="inline-flex items-center text-zinc-400 dark:text-zinc-500 text-xs flex-shrink-0">
            <Clock className="w-3.5 h-3.5 mr-1" /> {timeAgo(video.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;