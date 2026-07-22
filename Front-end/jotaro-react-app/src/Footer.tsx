import React from 'react';

const Footer: React.FC = () => {
    return (
    <footer className="bg-slate-900 relative text-gray-300 text-sm pt-10 pb-6 dark:bg-slate-100 dark:text-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 space-y-8 relative">

        {/* 🌐 Social Media Icons */}
        <div className="flex justify-center gap-5 text-white text-lg dark:text-black">
          <a href="#" aria-label="Facebook" className="hover:bg-blue-600 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="#" aria-label="X / Twitter" className="hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-x"></i>
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:bg-blue-500 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
          <a href="#" aria-label="Instagram" className="hover:bg-purple-500 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="#" aria-label="YouTube" className="hover:bg-red-600 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-youtube"></i>
          </a>
          <a href="#" aria-label="Pinterest" className="hover:bg-red-500 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-pinterest-p"></i>
          </a>
        </div>

      
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-center font-medium">
          {[
            'About us', 'Careers', 'Accessibility', 'Feedback', 'Media room',
            'Ad Choices', 'Advertise with us', 'Agent support', 'Privacy', 'Terms'
          ].map((text) => (
            <a
              key={text}
              href="#"
              className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors duration-300"
            >
              {text}
            </a>
          ))}
          <a
            href="#"
            className="text-blue-400 font-semibold hover:text-blue-500 dark:text-blue-600 dark:hover:text-blue-700 transition-colors duration-300"
          >
            Do Not Sell or Share My Personal Information
          </a>
        </div>

        {/* 📱 App Store Buttons */}
        <div className="text-center">
          <p className="font-bold mb-4">Get the app</p>
          <div className="flex justify-center gap-4">
            <a href="#">
              <img src="/available-on-the-app-store.svg" alt="App Store" className="h-10 hover:opacity-80 transition" />
            </a>
            <a href="#">
              <img src="/google-play-badge-2022-2.svg" alt="Google Play" className="h-10 hover:opacity-80 transition" />
            </a>
          </div>
        </div>

        {/* 🧱 Products & Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-bold dark:text-black text-white mb-2">Products</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Leads & Branding', 'ListHub', 'Moving.com', 'International Properties', 'Avail', 'UpNest', 'Builder Solutions'].map((item) => (
                <a key={item} href="#" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold dark:text-black text-white mb-2">News Corp</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Barrons', 'MarketWatch', 'Wall Street Journal', 'New York Post', 'Mansion Global', 'REA Group'].map((item) => (
                <a key={item} href="#" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold dark:text-black text-white mb-2">More from us</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['PropTiger.com', 'Housing.com', 'News UK', 'News Corp Australia'].map((item) => (
                <a key={item} href="#" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>
        </div>

        {/* ⚖️ Disclaimer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-700 dark:border-gray-300 pt-4">
          <p>
            Any mortgage lead generation activity in Connecticut is performed by MSTM, LLC (NMLS #1212192), a subsidiary of Move, Inc.
          </p>
          <p className="mt-1">
            &copy; 2026 <a href="#" className="underline text-gray-400 hover:text-blue-400 dark:text-gray-700 dark:hover:text-blue-600 transition-colors duration-300">DwellUP</a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;