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
    <div className="text-white max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative font-mono">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 uppercase tracking-widest">// USER_PROFILE</h1>
          <p className="text-xs text-text-muted-dark">// SESSION_IDENTITY: ACTIVE</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all rounded-none cursor-pointer uppercase tracking-widest font-bold"
          >
            [ EDIT_PROFILE ]
          </button>
          <button 
            onClick={() => setIsUsernameModalOpen(true)}
            className="px-4 py-2 bg-cyan-accent/5 text-cyan-accent border border-cyan-accent/20 hover:bg-cyan-accent/15 transition-all rounded-none cursor-pointer uppercase tracking-widest font-bold"
          >
            [ CHANGE_USERNAME ]
          </button>
          {profile && profile.role !== 'ADMIN' && (
            profile.userState === 'ADMIN_PENDING' ? (
              <button 
                disabled
                className="px-4 py-2 bg-yellow-accent/10 text-yellow-accent border border-yellow-accent/20 rounded-none flex items-center gap-2 cursor-not-allowed opacity-80 uppercase tracking-widest font-bold"
              >
                <span className="w-1.5 h-1.5 bg-yellow-accent animate-pulse shadow-[0_0_8px_rgba(243,230,0,0.6)]"></span>
                [ PENDING_ADMIN_ACCESS ]
              </button>
            ) : (
              <button 
                onClick={handleRequestAdmin}
                disabled={requestAdminMutation.isPending}
                className="px-4 py-2 bg-yellow-accent/10 border border-yellow-accent/40 text-yellow-accent hover:bg-yellow-accent hover:text-surface-dark transition-all rounded-none shadow-[0_0_8px_rgba(243,230,0,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer uppercase tracking-widest font-bold"
              >
                {requestAdminMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-yellow-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SUBMITTING...
                  </>
                ) : (
                  '[ ELEVATE_TO_ADMIN ]'
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* --- Profile Data Display --- */}
      {isProfileLoading ? (
        <div className="animate-pulse bg-black/20 border border-white/10 rounded-none p-8 mb-12">
          <div className="h-6 bg-white/10 rounded-none w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-4 bg-white/10 rounded-none w-3/4"></div>
            <div className="h-4 bg-white/10 rounded-none w-1/2"></div>
            <div className="h-4 bg-white/10 rounded-none w-2/3"></div>
            <div className="h-4 bg-white/10 rounded-none w-3/5"></div>
          </div>
        </div>
      ) : profileError ? (
        <div className="bg-red-accent/10 border border-red-accent/20 text-red-accent p-6 rounded-none mb-12 text-xs">
          // SYSTEM_ERROR: FAILED TO LOAD PROFILE INFORMATION. RETRY CONNECTION.
        </div>
      ) : profile ? (
        <div className="bg-black/20 border border-white/10 rounded-none p-8 mb-12">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-none border border-cyan-accent bg-cyan-accent/10 text-cyan-accent flex items-center justify-center text-2xl font-bold select-none">
              {(profile.displayName || profile.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-widest">{profile.displayName || profile.username}</h2>
              <p className="text-text-muted-dark text-sm mt-0.5">ID: @{profile.username}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-xs md:text-sm">
            <div>
              <div className="text-text-muted-dark mb-1 text-xs uppercase tracking-wider">// ACCESS_ROLE</div>
              <div className="font-bold border border-white/10 bg-black/40 text-cyan-accent inline-block px-3 py-1 rounded-none uppercase">
                {profile.role || 'USER'}
              </div>
            </div>
            <div>
              <div className="text-text-muted-dark mb-1 text-xs uppercase tracking-wider">// STATUS</div>
              <div className="font-bold flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                {profile.userState || 'ACTIVE'}
              </div>
            </div>
            <div>
              <div className="text-text-muted-dark mb-1 text-xs uppercase tracking-wider">// REGISTRATION_DATE</div>
              <div className="font-medium text-gray-300">
                {new Date(profile.dateCreated).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            {profile.bio && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <div className="text-text-muted-dark mb-2 text-xs uppercase tracking-wider">// USER_BIO</div>
                <p className="bg-black/40 p-4 rounded-none italic text-gray-300 border border-white/5 leading-relaxed">
                  &quot;{profile.bio}&quot;
                </p>
              </div>
            )}
            {profile.userState === 'ADMIN_PENDING' && (
              <div className="col-span-1 md:col-span-2 mt-4 bg-yellow-accent/5 border border-yellow-accent/20 text-yellow-accent p-4 rounded-none flex items-center gap-3 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-yellow-accent animate-pulse shadow-[0_0_8px_rgba(243,230,0,0.6)] shrink-0"></span>
                <span className="text-xs uppercase tracking-wider font-semibold">SYS_NOTICE: Admin privileges elevation request is pending review by root admin.</span>
              </div>
            )}
            {requestError && (
              <div className="col-span-1 md:col-span-2 mt-4 bg-red-accent/10 border border-red-accent/20 text-red-accent p-4 rounded-none flex items-center gap-3 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-red-accent shadow-[0_0_8px_rgba(255,0,85,0.6)] shrink-0"></span>
                <span className="text-xs uppercase tracking-wider font-semibold">SYS_FAILURE: {requestError}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* --- User Lists Display --- */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold uppercase tracking-widest">// CUSTOM_WATCHLISTS</h2>
        <span className="bg-cyan-accent/10 border border-cyan-accent/20 text-cyan-accent px-2.5 py-0.5 rounded-none text-xs font-bold font-mono">
          {lists?.length || 0} TOTAL
        </span>
      </div>
      
      {isListsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-black/20 border border-white/10 h-40 rounded-none p-6">
              <div className="h-5 bg-white/10 rounded-none w-2/3 mb-4"></div>
              <div className="flex gap-2 mb-6">
                <div className="h-4 bg-white/10 rounded-none w-16"></div>
                <div className="h-4 bg-white/10 rounded-none w-16"></div>
              </div>
              <div className="h-4 bg-white/10 rounded-none w-1/2 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : listsError ? (
        <div className="bg-red-accent/10 border border-red-accent/20 text-red-accent p-6 rounded-none text-xs font-mono">
          // SYSTEM_ERROR: FAILED_TO_RETRIEVE_WATCHLISTS. RETRY.
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.slice(0, 3).map((list) => (
              <Link 
                href={`/lists/${list.listId}`}
                key={list.listId} 
                className="group bg-black/20 border border-white/10 hover:border-cyan-accent/40 p-6 transition-all duration-300 hover:shadow-[0_0_12px_rgba(85,234,212,0.05)] hover:-translate-y-0.5 flex flex-col h-full cursor-pointer block rounded-none"
              >
                <h3 className="text-lg font-bold mb-3 text-white group-hover:text-cyan-accent transition-colors line-clamp-1 uppercase tracking-wider font-mono">
                  {list.nameList}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[10px] mb-6 font-mono">
                  <span className="px-2 py-0.5 border border-white/10 rounded-none bg-black/40 font-bold uppercase text-gray-300">
                    {list.listType.replace(/_/g, ' ')}
                  </span>
                  {list.isPublic ? (
                    <span className="px-2 py-0.5 border border-green-500/20 text-green-400 rounded-none font-bold uppercase bg-green-500/10">Public</span>
                  ) : (
                    <span className="px-2 py-0.5 border border-yellow-accent/20 text-yellow-accent rounded-none font-bold uppercase bg-yellow-accent/10">Private</span>
                  )}
                  {list.isCustom && (
                    <span className="px-2 py-0.5 border border-cyan-accent/20 text-cyan-accent rounded-none font-bold uppercase bg-cyan-accent/10">Custom</span>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-white/5 text-[10px] text-text-muted-dark uppercase font-mono">
                  CREATION_DATE: {new Date(list.dateCreated).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Link 
              href="/lists" 
              className="px-6 py-2 border border-white/10 text-white font-medium hover:bg-white/5 hover:border-white/20 transition-all rounded-none uppercase text-xs tracking-widest font-bold"
            >
              [ VIEW_ALL_LISTS ]
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-black/20 border border-white/10 p-12 text-center flex flex-col items-center justify-center rounded-none font-mono">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-none flex items-center justify-center mb-4 text-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-bold mb-2 uppercase tracking-wider">// NO_LISTS_FOUND</h3>
          <p className="text-xs text-text-muted-dark">// SESSION_DATA_VACANT</p>
        </div>
      )}

      {/* Profile Edit Modals with Cyberpunk theme */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Update Profile"
      >
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// DISPLAY_NAME</label>
            <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
              <input
                type="text"
                {...registerProfile('displayName')}
                className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// BIO_INFORMATION</label>
            <div className="relative border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <textarea
                {...registerProfile('bio')}
                rows={4}
                className="w-full bg-transparent border-0 px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono resize-none"
              ></textarea>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-cyan-accent text-surface-dark font-black hover:bg-[#2be0c5] shadow-[0_0_8px_rgba(85,234,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              {updateProfileMutation.isPending ? 'UPDATING...' : '[ SAVE_CHANGES ]'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isUsernameModalOpen} 
        onClose={() => setIsUsernameModalOpen(false)} 
        title="Change Username"
      >
        <form onSubmit={handleUsernameSubmit(onUpdateUsername)} className="space-y-5 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// CURRENT_PASSWORD</label>
            <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
              <input
                type="password"
                required
                {...registerUsername('password')}
                className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// NEW_USERNAME_ID</label>
            <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
              <input
                type="text"
                required
                {...registerUsername('newUsername')}
                className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsUsernameModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={updateUsernameMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-cyan-accent text-surface-dark font-black hover:bg-[#2be0c5] shadow-[0_0_8px_rgba(85,234,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              {updateUsernameMutation.isPending ? 'CHANGING...' : '[ CONFIRM_CHANGE ]'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}