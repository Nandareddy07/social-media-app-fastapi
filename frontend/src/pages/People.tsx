import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { UserPlus, UserMinus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    username: string;
    email: string;
    profile_picture?: { image: string };
}

const People: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
        fetchFollowing();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            // Filter out current user
            const otherUsers = response.data.data.filter((u: User) => u.id !== currentUser?.id);
            setUsers(otherUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await api.get(`/users/${currentUser?.id}/followings`);
            const followingSet = new Set<string>(response.data.data.map((u: User) => u.id));
            setFollowingIds(followingSet);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const handleFollow = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/follow`);
            // Refresh following list immediately
            fetchFollowing();
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/unfollow`);
            // Refresh following list immediately
            fetchFollowing();
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Discover People</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-gray-800">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div>
                            {followingIds.has(user.id) ? (
                                <button
                                    onClick={() => handleUnfollow(user.id)}
                                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                                >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Unfollow
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleFollow(user.id)}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Follow
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>No other users found</p>
                </div>
            )}
        </div>
    );
};

export default People;
