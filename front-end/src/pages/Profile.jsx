// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { channelApi, subscriptionApi, authApi } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import VideoCard from '../components/VideoCard.jsx';
import BackButton from '../components/BackButton.jsx';
import { Edit2, X, Upload, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [myVideos, setMyVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullname: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch user's videos
        const videosRes = await channelApi.getChannelVideos(user._id);
        const data = videosRes.data.data;
        const list = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];
        setMyVideos(list);

        // Fetch subscriber count
        const subCountRes = await subscriptionApi.getSubscriberCount(user._id);
        setSubscriberCount(subCountRes.data.data.count);

        // Fetch subscribed channels
        const subscribedRes = await subscriptionApi.getSubscribedChannels();
        setSubscribedChannels(subscribedRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (user && isEditModalOpen) {
      setEditFormData({
        fullname: user.fullname || '',
        email: user.email || '',
      });
      setAvatarPreview(user.avatar || null);
      setCoverPreview(user.coverImage || null);
    }
  }, [user, isEditModalOpen]);

  const handleUnsubscribe = async (channelId) => {
    try {
      await subscriptionApi.unsubscribe(channelId);
      setSubscribedChannels(prev => prev.filter(channel => channel._id !== channelId));
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditFormData({ fullname: '', email: '' });
    setAvatarFile(null);
    setCoverImageFile(null);
    setAvatarPreview(null);
    setCoverPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update details (fullname and email)
      await authApi.updateDetails({
        fullname: editFormData.fullname,
        email: editFormData.email,
      });

      // Update avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        await authApi.updateAvatar(avatarFormData);
      }

      // Update cover image if changed
      if (coverImageFile) {
        const coverFormData = new FormData();
        coverFormData.append('coverImage', coverImageFile);
        await authApi.updateCoverImage(coverFormData);
      }

      // Refresh user data
      await updateUser();
      
      toast.success('Profile updated successfully!');
      handleCloseModal();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-8 text-zinc-900 dark:text-white font-medium">Please log in to view your profile.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      {/* Profile Header */}
      <div className="rounded-3xl border border-zinc-200/50 p-6 mb-10 bg-white/70 backdrop-blur-xl dark:bg-zinc-900/70 dark:border-zinc-800/50 shadow-xl relative overflow-hidden">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ minHeight: '180px', maxHeight: '280px' }}
          />
        )}
        {/* Optional: Overlay for readability */}
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md z-10 transition-colors"></div>
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-lg"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">{user.fullname}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-1">@{user.username}</p>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">{subscriberCount} subscribers • {myVideos.length} videos</p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-semibold text-zinc-900 dark:text-white rounded-xl group bg-gradient-to-br from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 dark:from-zinc-800 dark:to-zinc-700 dark:hover:from-zinc-700 dark:hover:to-zinc-600 transition-all duration-300 shadow-sm active:scale-95"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-zinc-900 rounded-[10px] group-hover:bg-opacity-0 flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 relative">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3 rounded-t-xl font-medium transition-all duration-300 relative ${
            activeTab === 'videos'
              ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          My Videos ({myVideos.length})
          {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-500"></div>}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-6 py-3 rounded-t-xl font-medium transition-all duration-300 relative ${
            activeTab === 'subscriptions'
              ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          Subscriptions ({subscribedChannels.length})
          {activeTab === 'subscriptions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-500"></div>}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">My Videos</h2>
          {myVideos.length === 0 ? (
            <div className="text-center text-zinc-500 dark:text-zinc-400 font-medium mt-10">
              You haven't uploaded any videos yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Subscribed Channels</h2>
          {subscribedChannels.length === 0 ? (
            <div className="text-center text-zinc-500 dark:text-zinc-400 font-medium mt-10">
              You're not subscribed to any channels yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedChannels.map((channel) => (
                <div key={channel._id} className="rounded-2xl p-5 bg-white border border-zinc-200/80 dark:bg-zinc-900/80 dark:border-zinc-800/80 shadow-sm transition-shadow hover:shadow-md">
                  <Link to={`/channel/${channel.username}`} className="block group">
                    <div className="flex items-center space-x-4 mb-5">
                      <img
                        src={channel.avatar}
                        alt={channel.username}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{channel.fullname}</h3>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">@{channel.username}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnsubscribe(channel._id)}
                    className="w-full relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Unsubscribe
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  Cover Image
                </label>
                <div className="relative group">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800"
                    />
                  ) : (
                    <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">No cover image</span>
                    </div>
                  )}
                  <label className="absolute bottom-4 right-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-xl p-3 shadow-lg hover:bg-violet-50 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700">
                      <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  Avatar
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <img
                      src={avatarPreview || user.avatar}
                      alt="Avatar preview"
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-zinc-100 dark:ring-zinc-800 shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-violet-600 rounded-full p-2.5 shadow-lg hover:bg-violet-700 transition-colors">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Hover and click the icon to upload a new avatar
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullname" className="block mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullname"
                    id="fullname"
                    value={editFormData.fullname}
                    onChange={handleInputChange}
                    className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3.5 transition-all outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3.5 transition-all outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-6 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;