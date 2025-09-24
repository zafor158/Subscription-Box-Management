import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Curated Selection",
      description: "Each box is carefully curated by our experts to bring you the best products and experiences."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Free Shipping",
      description: "Enjoy free shipping on all subscription boxes. No hidden fees, no surprises."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Cancel Anytime",
      description: "No long-term commitments. Cancel or pause your subscription anytime with just one click."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Your Plan",
      description: "Select from our Basic, Premium, or Deluxe subscription plans that fit your lifestyle."
    },
    {
      number: 2,
      title: "Get Curated Boxes",
      description: "Receive your monthly box filled with handpicked products tailored to your preferences."
    },
    {
      number: 3,
      title: "Enjoy & Discover",
      description: "Unbox your treasures, discover new favorites, and enjoy the surprise every month."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Discover Amazing</span>{' '}
                  <span className="block text-indigo-600 xl:inline">Products Monthly</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join thousands of happy subscribers who receive carefully curated boxes 
                  filled with premium products delivered right to their doorstep.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {user ? (
                      <Link
                        to="/dashboard"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Start Your Journey
                      </Link>
                    )}
                  </div>
                  {!user && (
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/plans"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        View Plans
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-8xl mb-4">📦</div>
              <p className="text-xl font-semibold">Your Next Surprise Awaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose BoxCraft?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We're committed to delivering exceptional value and experiences with every box.
            </p>
          </div>

          <div className="mt-16">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Getting started is simple. Follow these three easy steps.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-indigo-600 rounded-full">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">10K+</p>
              <p className="mt-2 text-base text-indigo-200">Happy Subscribers</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">500+</p>
              <p className="mt-2 text-base text-indigo-200">Premium Products</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">50+</p>
              <p className="mt-2 text-base text-indigo-200">Partner Brands</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">98%</p>
              <p className="mt-2 text-base text-indigo-200">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                quote: "BoxCraft has completely changed how I discover new products. Every month is a delightful surprise!",
                author: "Sarah Johnson",
                role: "Premium Subscriber"
              },
              {
                quote: "The quality of products is outstanding. I've discovered so many brands I never knew existed.",
                author: "Michael Chen",
                role: "Deluxe Subscriber"
              },
              {
                quote: "Perfect for gift-giving to myself! The curation is spot-on and shipping is always on time.",
                author: "Emma Davis",
                role: "Basic Subscriber"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-4">"{testimonial.quote}"</blockquote>
                <div>
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to Start Your Journey?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of satisfied subscribers and discover amazing products every month.
          </p>
          {!user && (
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto transition-colors"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;