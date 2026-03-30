import { BookOpen, Github, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    company: ['About Us', 'Jobs', 'Press', 'Contact Us'],
    help: ['FAQ', 'Help Center', 'Account', 'Media Center'],
    legal: ['Privacy', 'Terms of Use', 'Cookie Preferences', 'Corporate Information'],
    partners: ['MIT', 'Stanford', 'Yale', 'Harvard'],
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {/* Social Links */}
        <div className="flex items-center gap-4 mb-8">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Youtube className="w-6 h-6" />
          </a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-gray-400 uppercase text-xs tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-600" />
            <span className="text-lg font-bold text-white">
              Edu<span className="text-red-600">Stream</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} EduStream. All rights reserved.
            Premium educational content from world-class universities.
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="px-2 py-1 bg-white/5 rounded">4K Ultra HD</span>
            <span className="px-2 py-1 bg-white/5 rounded">Dolby Atmos</span>
            <span className="px-2 py-1 bg-white/5 rounded">HDR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
