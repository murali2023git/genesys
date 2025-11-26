import { GenesysProvider, useGenesysContext } from './lib/genesys-cloud/GenesysContext';
import { useGenesysNotifications } from './lib/genesys-cloud/useGenesysNotifications';
import { CallCard } from './components/CallCard';

// Component that consumes the context and hooks
const AgentMonitor = () => {
  const { user, isAuthenticated, logout } = useGenesysContext();
  const { activeCalls, connectionStatus } = useGenesysNotifications();

  if (!isAuthenticated) {
    return <div>Authenticating...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Agent Monitor</h1>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>Welcome, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? '#48bb78' : '#f56565'
            }} />
            <span style={{ fontSize: '0.875rem', color: '#718096' }}>
              {connectionStatus === 'connected' ? 'System Online' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {activeCalls.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            color: '#718096'
          }}>
            No active calls
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeCalls.map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  // NOTE: These should come from environment variables in a real app
  // For now, we'll use placeholders or expect them to be set in .env
  const clientId = import.meta.env.VITE_GENESYS_CLIENT_ID || 'YOUR_CLIENT_ID';
  const region = import.meta.env.VITE_GENESYS_REGION || 'mypurecloud.com';

  return (
    <GenesysProvider clientId={clientId} region={region}>
      <AgentMonitor />
    </GenesysProvider>
  );
}

export default App;
