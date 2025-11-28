import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="dark bg-background text-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-full lg:col-span-1">
            <Link href="#" className="flex items-center gap-2 text-primary-foreground">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
              <span className="text-2xl font-bold">MindPath</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Smarter learning, simplified.</p>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-4 text-primary-foreground">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-4 text-primary-foreground">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">For Tutors</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">For Students</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-4 text-primary-foreground">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Status</Link></li>
            </ul>
          </div>
           <div className="text-sm">
            <h4 className="font-semibold mb-4 text-primary-foreground">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MindPath. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary-foreground transition-colors" />
            </Link>
            <Link href="#" aria-label="GitHub">
              <Github className="h-5 w-5 text-muted-foreground hover:text-primary-foreground transition-colors" />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary-foreground transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
