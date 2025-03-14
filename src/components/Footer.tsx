import { RandomFact } from "./RandomFact";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">
              Your trusted source for property search and market analysis.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/terms" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/disclaimer" className="hover:text-white">
                  Legal Disclaimer
                </a>
              </li>
              <li>
                <a href="/gdpr" className="hover:text-white">
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>info@myvge.com</li>
              <li>Lytchett House, 13 Freeland Park, Poole, Dorset, England, BH16 6FA</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Compliance</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Company No: 15271126</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 space-y-4">
          <RandomFact />
          <div className="text-center text-gray-400 space-y-2">
            <p className="text-xs">
              MyVGE is registered in England and Wales. Registered office: Lytchett House, 13 Freeland Park, Poole, Dorset, England, BH16 6FA. Company No: 15271126
            </p>
            <p className="text-xs">
              The information on this website is for general information
              purposes only and does not constitute financial advice.
            </p>
            <p>&copy; {new Date().getFullYear()} MyVGE. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
