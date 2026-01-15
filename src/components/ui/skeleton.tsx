import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Shimmer effect for smoother loading
export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge skeleton */}
          <Skeleton className="inline-flex items-center gap-2 px-4 py-2 rounded-full h-8 w-32 mb-6 animate-fade-in" />
          
          {/* Title skeleton with stagger */}
          <div className="space-y-4 mb-6">
            <Skeleton className="h-12 w-full max-w-3xl mx-auto animate-fade-in" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }} />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-10">
            <Skeleton className="h-6 w-full max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }} />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Skeleton className="h-12 w-40 animate-fade-in" style={{ animationDelay: '0.4s' }} />
            <Skeleton className="h-12 w-32 animate-fade-in" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-10 w-20 mx-auto mb-2 animate-fade-in" style={{ animationDelay: `${0.6 + i * 0.1}s` }} />
                <Skeleton className="h-4 w-16 mx-auto animate-fade-in" style={{ animationDelay: `${0.7 + i * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// About Section Skeleton
export function AboutSkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content skeleton */}
          <div>
            <div className="space-y-4 mb-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            {/* Tags skeleton */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          </div>

          {/* Image skeleton */}
          <div className="relative">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Benefits Section Skeleton
export function BenefitsSkeleton() {
  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-4 w-full max-w-xl mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="w-16 h-16 rounded-xl mx-auto mb-4" />
              <div className="space-y-2 mb-3">
                <Skeleton className="h-6 w-20 mx-auto" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products Section Skeleton with shimmer
export function ProductsSkeleton() {
  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-3/4 mx-auto mb-4 animate-fade-in" />
          <Skeleton className="h-4 w-full max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-6 flex flex-col h-full animate-fade-in" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
              {/* Image skeleton with shimmer */}
              <div className="relative w-full h-40 rounded-xl mb-4 flex-shrink-0 overflow-hidden">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-2 mb-4 flex-grow">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              
              {/* Price and button skeleton */}
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Skeleton
export function CTASkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="gradient-hero rounded-3xl p-12 lg:p-16 text-center">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-full max-w-xl mx-auto" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Complete Landing Page Skeleton with stagger animation
export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl animate-fade-in" />
            <Skeleton className="h-5 w-24 animate-fade-in" style={{ animationDelay: '0.1s' }} />
          </div>
          
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16 animate-fade-in" style={{ animationDelay: '0.2s' }} />
            <Skeleton className="h-8 w-20 animate-fade-in" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </header>

      {/* Section skeletons with stagger */}
      <div className="pt-16">
        <HeroSkeleton />
        <AboutSkeleton />
        <BenefitsSkeleton />
        <ProductsSkeleton />
        <CTASkeleton />
      </div>
    </div>
  );
}

// Loading overlay for entire page
export function PageLoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <LandingSkeleton />
    </div>
  );
}

export { Skeleton };
