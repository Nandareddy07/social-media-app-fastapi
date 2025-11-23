import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    username: string;
    email: string;
    profile_picture?: { image: string };
}

const Profile: React.FC = () => {
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchFollowers();
        fetchFollowing();
    }, []);

    const fetchFollowers = async () => {
        try {
            const response = await api.get(`/users/${currentUser?.id}/followers`);
            setFollowers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await api.get(`/users/${currentUser?.id}/followings`);
            setFollowing(response.data.data || []);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const displayUsers = activeTab === 'followers' ? followers : following;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-6">
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser?.username}</h2>
                        <p className="text-gray-600">{currentUser?.email}</p>
                        <div className="flex gap-6 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{followers.length}</p>
                                <p className="text-sm text-gray-600">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{following.length}</p>
                                <p className="text-sm text-gray-600">Following</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-4 px-6 text-center font-semibold transition ${activeTab === 'followers'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <Users className="inline-block mr-2 h-5 w-5" />
                        Followers ({followers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-4 px-6 text-center font-semibold transition ${activeTab === 'following'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <UserPlus className="inline-block mr-2 h-5 w-5" />
                        Following ({following.length})
                    </button>
                </div>

                {/* User List */}
                <div className="p-6">
                    {displayUsers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p>No {activeTab} yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayUsers.map((user) => (
                                <div key={user.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-800">{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
