import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Heart, MessageCircle, Share2, User, Bookmark, Send } from 'lucide-react';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: {
        username: string;
        profile_picture?: { image: string };
    };
}

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
    comments?: Comment[];
    isBookmarked?: boolean; // Optimistic UI state
}

const Feed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            // Backend returns {status_code, message, data: [...]}
            setPosts(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            await api.post('/posts', { content: newPostContent });
            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            await api.post(`/posts/${postId}/like`);
            fetchPosts();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleBookmark = async (postId: string) => {
        try {
            await api.post(`/posts/${postId}/bookmark`);
            // Optimistic update could be done here, but for now we'll refetch or just toggle icon if we had state
            // Since we don't have isBookmarked in the initial feed response yet (backend update needed for that),
            // we will just log success for now or refetch if we want to be sure.
            // Ideally, the feed API should return 'is_bookmarked' for the current user.
            console.log('Toggled bookmark');
        } catch (error) {
            console.error('Error bookmarking post:', error);
        }
    };

    const toggleCommentSection = async (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
            // Fetch comments for this post
            try {
                const response = await api.get(`/posts/${postId}/comments`);
                const comments = response.data.data || response.data;
                setPosts(prevPosts => prevPosts.map(p =>
                    p.id === postId ? { ...p, comments: comments } : p
                ));
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }
    };

    const handlePostComment = async (postId: string) => {
        if (!commentContent.trim()) return;
        try {
            const response = await api.post(`/posts/${postId}/comment`, { content: commentContent });
            const newComment = response.data.data || response.data;
            setCommentContent('');
            // Append new comment to the post's comments list
            setPosts(prevPosts => prevPosts.map(p =>
                p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
            ));
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Feed</h1>

            {/* Create Post Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Create a Post</h2>
                <form onSubmit={handleCreatePost}>
                    <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                        rows={3}
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        disabled={isPosting}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPosting || !newPostContent.trim()}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isPosting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow p-6">
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
                                <button onClick={() => handleLike(post.id)} className="flex items-center hover:text-red-500 transition">
                                    <Heart className="h-5 w-5 mr-1" />
                                    <span>Like</span>
                                </button>
                                <button onClick={() => toggleCommentSection(post.id)} className="flex items-center hover:text-blue-500 transition">
                                    <MessageCircle className="h-5 w-5 mr-1" />
                                    <span>Comment</span>
                                </button>
                                <button className="flex items-center hover:text-green-500 transition">
                                    <Share2 className="h-5 w-5 mr-1" />
                                    <span>Share</span>
                                </button>
                            </div>
                            <button onClick={() => handleBookmark(post.id)} className="flex items-center text-gray-500 hover:text-yellow-500 transition">
                                <Bookmark className="h-5 w-5 mr-1" />
                                <span>Save</span>
                            </button>
                        </div>

                        {/* Comments Section */}
                        {activeCommentPostId === post.id && (
                            <div className="mt-4 border-t pt-4">
                                <div className="space-y-4 mb-4">
                                    {post.comments?.map((comment) => (
                                        <div key={comment.id} className="flex space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 flex-1">
                                                <p className="font-semibold text-sm text-gray-800">{comment.user.username}</p>
                                                <p className="text-gray-700 text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!post.comments || post.comments.length === 0) && (
                                        <p className="text-gray-500 text-sm text-center">No comments yet. Be the first!</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                                    />
                                    <button
                                        onClick={() => handlePostComment(post.id)}
                                        disabled={!commentContent.trim()}
                                        className="text-blue-500 hover:text-blue-600 disabled:text-gray-300"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;
