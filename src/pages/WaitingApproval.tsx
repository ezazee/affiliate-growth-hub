import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function WaitingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const steps = [
    { icon: CheckCircle, label: 'Account Created', completed: true },
    { icon: Clock, label: 'Under Review', completed: false, active: true },
    { icon: Mail, label: 'Approval Email', completed: false },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">AffiliateHub</span>
        </Link>

        {/* Main Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-accent/20 flex items-center justify-center"
        >
          <Clock className="w-12 h-12 text-accent" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Waiting for Approval
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Hi <span className="font-medium text-foreground">{user?.name || 'there'}</span>! 
          Your registration is being reviewed by our team. We'll notify you once your account is approved.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step.completed 
                    ? 'bg-primary text-primary-foreground' 
                    : step.active 
                      ? 'bg-accent text-accent-foreground animate-pulse-soft' 
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-medium ${
                  step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mb-6 ${
                  step.completed ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-8">
          <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
            Our admin team typically reviews applications within 24-48 hours. 
            Once approved, you'll receive an email and can start creating affiliate links.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleLogout}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
