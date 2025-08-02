interface FooterProps {
  brand?: "percytech" | "gnymble" | "percymd" | "percytext";
  variant?: "default" | "minimal" | "full";
  className?: string;
}

interface BrandConfig {
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  links: {
    title: string;
    items: { label: string; href: string }[];
  }[];
  socialLinks: { platform: string; href: string; icon: string }[];
}

const brandConfigs: Record<string, BrandConfig> = {
  percytech: {
    name: "PercyTech",
    tagline: "Building the future of regulated communications",
    primaryColor: "bg-blue-600",
    secondaryColor: "bg-blue-700",
    links: [
      {
        title: "Products",
        items: [
          { label: "Gnymble", href: "https://gnymble.percytech.com" },
          { label: "PercyMD", href: "https://percymd.percytech.com" },
          { label: "PercyText", href: "https://percytext.percytech.com" },
        ],
      },
      {
        title: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Support",
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "API Reference", href: "/api" },
          { label: "Status", href: "/status" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com/percytech", icon: "🐦" },
      { platform: "LinkedIn", href: "https://linkedin.com/company/percytech", icon: "💼" },
      { platform: "GitHub", href: "https://github.com/percytech", icon: "📚" },
    ],
  },
  gnymble: {
    name: "Gnymble",
    tagline: "Premium SMS for hospitality & retail",
    primaryColor: "bg-black",
    secondaryColor: "bg-gray-900",
    links: [
      {
        title: "Platform",
        items: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Compliance", href: "/compliance" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "API", href: "/api" },
          { label: "Support", href: "/support" },
        ],
      },
      {
        title: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy", href: "/privacy" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com/gnymble", icon: "🐦" },
      { platform: "LinkedIn", href: "https://linkedin.com/company/gnymble", icon: "💼" },
    ],
  },
  percymd: {
    name: "PercyMD",
    tagline: "HIPAA-compliant healthcare communications",
    primaryColor: "bg-green-600",
    secondaryColor: "bg-green-700",
    links: [
      {
        title: "Healthcare",
        items: [
          { label: "HIPAA Compliance", href: "/hipaa" },
          { label: "EHR Integration", href: "/ehr" },
          { label: "Patient Portal", href: "/portal" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "API", href: "/api" },
          { label: "Support", href: "/support" },
        ],
      },
      {
        title: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy", href: "/privacy" },
        ],
      },
    ],
    socialLinks: [
      { platform: "LinkedIn", href: "https://linkedin.com/company/percymd", icon: "💼" },
    ],
  },
  percytext: {
    name: "PercyText",
    tagline: "Regulated messaging for all industries",
    primaryColor: "bg-orange-600",
    secondaryColor: "bg-orange-700",
    links: [
      {
        title: "Platform",
        items: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Compliance", href: "/compliance" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "API", href: "/api" },
          { label: "Support", href: "/support" },
        ],
      },
      {
        title: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy", href: "/privacy" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com/percytext", icon: "🐦" },
      { platform: "LinkedIn", href: "https://linkedin.com/company/percytext", icon: "💼" },
    ],
  },
};

export default function Footer({ 
  brand = "gnymble", 
  variant = "default",
  className = "" 
}: FooterProps) {
  const config = brandConfigs[brand];

  if (variant === "minimal") {
    return (
      <footer className={`${config.primaryColor} text-white py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">{config.name}</h3>
              <p className="text-sm opacity-80">{config.tagline}</p>
            </div>
            <div className="flex space-x-6">
              {config.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/20 text-center text-sm opacity-80">
            <p>&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`${config.primaryColor} text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">{config.name}</h3>
            <p className="text-lg opacity-90 mb-6">{config.tagline}</p>
            <div className="flex space-x-4">
              {config.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {config.links.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm text-white/80 hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-white/80 hover:text-white">
                Terms of Service
              </a>
              <a href="/cookies" className="text-sm text-white/80 hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 