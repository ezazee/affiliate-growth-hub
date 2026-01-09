import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Phone, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductBySlug, getAffiliateLinkByCode, getUserById, affiliateLinks, products } from '@/data/mockData';
import { Product, AffiliateLink, User as UserType } from '@/types';
import { toast } from 'sonner';

export default function Checkout() {
  const { productSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refCode = searchParams.get('ref');

  const [product, setProduct] = useState<Product | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [affiliator, setAffiliator] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    shippingAddress: '',
    city: '',
    province: '',
    postalCode: '',
    orderNote: '',
  });

  useEffect(() => {
    // Validate affiliate link
    if (!refCode) {
      navigate('/invalid-affiliate');
      return;
    }

    const link = affiliateLinks.find(l => l.code === refCode && l.isActive);
    if (!link) {
      navigate('/invalid-affiliate');
      return;
    }

    const foundProduct = products.find(p => p.slug === productSlug && p.isActive);
    if (!foundProduct || foundProduct.id !== link.productId) {
      navigate('/invalid-affiliate');
      return;
    }

    const foundAffiliator = getUserById(link.affiliatorId);
    if (!foundAffiliator || foundAffiliator.status !== 'approved') {
      navigate('/invalid-affiliate');
      return;
    }

    setProduct(foundProduct);
    setAffiliateLink(link);
    setAffiliator(foundAffiliator);
  }, [productSlug, refCode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would create an order in the database
    console.log('Order submitted:', {
      ...formData,
      productId: product?.id,
      affiliatorId: affiliator?.id,
      affiliateCode: refCode,
      affiliateName: affiliator?.name,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success('Order placed successfully!');
  };

  if (!product || !affiliator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-success/20 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-success" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Order Placed!
          </h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. Our team will contact you shortly for payment confirmation 
            and shipping details.
          </p>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border text-left mb-8">
            <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${product.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">TBD</span>
              </div>
            </div>
          </div>

          <Button asChild className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-button">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">AffiliateHub</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Personal Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerName">Full Name *</Label>
                        <Input
                          id="buyerName"
                          value={formData.buyerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyerPhone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="buyerPhone"
                            value={formData.buyerPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                            placeholder="+1234567890"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping Address
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Street Address *</Label>
                      <Input
                        id="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                        placeholder="123 Main Street, Apt 4B"
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Province/State *</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="orderNote">Order Notes (Optional)</Label>
                    <Textarea
                      id="orderNote"
                      value={formData.orderNote}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNote: e.target.value }))}
                      placeholder="Any special instructions..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="animate-pulse-soft">Processing...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our terms and conditions. 
                    Payment details will be sent via WhatsApp/Email.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card sticky top-8">
              <CardHeader>
                <CardTitle className="font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product */}
                <div className="flex gap-4">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-accent-foreground">Calculated later</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-bold text-primary">${product.price}+</span>
                  </div>
                </div>

                {/* Referred By */}
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground mb-1">Referred by</p>
                  <p className="font-medium text-foreground">{affiliator.name}</p>
                  <p className="text-xs text-muted-foreground">Code: {refCode}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
