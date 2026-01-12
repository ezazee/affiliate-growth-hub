"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

async function fetchDataFor(collectionName: string) {
  const response = await fetch(`/api/admin/${collectionName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${collectionName}`);
  }
  return response.json();
}

export default function AdminDebugPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchAll = async () => {
    setLoading(true);
    toast.info("Fetching all database collections...");
    try {
      const [products, users, affiliateLinks, orders, commissions] = await Promise.all([
        fetchDataFor('products'),
        fetchDataFor('users'), // Assuming a /api/admin/users endpoint exists
        fetch('/api/affiliator/links?affiliatorId=all').then(r => r.json()), // A trick to get all links
        fetchDataFor('orders'),
        fetchDataFor('commissions'),
      ]);

      setDbData({
        products,
        users,
        affiliateLinks,
        orders,
        commissions,
      });
      toast.success("Data fetched successfully. Please copy the content.");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to fetch data: ${error.message}`);
      setDbData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Database Debug View</h1>
      <p>This page displays raw data from the database collections to help with debugging. Click the button to fetch all data, then copy the resulting text and provide it for analysis.</p>
      <Button onClick={handleFetchAll} disabled={loading}>
        {loading ? "Fetching Data..." : "Fetch All Database Data"}
      </Button>
      {dbData && (
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-xs">
          {JSON.stringify(dbData, null, 2)}
        </pre>
      )}
    </div>
  );
}
