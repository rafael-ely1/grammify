import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Github, Linkedin } from 'lucide-react'

interface SocialLink {
  name: string
  href: string
  icon: React.ReactNode
}

const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/grammify',
    icon: <Twitter className="h-5 w-5" />
  },
  {
    name: 'GitHub',
    href: 'https://github.com/grammify',
    icon: <Github className="h-5 w-5" />
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/grammify',
    icon: <Linkedin className="h-5 w-5" />
  }
]

export function Footer() {
  return (
    <footer className="bg-muted/50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link to="/" className="text-xl font-bold">
              Company
            </Link>
            <p className="text-muted-foreground text-sm leading-6">
              Your company description here.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map(item => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Product</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/features" className="text-muted-foreground hover:text-foreground text-sm">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-muted-foreground hover:text-foreground text-sm">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Support</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/docs" className="text-muted-foreground hover:text-foreground text-sm">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Company</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-muted-foreground hover:text-foreground text-sm">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Legal</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Grammify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 