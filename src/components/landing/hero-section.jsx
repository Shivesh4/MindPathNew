import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative py-28 sm:py-40">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-transparent to-secondary/20"
      ></div>
      <div className="container text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Your Path to <span className="text-primary-foreground bg-primary rounded-md px-2">Smarter Learning</span> Starts Here
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
          AI-powered tutoring, study planning, and personalized learning guidance—all in one platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto text-lg transition-transform transform hover:scale-105" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg transition-transform transform hover:scale-105">Learn More</Button>
        </div>
      </div>
    </section>
  );
}
