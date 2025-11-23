import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Heart, MessageCircle, Share2, User, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Post {
    id: string;
    content: string;
    image?: string;
    video?: string;
    created_at: string;
    original_post_owner?: {
        username: string;
        profile_picture?: { image: string };
    };
    original_post?: Post;
}

interface BookmarkItem {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
    post: Post;
}

const Bookmarks: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchBookmarks();
        }
    }, [user]);

    const fetchBookmarks = async () => {
        try {
            const response = await api.get(`/users/${user?.id}/bookmarks`);
            setBookmarks(response.data.data);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const handleRemoveBookmark = async (postId: string) => {
        try {
            await api.post(`/posts/${postId}/bookmark`);
            // Refresh list
            fetchBookmarks();
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Saved Posts</h1>

            {bookmarks.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>You haven't saved any posts yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookmarks.map((item) => {
                        const post = item.post;
                        if (!post) return null; // Handle deleted posts if necessary

                        return (
                            <div key={item.id} className="bg-white rounded-lg shadow p-6 relative">
                                <div className="flex items-center mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {post.original_post_owner?.profile_picture ? (
                                            <img src={post.original_post_owner.profile_picture.image} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-800">{post.original_post_owner?.username || 'Unknown User'}</p>
                                        <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">{post.content}</p>
                                {post.image && (
                                    <img src={post.image} alt="Post content" className="w-full h-64 object-cover rounded-lg mb-4" />
                                )}

                                <div className="flex items-center justify-between border-t pt-4 mt-4">
                                    <div className="flex items-center space-x-6 text-gray-500">
                                        {/* Simplified interactions for bookmark view */}
                                        <div className="flex items-center">
                                            <Heart className="h-5 w-5 mr-1" />
                                            <span>Like</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MessageCircle className="h-5 w-5 mr-1" />
                                            <span>Comment</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBookmark(post.id)}
                                        className="flex items-center text-yellow-500 hover:text-yellow-600 transition"
                                        title="Remove from saved"
                                    >
                                        <Bookmark className="h-5 w-5 mr-1 fill-current" />
                                        <span>Saved</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Bookmarks;
