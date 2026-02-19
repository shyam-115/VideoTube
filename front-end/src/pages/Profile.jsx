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
    return <div className="text-center mt-8 text-gray-900 dark:text-white">Please log in to view your profile.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <BackButton to="/home" />
      </div>
      {/* Profile Header */}
      <div className="rounded-2xl border border-gray-200 p-6 mb-8 bg-white/80 backdrop-blur dark:bg-gray-800/80 dark:border-gray-700 relative overflow-hidden">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl z-0"
            style={{ minHeight: '180px', maxHeight: '260px' }}
          />
        )}
        {/* Optional: Overlay for readability */}
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 z-10"></div>
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{user.fullname}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">@{user.username}</p>
              <p className="text-gray-500 dark:text-gray-500">{subscriberCount} subscribers • {myVideos.length} videos</p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'videos'
              ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          My Videos ({myVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Subscriptions ({subscribedChannels.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Videos</h2>
          {myVideos.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Subscribed Channels</h2>
          {subscribedChannels.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              You're not subscribed to any channels yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedChannels.map((channel) => (
                <div key={channel._id} className="rounded-lg p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <Link to={`/channel/${channel.username}`} className="block">
                    <div className="flex items-center space-x-4 mb-4 hover:opacity-90">
                      <img
                        src={channel.avatar}
                        alt={channel.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{channel.fullname}</h3>
                        <p className="text-gray-600 dark:text-gray-400">@{channel.username}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnsubscribe(channel._id)}
                    className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 transition-all duration-300 w-full"
                  >
                    <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                      Unsubscribe
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Cover Image
                </label>
                <div className="relative">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">No cover image</span>
                    </div>
                  )}
                  <label className="absolute bottom-4 right-4 cursor-pointer">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Avatar
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={avatarPreview || user.avatar}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
                    />
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="bg-blue-600 rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click the icon to upload a new avatar
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullname"
                    id="fullname"
                    value={editFormData.fullname}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </span>
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