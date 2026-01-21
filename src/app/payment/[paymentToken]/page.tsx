"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Clock, ArrowLeft, AlertCircle, CheckCircle, Loader2, MessageCircle } from 'lucide-react';

import { getAdminWhatsApp, createWhatsAppLink } from '@/lib/whatsapp';
import { Order } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentToken = params.paymentToken as string; // This will be paymentToken now, needs change

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const [orderStatus, setOrderStatus] = useState<'pending' | 'cancelled' | 'paid'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentToken) return; // This will be paymentToken now

    // Retry mechanism to handle potential race condition
    const fetchOrderWithRetry = async (retries = 3, delay = 500) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/payment-details/${paymentToken}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          if (data.status !== 'pending') {
            setOrderStatus(data.status);
          }
          setError(null);
          // Calculate initial time left based on paymentTokenExpiresAt from backend
          if (data.paymentTokenExpiresAt) {
            const expiryDate = new Date(data.paymentTokenExpiresAt);
            const now = new Date();
            const remaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                setOrderStatus('cancelled'); // Mark as cancelled if already expired
                setError('Payment link has expired.');
            }
          }
          setIsLoading(false);
          return; // Success
        } else {
          const data = await response.json();
          if (response.status === 404) {
            setError('Payment link invalid or order not found.');
          } else if (response.status === 409) {
            setError('Payment link already used.');
            setOrderStatus('paid'); // Assuming 409 means it was already used/paid
          } else if (response.status === 410) {
            setError('Payment link has expired.');
            setOrderStatus('cancelled');
          } else if (retries > 0) { // Retry only for generic errors or transient issues
            setTimeout(() => fetchOrderWithRetry(retries - 1, delay), delay);
          } else {
            setError(data.error || 'Gagal memuat detail pesanan.');
          }
          setIsLoading(false);
        }
      } catch (e) {
        setError('Gagal memuat pesanan karena kesalahan jaringan.');
        setIsLoading(false);
      }
    };
    
    fetchOrderWithRetry();
  }, [paymentToken]); // This will be paymentToken now

  useEffect(() => {
    if (orderStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setOrderStatus('cancelled');
          setError('Waktu pembayaran telah habis. Token pembayaran tidak lagi berlaku.');
          // Auto refresh after 3 seconds to show expired state
          setTimeout(() => {
            router.refresh();
          }, 3000);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderStatus, router]);



  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleWhatsAppAdmin = async () => {
    const adminWhatsApp = await getAdminWhatsApp();
    const message = `----------------------------------------
📦 ORDER BARU MASUK
----------------------------------------
Nama Lengkap    : ${order?.buyerName || ''}
No. Handphone   : ${order?.buyerPhone || ''}
Alamat          : ${order?.shippingAddress || ''}, ${order?.city || ''}, ${order?.province || ''} ${order?.postalCode || ''}

Nomor Transaksi : ${order?.orderNumber || ''}
Total Harga     : ${order?.totalPrice?.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }) || 'Rp 0'}
Tanggal Order   : ${order?.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
Sumber          : Customer
----------------------------------------
Mohon segera dilakukan pengecekan dan diproses melalui dashboard admin.
Terima kasih.`;
    
    const whatsappUrl = createWhatsAppLink(adminWhatsApp, message);
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Terjadi Kesalahan</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderStatus === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pesanan Dibatalkan</h1>
          <p className="text-muted-foreground mb-6">Waktu pembayaran Anda telah habis.</p>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Selesaikan Pembayaran</CardTitle>
          <CardDescription>Pindai kode QRIS di bawah ini untuk membayar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className={`font-bold text-xl p-3 rounded-lg mb-4 transition-all ${
            timeLeft <= 10 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-destructive text-destructive-foreground'
          }`}>
            ⏰ Sisa Waktu: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="p-4 border rounded-lg bg-white">
            <Image src="https://blsfkizrchqzahqa.public.blob.vercel-storage.com/qris.jpeg" alt="QRIS Payment Code" width={300} height={300} priority />
          </div>

          <div className="w-full text-left mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Pesanan:</span>
              <span className="font-mono font-bold">{order?.orderNumber}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total Pembayaran:</span>
              <span className="text-primary">
                {order?.totalPrice?.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleWhatsAppAdmin}
            className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Hubungi Admin via WhatsApp
          </Button>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>⚠️ Pembayaran harus diselesaikan dalam 1 menit.</p>
            <p>Setelah melakukan pembayaran, status akan diperbarui secara otomatis.</p>
            <p>Jika ada masalah, hubungi dukungan pelanggan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}