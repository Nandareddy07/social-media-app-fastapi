import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SimpleUser {
    id: string;
    username: string;
    email: string;
}

const FollowersPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [followers, setFollowers] = useState<SimpleUser[]>([]);
    const [following, setFollowing] = useState<SimpleUser[]>([]);
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

    useEffect(() => {
        if (currentUser?.id) {
            fetchFollowers();
            fetchFollowing();
        }
    }, [currentUser]);

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

    const displayList = activeTab === 'followers' ? followers : following;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Connections</h1>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex border-b mb-4">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-2 px-4 text-center font-semibold transition ${activeTab === 'followers'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Followers ({followers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-2 px-4 text-center font-semibold transition ${activeTab === 'following'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Following ({following.length})
                    </button>
                </div>
                <div className="p-4">
                    {displayList.length === 0 ? (
                        <p className="text-center text-gray-500">No {activeTab} yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {displayList.map((u) => (
                                <li key={u.id} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 transition">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{u.username}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowersPage;
