import React from 'react';
import type { CallEvent } from '../lib/genesys-cloud/types';

interface CallCardProps {
    call: CallEvent;
}

export const CallCard: React.FC<CallCardProps> = ({ call }) => {
    const customer = call.participants.find(p => p.purpose === 'customer' || p.purpose === 'external');
    const agent = call.participants.find(p => p.purpose === 'agent' || p.purpose === 'user');

    return (
        <div style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Incoming Call</h3>
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: call.state === 'connected' ? '#e6fffa' : '#fff5f5',
                    color: call.state === 'connected' ? '#2c7a7b' : '#c53030',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                }}>
                    {call.state.toUpperCase()}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <p style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '4px' }}>Customer</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{customer?.name || customer?.address || 'Unknown'}</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#4a5568' }}>{customer?.address}</p>
                </div>

                <div>
                    <p style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '4px' }}>Agent</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{agent?.name || 'Me'}</p>
                </div>
            </div>
        </div>
    );
};
