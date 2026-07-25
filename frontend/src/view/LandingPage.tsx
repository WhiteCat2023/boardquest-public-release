import { Activity, Shield, Zap, ArrowRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 md:px-16 lg:px-24 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">BoardQuest Review</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-primary transition-colors">About Us</a>
          <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
        </div>
        <div>
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-300 shadow-xs">
            Client Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 md:px-16 lg:px-24 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 -z-20 bg-background">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-10">
            <source src="https://cdn.pixabay.com/video/2020/03/19/33947-399943501_tiny.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/90 via-background/80 to-background backdrop-blur-[2px]"></div>

        <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-8 border border-border">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Next-Generation Licensure Review Platform
        </div>
        
        <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6 text-foreground">
          Precision review, powered by <span className="text-primary">intelligence.</span>
        </h1>
        
        <p className="animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Empowering medical technology professionals with cutting-edge tools for item evaluation, performance tracking, and board exam mastery.
        </p>
        
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4">
          <Link to="/login" className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-300 group shadow-xs">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-semibold text-foreground bg-card border border-border hover:border-primary/40 rounded-full transition-all duration-300">
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 md:px-16 lg:px-24 py-24 bg-card border-y border-border text-foreground">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Advanced solutions for modern licensure prep.</h2>
          <p className="text-muted-foreground text-lg">We bridge the gap between question bank authoring and actionable student performance analytics through modern, powerful design.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-background border border-border transition-all duration-300 hover:border-primary/40">
            <Zap className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3 text-foreground">Real-time Analytics</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Instant evaluation metrics and proficiency benchmarking across all major board subjects.</p>
          </div>

          <div className="p-8 rounded-3xl bg-background border border-border transition-all duration-300 hover:border-primary/40">
            <Shield className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3 text-foreground">Secure Verification</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Multi-level authorization profiles for teachers, co-admins, and institutional partners.</p>
          </div>

          <div className="p-8 rounded-3xl bg-background border border-border transition-all duration-300 hover:border-primary/40">
            <Stethoscope className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3 text-foreground">Curriculum Alignment</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Categorized item banks mapped directly to PRC Medical Technology licensure standards.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 lg:px-24 py-12 border-t border-border bg-card">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-base font-bold tracking-tight text-foreground">BoardQuest Review Platform</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BoardQuest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;