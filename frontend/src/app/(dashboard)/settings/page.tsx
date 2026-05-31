'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn, getInitials } from '../../../lib/utils';
import { useAuthStore } from '../../../store/auth-store';
import api from '../../../lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, setUser } = useAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications_preferences');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse notifications preferences:', err);
      }
    }
  }, []);

  const [passwordData, setPasswordData] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    testResults: true,
    newTests: true,
    doubts: false,
    marketing: false,
  });

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        setSaving(true);
        const res = await api.patch(`/users/${user?.id}`, {
          avatar: base64String,
        });
        setUser(res.data);
        alert('Avatar updated successfully!');
      } catch (err: any) {
        console.error('Error uploading avatar:', err);
        alert(err.response?.data?.message || 'Failed to upload avatar.');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const res = await api.patch(`/users/${user.id}`, {
        name: profileData.name,
        phone: profileData.phone,
      });
      setUser(res.data);
      alert('Profile updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!passwordData.current) {
      alert('Please enter your current password.');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirm) {
      alert('New passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await api.patch(`/users/${user.id}/change-password`, {
        current: passwordData.current,
        newPassword: passwordData.newPassword,
        confirm: passwordData.confirm,
      });
      alert('Password updated successfully!');
      setPasswordData({ current: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      console.error('Error changing password:', err);
      alert(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      localStorage.setItem('notifications_preferences', JSON.stringify(notifications));
      await new Promise((resolve) => setTimeout(resolve, 600));
      alert('Notification preferences saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save notification preferences.');
    } finally {
      setSavingNotifications(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1">
          <Card padding="sm">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {user ? getInitials(user.name) : 'U'}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button variant="secondary" size="sm" onClick={triggerFileInput}>Change Avatar</Button>
                  <p className="text-xs text-slate-500 mt-1.5">JPG, PNG max 2MB</p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  disabled
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <div className="space-y-1">
                  <Input
                    label="User Role"
                    value={user?.role || 'STUDENT'}
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Once selected, your role cannot be changed directly. To request a change to Teacher or Institute, please email the admin at <a href="mailto:admin@jeesaas.com" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">admin@jeesaas.com</a>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button isLoading={saving} onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
              <div className="space-y-5">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, current: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 rounded-xl bg-slate-800/30">
                <p className="text-xs font-medium text-slate-400 mb-2">Password requirements:</p>
                <ul className="space-y-1">
                  {[
                    'At least 8 characters',
                    'One uppercase letter',
                    'One lowercase letter',
                    'One number',
                    'One special character',
                  ].map((req) => (
                    <li key={req} className="flex items-center gap-2 text-xs text-slate-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end mt-6">
                <Button isLoading={updatingPassword} onClick={handleUpdatePassword}>Update Password</Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'email' as const, label: 'Email Notifications', description: 'Receive important updates via email' },
                  { key: 'testResults' as const, label: 'Test Results', description: 'Get notified when test results are available' },
                  { key: 'newTests' as const, label: 'New Tests', description: 'Get notified when new tests are assigned' },
                  { key: 'doubts' as const, label: 'Doubt Responses', description: 'Get notified when your doubts are answered' },
                  { key: 'marketing' as const, label: 'Marketing Emails', description: 'Receive promotional offers and updates' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-white">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors duration-300',
                        notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300',
                          notifications[item.key] && 'translate-x-5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button isLoading={savingNotifications} onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
