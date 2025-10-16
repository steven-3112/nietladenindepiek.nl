'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function SessionDebug() {
  const { data: session, status } = useSession();
  const [serverSession, setServerSession] = useState<{
    hasSession: boolean;
    user?: { email: string; roles: string[] };
    error?: string;
  } | null>(null);

  useEffect(() => {
    // Check server session
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => setServerSession(data))
      .catch(err => console.error('Session check failed:', err));
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <div>
        <strong>Client Status:</strong> {status}
      </div>
      <div>
        <strong>Client User:</strong> {session?.user?.email || 'None'}
      </div>
      <div>
        <strong>Client Roles:</strong> {session?.user?.roles?.join(', ') || 'None'}
      </div>
      <div>
        <strong>Server Session:</strong> {serverSession?.hasSession ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Server User:</strong> {serverSession?.user?.email || 'None'}
      </div>
      <div>
        <strong>Server Roles:</strong> {serverSession?.user?.roles?.join(', ') || 'None'}
      </div>
    </div>
  );
}
