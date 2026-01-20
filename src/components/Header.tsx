import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/spring-bank-logo.png"
            alt="Spring Bank"
            className="h-10 w-auto"
          />
        </div>
        <div className="text-right">
          <span className="text-sm text-spring-gray-light">
            Building Retrofit Loan Analyzer
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
