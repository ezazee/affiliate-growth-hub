import React from 'react';
import { Shield, TrendingUp, Users, Clock, DollarSign, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Komisi 15%",
      description: "Dapatkan komisi 15% dari setiap penjualan yang Anda hasilkan",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Users,
      title: "Produk Berkualitas",
      description: "Promosikan produk skincare dengan kualitas terbaik dan rating 4.9/5",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Shield,
      title: "BPOM Terdaftar",
      description: "Semua produk telah terdaftar resmi dan aman digunakan",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Pantau komisi dan penjualan secara real-time di dashboard Anda",
      gradient: "from-orange-500/20 to-red-500/20"
    },
    {
      icon: TrendingUp,
      title: "Marketing Support",
      description: "Dapatkan materi marketing dan link affiliate otomatis",
      gradient: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: Award,
      title: "Bonus Performance",
      description: "Dapatkan bonus tambahan untuk achiever dengan penjualan tertinggi",
      gradient: "from-yellow-500/20 to-orange-500/20"
    }
  ];

  return (
    <section id="benefits" className="py-20 px-6 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Mengapa Memilih Program Affiliate PE Skinpro?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Nikmati berbagai keuntungan dan kemudahan dalam menjalankan bisnis affiliate bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index}>
              <Card className={`group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${benefit.gradient} backdrop-blur-sm`}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-8 h-8 text-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}