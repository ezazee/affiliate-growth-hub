import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvalidAffiliate() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">AffiliateHub</span>
        </Link>

        {/* Warning Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-destructive/20 flex items-center justify-center"
        >
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Invalid Affiliate Link
        </h1>
        <p className="text-muted-foreground mb-8">
          The affiliate link you're trying to use is invalid, inactive, or has expired. 
          Please contact the affiliator for a valid link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
