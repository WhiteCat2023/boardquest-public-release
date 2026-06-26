import React from 'react';
import { Activity, Shield, Zap, ArrowRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#800000] selection:text-white overflow-x-hidden">
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
      <nav className="flex items-center justify-between px-8 py-6 md:px-16 lg:px-24 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-[#800000]" />
          <span className="text-xl font-bold tracking-tight">MedTech Innova</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-[#800000] transition-colors">Features</a>
          <a href="#about" className="hover:text-[#800000] transition-colors">About Us</a>
          <a href="#solutions" className="hover:text-[#800000] transition-colors">Solutions</a>
        </div>
        <div>
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-black hover:bg-[#800000] rounded-full transition-all duration-300">
            Client Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 md:px-16 lg:px-24 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 -z-20 bg-black">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-15">
            <source src="https://cdn.pixabay.com/video/2020/03/19/33947-399943501_tiny.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-white/80 to-white backdrop-blur-[2px]"></div>

        <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-800 mb-8 border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></span>
          Next-Generation Healthcare Technology
        </div>
        
        <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Precision medicine, powered by <span className="text-[#800000]">intelligence.</span>
        </h1>
        
        <p className="animate-fade-up delay-200 text-lg md:text-xl text-gray-600 max-w-2xl mb-12">
          Empowering medical professionals with cutting-edge tools for faster diagnosis, secure data management, and better patient outcomes.
        </p>
        
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4">
          <Link to="/login" className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#800000] hover:bg-black rounded-full transition-all duration-300 group">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-semibold text-black bg-white border border-gray-200 hover:border-gray-900 rounded-full transition-all duration-300">
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 md:px-16 lg:px-24 py-24 bg-black text-white">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Advanced solutions for modern healthcare.</h2>
          <p className="text-gray-400 text-lg">We bridge the gap between complex medical data and actionable clinical insights through minimalist, powerful design.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="animate-fade-up delay-100 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#800000] transition-colors duration-300 group cursor-default">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-[#800000]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Diagnostics</h3>
            <p className="text-gray-400 leading-relaxed">
              Process vital data instantaneously with industry-leading accuracy and automated alert systems.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="animate-fade-up delay-200 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#800000] transition-colors duration-300 group cursor-default">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-[#800000]" />
            </div>
            <h3 className="text-xl font-bold mb-3">HIPAA Compliant</h3>
            <p className="text-gray-400 leading-relaxed">
              Enterprise-grade security protocols ensuring absolute confidentiality for all patient records.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="animate-fade-up delay-300 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#800000] transition-colors duration-300 group cursor-default">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#800000]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seamless Integration</h3>
            <p className="text-gray-400 leading-relaxed">
              Plug and play infrastructure that integrates effortlessly with existing hospital systems.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-8 md:px-16 lg:px-24 py-24 bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="animate-fade-up flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by leading medical institutions globally.</h2>
            <p className="text-gray-600 text-lg">
              Our technology is designed with a singular focus: to strip away complexity so you can focus entirely on patient care. Minimalist interface, maximum impact.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt={`Doctor ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Joined by 10,000+ professionals
              </div>
            </div>
          </div>
          <div className="animate-fade-up delay-200 flex-1 relative w-full">
            <div className="absolute inset-0 bg-[#800000]/5 rounded-3xl transform rotate-3"></div>
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl relative shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                   <Stethoscope className="w-6 h-6 text-[#800000]" />
                 </div>
                 <div>
                   <h4 className="font-bold">System Status</h4>
                   <p className="text-sm text-green-600 font-medium">All systems operational</p>
                 </div>
               </div>
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-[#800000] rounded-full" style={{ width: `${85 - (i * 10)}%` }}></div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 lg:px-24 py-12 border-t border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#800000]" />
            <span className="text-lg font-bold">MedTech Innova</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} MedTech Innova. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-[#800000] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#800000] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#800000] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;