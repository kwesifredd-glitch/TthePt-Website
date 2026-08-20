import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Dumbbell } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/10">
            <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="md:col-span-2 space-y-6">
                    <Link href="/" className="inline-flex flex-col leading-none group w-fit">
                        <span className="text-3xl md:text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">
                            Tthe<span className="text-primary italic group-hover:text-white transition-colors">PT</span>
                        </span>
                        <span className="text-[10px] font-black italic tracking-[0.15em] text-primary mt-1 uppercase">
                            PERSONAL TRAINER
                        </span>
                    </Link>
                    <p className="text-gray-400 text-lg max-w-sm font-medium leading-relaxed">
                        Redefining human potential through elite physical conditioning and mental fortitude.
                        No shortcuts. Just science and sweat.
                    </p>
                    <div className="flex space-x-4">
                        {[
                            {
                                Icon: Instagram,
                                href: "https://www.instagram.com/_tthept__?igsh=MzdjbmM2aGlnbnQ4"
                            },
                            {
                                Icon: ({ className }: { className?: string }) => (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={className}
                                    >
                                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                    </svg>
                                ),
                                href: "https://www.tiktok.com/@tthept"
                            },
                            { Icon: Twitter, href: "#" },
                            { Icon: Facebook, href: "#" }
                        ].map(({ Icon, href }, idx) => (
                            <a
                                key={idx}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
                            >
                                <Icon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-8">Navigation</h4>
                    <ul className="space-y-4 font-bold text-gray-400 tracking-wide uppercase text-xs">
                        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link href="/about" className="hover:text-white transition-colors">The Method</Link></li>
                        <li><Link href="/meal-plans" className="hover:text-white transition-colors">Fuel & Training</Link></li>
                        <li><Link href="/booking" className="hover:text-white transition-colors">Apply Now</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Direct Contact</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-8">Headquarters</h4>
                    <ul className="space-y-6 text-gray-400 font-medium">
                        <li className="flex items-start space-x-4">
                            <MapPin className="h-5 w-5 text-primary shrink-0" />
                            <span>123 Elite Plaza, <br />London, UK</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <Phone className="h-5 w-5 text-primary shrink-0" />
                            <span>+44 20 7123 4567</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                            <span>elite@thept.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="container-custom">
                <div className="border-t border-white/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-600 tracking-widest uppercase">
                    <p>&copy; {new Date().getFullYear()} TthePT. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

