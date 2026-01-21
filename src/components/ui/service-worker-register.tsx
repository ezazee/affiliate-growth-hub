"use client";

import { useEffect } from 'react';
import { useServiceWorker } from '@/lib/service-worker';

export function ServiceWorkerRegister() {
  useServiceWorker();
  
  return null;
}