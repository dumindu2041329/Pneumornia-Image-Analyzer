import { useState } from 'react';
import { Activity, Shield, Zap, Brain, Users, CheckCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AuthForm } from './AuthForm';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced deep learning algorithms for accurate pneumonia detection from chest X-rays'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get analysis results in seconds with detailed confidence metrics'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and protected with enterprise-grade security'
    },
    {
      icon: Activity,
      title: 'Real-time Processing',
      description: 'Lightning-fast image processing powered by TensorFlow.js'
    },
    {
      icon: Users,
      title: 'Clinical Support',
      description: 'Designed to assist healthcare professionals in making informed decisions'
    },
    {
      icon: CheckCircle,
      title: 'High Accuracy',
      description: 'Trained on thousands of verified chest X-ray images for reliable predictions'
    }
  ];

  const stats = [
    { value: '95%+', label: 'Accuracy Rate' },
    { value: '<3s', label: 'Average Analysis Time' },
    { value: '10K+', label: 'Images Analyzed' },
    { value: '500+', label: 'Medical Professionals' }
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40" />

        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-6 left-6 z-50 px-6 py-2 glass-button text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
        >
          ← Back
        </button>

        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-50 p-3 glass-button text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative z-10 w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-10">
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl glass-card">
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">MediScan AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-3 glass-button text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2.5 glass-button text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6">
          <section className="py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block mb-6 px-4 py-2 glass-card text-sm font-medium text-blue-600 dark:text-blue-400">
                AI-Powered Medical Imaging
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                Detect Pneumonia with AI Precision
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                Advanced deep learning technology for rapid and accurate pneumonia detection from chest X-rays.
                Empowering healthcare professionals with instant, reliable diagnostic support.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
                >
                  Start Free Analysis
                </button>
                <button className="w-full sm:w-auto px-8 py-4 glass-button text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 font-semibold text-lg">
                  Watch Demo
                </button>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Cutting-edge technology designed to support medical professionals in their diagnostic workflow
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card p-8 hover:scale-105 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-fit mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-20">
            <div className="glass-card p-12 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare professionals using MediScan AI for accurate pneumonia detection
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                Create Free Account
              </button>
            </div>
          </section>
        </main>

        <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-slate-800 dark:text-white">MediScan AI</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © 2025 MediScan AI. For medical professional use only.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
