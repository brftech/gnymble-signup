import { Link } from "react-router-dom";
import InteractivePhone from "../components/shared/InteractivePhone";
import Footer from "../components/shared/Footer";
import SimpleNavigation from "../components/SimpleNavigation";
import { phoneConfig, phoneScenarios } from "../components/shared/phoneConfig";

export default function InteractivePhonePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Premium SMS for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-orange-600">
                    Hospitality & Retail
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Gnymble delivers luxury SMS experiences with complete
                  regulatory compliance. From exclusive events to VIP customer
                  management, we handle the complex so you can focus on your
                  guests.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-orange-400 text-orange-400 font-semibold rounded-lg hover:bg-orange-400 hover:text-black transition-all duration-200">
                  Watch Demo
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>TCR Registered</span>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Phone */}
            <div
              className={`flex justify-center lg:justify-end ${phoneConfig.hero.className}`}
            >
              <InteractivePhone
                brand="gnymble"
                size={phoneConfig.hero.size}
                interactive={phoneConfig.hero.interactive}
                autoPlay={phoneConfig.hero.autoPlay}
                theme={phoneConfig.hero.theme}
              />
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Premium Experiences
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From exclusive events to VIP customer management, Gnymble handles
              the complex regulatory requirements so you can focus on delivering
              exceptional experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Age Verification
              </h3>
              <p className="text-gray-300">
                Automatic age verification for premium retail and hospitality.
                Compliant with all state and federal regulations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                VIP Management
              </h3>
              <p className="text-gray-300">
                Exclusive customer segmentation and personalized messaging.
                Build loyalty with targeted VIP experiences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Analytics & Insights
              </h3>
              <p className="text-gray-300">
                Real-time analytics and customer insights. Track engagement,
                conversion rates, and ROI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Perfect for Premium Retail & Hospitality
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From luxury boutiques to exclusive clubs, Gnymble powers premium
              customer experiences with complete regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Use Cases */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Exclusive Events
                    </h3>
                    <p className="text-gray-300">
                      Invite-only tastings, VIP parties, and premium
                      experiences. Age verification and RSVP management
                      included.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Luxury Retail
                    </h3>
                    <p className="text-gray-300">
                      Private sales, exclusive collections, and personalized
                      shopping experiences. Build customer loyalty with targeted
                      messaging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Premium Hospitality
                    </h3>
                    <p className="text-gray-300">
                      High-end restaurants, exclusive clubs, and luxury hotels.
                      VIP reservations and personalized guest experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 via-purple-600/10 to-orange-700/20 rounded-xl p-6 border border-orange-500/30">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Regulatory Compliance
                </h4>
                <p className="text-gray-300 text-sm">
                  All messages are automatically screened for TCPA, CAN-SPAM,
                  and industry-specific regulations. Full audit trail and
                  compliance reporting included.
                </p>
              </div>
            </div>

            {/* Right - Interactive Phone */}
            <div
              className={`flex justify-center ${phoneConfig.useCases.className}`}
            >
              <InteractivePhone
                brand="gnymble"
                size={phoneConfig.useCases.size}
                interactive={phoneConfig.useCases.interactive}
                autoPlay={phoneConfig.useCases.autoPlay}
                theme={phoneConfig.useCases.theme}
                scenarios={[phoneScenarios.premiumEvent]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Elevate Your Customer Experience?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join luxury brands that trust Gnymble for their premium SMS
            communications. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Start Free Trial
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer brand="gnymble" />
    </div>
  );
} 