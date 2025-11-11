import React from 'react';
import { FacebookIcon, TwitterIcon, LinkedInIcon } from './icons.tsx';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-primary py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-neutral-200 order-2 sm:order-1 mt-4 sm:mt-0">
          © 2025, Zamzam Bank Project Management Office
        </p>
        <div className="flex space-x-6 order-1 sm:order-2">
            <a href="#" className="text-neutral-200 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-neutral-200 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-neutral-200 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <LinkedInIcon className="h-6 w-6" />
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;