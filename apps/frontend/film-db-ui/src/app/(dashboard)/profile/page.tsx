'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfile, useUpdateUsername, useUpdateProfile, useRequestAdmin } from '@/hooks/useProfile';
import { useLists } from '@/hooks/useLists';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

// --- Types ---
type ProfileFormData = {
  displayName: string;
  bio: string;
};

type UsernameFormData = {
  password: '';
  newUsername: '';
};

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile(user?.username);
  const { data: lists, isLoading: isListsLoading, error: listsError } = useLists();

  const updateUsernameMutation = useUpdateUsername();
  const updateProfileMutation = useUpdateProfile(user?.username);
  const requestAdminMutation = useRequestAdmin(user?.username);

  // Modal & Error States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Form Hooks
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm<ProfileFormData>();
  const { register: registerUsername, handleSubmit: handleUsernameSubmit, reset: resetUsername } = useForm<UsernameFormData>();

  // Sync profile data to form when it loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        bio: profile.bio || '',
        displayName: profile.displayName || ''
      });
    }
  }, [profile, resetProfile]);

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      if (token && user) {
        setAuth(token, { ...user, displayName: data.displayName });
      }
      setIsProfileModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const onUpdateUsername = async (data: UsernameFormData) => {
    if (!user) return;
    try {
      await updateUsernameMutation.mutateAsync({
        username: user.username,
        password: data.password,
        newUsername: data.newUsername
      });
      if (token) {
        setAuth(token, { ...user, username: data.newUsername });
      }
      resetUsername();
      setIsUsernameModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update username.');
    }
  };

  const handleRequestAdmin = async () => {
    try {
      setRequestError(null);
      await requestAdminMutation.mutateAsync();
      toast.success('Admin request submitted successfully!');
    } catch (err: any) {
      console.error(err);
      // Determine if rejection error or standard error
      const serverMsg = err.response?.data?.message || err.message;
      const displayError = serverMsg?.includes('rejected') || serverMsg?.includes('already')
        ? 'An admin rejected your request.'
        : 'An admin rejected your request.'; // Fallback as requested
      setRequestError(displayError);
      toast.error(displayError);
    }
  };

  if (!user) {
    return (
      <div className="text-white p-8 text-center">
        <p className="text-lg">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="text-white max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Your Profile</h1>
          <p className="text-text-muted-dark">Manage your personal information and lists here.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 bg-white/10 text-white font-medium rounded-md hover:bg-white/20 transition-colors"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => setIsUsernameModalOpen(true)}
            className="px-4 py-2 bg-primary/10 text-primary font-medium border border-primary/30 rounded-md hover:bg-primary/20 transition-colors"
          >
            Change Username
          </button>
          {profile && profile.role !== 'ADMIN' && (
            profile.userState === 'ADMIN_PENDING' ? (
              <button 
                disabled
                className="px-4 py-2 bg-yellow-500/10 text-yellow-400 font-medium border border-yellow-500/20 rounded-md flex items-center gap-2 cursor-not-allowed opacity-80"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                Request Pending
              </button>
            ) : (
              <button 
                onClick={handleRequestAdmin}
                disabled={requestAdminMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-md hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {requestAdminMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Request Admin'
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* --- Profile Data Display --- */}
      {isProfileLoading ? (
        <div className="animate-pulse bg-surface/50 border border-white/10 rounded-xl p-8 mb-12">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
            <div className="h-4 bg-white/10 rounded w-3/5"></div>
          </div>
        </div>
      ) : profileError ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl mb-12">
          Failed to load profile information. Please try again later.
        </div>
      ) : profile ? (
        <div className="bg-surface border border-white/10 rounded-xl p-8 mb-12 shadow-lg">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {(profile.displayName || profile.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.displayName || profile.username}</h2>
              <p className="text-text-muted-dark">@{profile.username}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm md:text-base">
            <div>
              <div className="text-text-muted-dark mb-1 text-sm">Role</div>
              <div className="font-medium bg-white/5 inline-block px-3 py-1 rounded-full text-sm">
                {profile.role || 'USER'}
              </div>
            </div>
            <div>
              <div className="text-text-muted-dark mb-1 text-sm">Status</div>
              <div className="font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                {profile.userState || 'ACTIVE'}
              </div>
            </div>
            <div>
              <div className="text-text-muted-dark mb-1 text-sm">Member Since</div>
              <div className="font-medium">
                {new Date(profile.dateCreated).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            {profile.bio && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <div className="text-text-muted-dark mb-2 text-sm">Bio</div>
                <p className="bg-white/5 p-4 rounded-lg italic text-gray-300 border border-white/5">
                  "{profile.bio}"
                </p>
              </div>
            )}
            {profile.userState === 'ADMIN_PENDING' && (
              <div className="col-span-1 md:col-span-2 mt-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                <span className="text-sm font-medium">Your request for admin privileges is pending approval by an administrator.</span>
              </div>
            )}
            {requestError && (
              <div className="col-span-1 md:col-span-2 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                <span className="text-sm font-medium">{requestError}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* --- User Lists Display --- */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold">Your Lists</h2>
        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          {lists?.length || 0} Total
        </span>
      </div>
      
      {isListsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-surface/50 border border-white/10 h-40 rounded-xl p-6">
              <div className="h-6 bg-white/10 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2 mb-6">
                <div className="h-5 bg-white/10 rounded w-16"></div>
                <div className="h-5 bg-white/10 rounded w-16"></div>
              </div>
              <div className="h-4 bg-white/10 rounded w-1/2 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : listsError ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl">
          Failed to load your lists. Please try again later.
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.slice(0, 3).map((list) => (
              <Link 
                href={`/lists/${list.listId}`}
                key={list.listId} 
                className="group bg-surface border border-white/10 hover:border-primary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full cursor-pointer block"
              >
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors line-clamp-1">
                  {list.nameList}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs mb-6">
                  <span className="px-2.5 py-1 bg-white/10 rounded-md font-medium text-gray-300">
                    {list.listType.replace(/_/g, ' ')}
                  </span>
                  {list.isPublic ? (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-md font-medium">Public</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-md font-medium">Private</span>
                  )}
                  {list.isCustom && (
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-md font-medium">Custom</span>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-white/10 text-xs text-text-muted-dark">
                  Created on {new Date(list.dateCreated).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Link 
              href="/lists" 
              className="px-6 py-2 bg-white/10 text-white font-medium rounded-md hover:bg-white/20 transition-colors"
            >
              View All Lists
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface/50 border border-white/10 p-12 rounded-xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No lists found</h3>
          <p className="text-text-muted-dark">You haven't created any lists yet.</p>
        </div>
      )}

      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Update Profile"
      >
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
            <input
              type="text"
              {...registerProfile('displayName')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
            <textarea
              {...registerProfile('bio')}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none backdrop-blur-sm"
            ></textarea>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isUsernameModalOpen} 
        onClose={() => setIsUsernameModalOpen(false)} 
        title="Change Username"
      >
        <form onSubmit={handleUsernameSubmit(onUpdateUsername)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              required
              {...registerUsername('password')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Username</label>
            <input
              type="text"
              required
              {...registerUsername('newUsername')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all backdrop-blur-sm"
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={() => setIsUsernameModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUsernameMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {updateUsernameMutation.isPending ? 'Changing...' : 'Confirm Change'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}