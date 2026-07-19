import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Menu, X } from 'lucide-react'; // for clean icons
import CreditCardModal from "./CreditCardModal";


interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode, user }) => {
 
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  return (
    <>
      <nav className="bg-opacity-90 dark:bg-opacity-90 fixed top-0 w-full z-50 flex justify-between items-center p-4 shadow-md dark:shadow-gray-300 bg-white dark:bg-gray-800 transition-colors duration-300">
  {/* Logo */}
  <button onClick={() => (window.location.href = '/home')}>
    <img
      src="/logo.png"
      alt="DwellUP Logo Light"
      className="h-[50px] w-auto block dark:hidden"
    />
    <img
      src="/dwell2.png"
      alt="DwellUP Logo Dark"
      className="h-[50px] w-auto hidden dark:block"
    />
  </button>

  {/* Desktop Menu */}
  <ul className="hidden md:flex space-x-6 text-sm font-medium">
    
    
 
    <li><a href="/userlist" className="hover:text-blue-600">Users</a></li>
   
   
      <li><a href="/sell" className="hover:text-blue-600">Sell</a></li>
 
    
    <li className="relative">
  <a href="/conversations" className="hover:text-blue-600">
    Conversations
  </a>
</li>

 
    <li><a href="/appointments" className="hover:text-blue-600">Appointments</a></li>

    <li><a href="/account" className="hover:text-blue-600">Account</a></li>
    <li>
  <button
    onClick={() => setIsPaymentModalOpen(true)}
    className="hover:text-blue-600"
  >
    Payment & Billing
  </button>
</li>

  </ul>

  {/* Right Section */}
  <div className="flex items-center space-x-2">
    {/* Dark Mode Switch */}
    <button
      onClick={toggleDarkMode}
      className="relative w-[100px] h-9 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-500 focus:outline-none flex items-center justify-center"
    >
      <span
        className={`absolute z-10 text-[14px] font-medium transition-all duration-500 ${
          darkMode ? "text-white right-10 mt-[2px]" : "text-gray-800 right-[7px] mt-[2px]"
        }`}
      >
        {darkMode ? "🌙 Dark" : "Light ☀️"}
      </span>
      <div className="relative w-[100px] h-9 bg-slate-200 dark:bg-gray-700 rounded-full">
        <div
          className={`absolute top-0.5 mt-[5px] left-0.5 w-5 h-5 rounded-full shadow-md dark:bg-white dark:ring-2 dark:ring-black bg-yellow-100 ring-2 ring-amber-200 transform transition-transform duration-500 ${
            darkMode ? "translate-x-[68px]" : "translate-x-[6px]"
          }`}
        />
      </div>
    </button>

    {/* Logout */}
    <button
      className="text-sm font-medium bg-blue-600 h-9 text-white px-4 rounded-full hover:bg-rose-600 transition-all duration-700"
      onClick={() => {
        localStorage.removeItem('userType');
        localStorage.removeItem('user');

        const logoutToastId = toast.loading('Logging out!');
        setTimeout(() => {
          toast.update(logoutToastId, {
            render: 'Logged out!',
            type: 'info',
            isLoading: false,
            autoClose: 1400,
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }, 1400);
      }}
    >
      🏃🚪Log out
    </button>

    {/* Hamburger Button */}
    <button
      className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      {menuOpen ? (
        <X className="text-gray-700 dark:text-gray-200" />
      ) : (
        <Menu className="text-gray-700 dark:text-gray-200" />
      )}
    </button>
  </div>
</nav>


      <CreditCardModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        darkMode={darkMode}
      />

    </>
  );
};

export default Navbar;
