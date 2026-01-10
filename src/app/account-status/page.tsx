import React, { Suspense } from 'react';
import ClientOnlyAccountStatus from './client-account-status';

export default function AccountStatusPage() {
  return (
    <Suspense fallback={<div>Loading account status...</div>}>
      <ClientOnlyAccountStatus />
    </Suspense>
  );
}