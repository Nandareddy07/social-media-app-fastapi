import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Activity as ActivityIcon } from 'lucide-react';

interface Activity {
    id: string;
    actor_id: string;
    action_type: string;
    message: string;
    created_at: string;
}

const ActivityWall: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/activity/feed');
            setActivities(response.data.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                <ActivityIcon className="mr-2 h-8 w-8 text-purple-500" />
                Activity Wall
            </h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                        <li key={activity.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                        <ActivityIcon className="h-4 w-4 text-purple-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ActivityWall;
