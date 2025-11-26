import { useEffect, useState } from 'react';
import platformClient from 'purecloud-platform-client-v2';
import { useGenesysContext } from './GenesysContext';
import type { CallEvent } from './types';

export const useGenesysNotifications = () => {
    const { isAuthenticated, user } = useGenesysContext();
    const [activeCalls, setActiveCalls] = useState<CallEvent[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        let ws: WebSocket | null = null;
        const notificationsApi = new platformClient.NotificationsApi();

        const setupNotifications = async () => {
            try {
                setConnectionStatus('connecting');
                // Create a new channel
                const channel = await notificationsApi.postNotificationsChannels();
                console.log('Notification channel created:', channel.id);

                // Subscribe to user conversations
                const userId = user.id;
                if (!userId) {
                    console.error('User ID not available');
                    return;
                }
                const topic = `v2.users.${userId}.conversations.calls`;

                if (!channel.id) {
                    console.error('Channel ID not available');
                    return;
                }

                await notificationsApi.postNotificationsChannelSubscriptions(channel.id, [{ id: topic }]);
                console.log('Subscribed to topic:', topic);

                // Connect to WebSocket
                if (!channel.connectUri) {
                    console.error('Channel connect URI not available');
                    return;
                }
                ws = new WebSocket(channel.connectUri);

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setConnectionStatus('connected');
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    // Handle heartbeat
                    if (data.topicName === 'channel.metadata') {
                        console.log('Heartbeat received');
                        return;
                    }

                    // Handle conversation events
                    if (data.topicName === topic) {
                        console.log('Call event received:', data.eventBody);
                        handleCallEvent(data.eventBody);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setConnectionStatus('disconnected');
                };

            } catch (error) {
                console.error('Failed to setup notifications:', error);
                setConnectionStatus('disconnected');
            }
        };

        setupNotifications();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [isAuthenticated, user]);

    const handleCallEvent = (eventBody: any) => {
        // Transform eventBody to CallEvent
        // Note: The actual event structure is complex, this is a simplified mapping
        const callEvent: CallEvent = {
            id: eventBody.id,
            participants: eventBody.participants.map((p: any) => ({
                id: p.id,
                name: p.name,
                address: p.address,
                purpose: p.purpose,
                state: p.state,
                direction: p.direction,
            })),
            state: eventBody.participants[0]?.state || 'unknown', // Simplified state
        };

        setActiveCalls((prev) => {
            // Update existing call or add new one
            const index = prev.findIndex((c) => c.id === callEvent.id);
            if (index >= 0) {
                const newCalls = [...prev];
                // If call is disconnected/terminated, maybe remove it? 
                // For now, let's just update it. 
                // If all participants are disconnected, we could remove it.
                const isEnded = callEvent.participants.every((p: any) => p.state === 'disconnected' || p.state === 'terminated');
                if (isEnded) {
                    return newCalls.filter(c => c.id !== callEvent.id);
                }
                newCalls[index] = callEvent;
                return newCalls;
            } else {
                // Only add if it's not ended
                const isEnded = callEvent.participants.every((p: any) => p.state === 'disconnected' || p.state === 'terminated');
                if (isEnded) return prev;
                return [...prev, callEvent];
            }
        });
    };

    return { activeCalls, connectionStatus };
};
