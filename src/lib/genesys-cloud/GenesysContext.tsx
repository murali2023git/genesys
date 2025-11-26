import React, { createContext, useContext, useEffect, useState } from 'react';
import platformClient from 'purecloud-platform-client-v2';
import type { GenesysContextType } from './types';

const GenesysContext = createContext<GenesysContextType | undefined>(undefined);

interface GenesysProviderProps {
    children: React.ReactNode;
    clientId: string;
    region?: string;
    redirectUri?: string;
}

export const GenesysProvider: React.FC<GenesysProviderProps> = ({
    children,
    clientId,
    region = 'mypurecloud.com',
    redirectUri = window.location.origin
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const client = platformClient.ApiClient.instance;
        client.setEnvironment(region);
        client.setPersistSettings(true, 'genesys_cloud_session');

        client.loginImplicitGrant(clientId, redirectUri)
            .then((data) => {
                console.log('Authenticated with Genesys Cloud');
                setToken(data.accessToken);
                setIsAuthenticated(true);

                // Fetch current user details
                const usersApi = new platformClient.UsersApi();
                return usersApi.getUsersMe();
            })
            .then((currentUser) => {
                setUser(currentUser);
            })
            .catch((err) => {
                console.error('Authentication error:', err);
                setIsAuthenticated(false);
            });
    }, [clientId, region, redirectUri]);

    const logout = () => {
        const client = platformClient.ApiClient.instance;
        client.logout(window.location.origin);
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
    };

    return (
        <GenesysContext.Provider value={{ isAuthenticated, token, user, logout }}>
            {children}
        </GenesysContext.Provider>
    );
};

export const useGenesysContext = () => {
    const context = useContext(GenesysContext);
    if (context === undefined) {
        throw new Error('useGenesysContext must be used within a GenesysProvider');
    }
    return context;
};
