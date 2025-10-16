'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm text-red-600 hover:text-red-800"
    >
      Uitloggen
    </button>
  );
}

