"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = typeof params?.token === 'string' ? params.token : '';
    const { logout } = useAuth(); // Import logout

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Force logout on mount to prevent dashboard redirects or session conflicts
    useEffect(() => {
        logout(false);
    }, [logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Password tidak cocok', { description: 'Pastikan verifikasi password sama dengan password baru.' });
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password terlalu pendek', { description: 'Minimal 6 karakter.' });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                toast.success('Password Berhasil Direset', { description: 'Anda sekarang dapat login dengan password baru.' });
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                toast.error('Gagal Reset Password', { description: data.error || 'Token tidak valid atau sudah kedaluwarsa.' });
            }
        } catch (error) {
            toast.error('Terjadi kesalahan jaringan');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Sukses!</h2>
                        <p className="text-center text-gray-500">
                            Password Anda berhasil diperbarui. Mengalihkan ke halaman login...
                        </p>
                        <Button asChild className="w-full mt-4">
                            <Link href="/login">Login Sekarang</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border sm:shadow-lg overflow-hidden">
                {/* Header Decoration */}
                <div className="h-2 w-full gradient-primary"></div>

                <CardHeader className="space-y-2 text-center pt-8 pb-6 bg-white">
                    <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md mb-4">
                        <Loader2 className={`h-6 w-6 text-white ${isLoading ? 'animate-spin' : 'hidden'}`} />
                        {!isLoading && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        Buat Password Baru
                    </CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        Silakan masukkan password baru untuk akun Anda.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pt-2 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Password Baru</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Verifikasi Password Baru</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Ulangi password baru"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md gradient-primary transition-all duration-300 hover:shadow-lg active:scale-[0.98]" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Password'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center pb-8 pt-0 bg-white">
                    {!isLoading && (
                        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                            Kembali ke Halaman Login
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
