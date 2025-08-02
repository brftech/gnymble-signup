// Shared configuration for InteractivePhone components
export const phoneConfig = {
  // Default settings for all phones
  default: {
    size: "md" as const,
    interactive: true,
    autoPlay: true,
    theme: "dark" as const,
  },
  
  // Hero section phone settings
  hero: {
    size: "md" as const,
    interactive: true,
    autoPlay: true,
    theme: "dark" as const,
    className: "mt-8 lg:mt-0",
  },
  
  // Use cases section phone settings
  useCases: {
    size: "md" as const,
    interactive: true,
    autoPlay: true,
    theme: "dark" as const,
    className: "",
  },
  
  // Demo/static phone settings
  demo: {
    size: "md" as const,
    interactive: false,
    autoPlay: true,
    theme: "dark" as const,
    className: "",
  },
};

// Predefined scenarios for consistent messaging
export const phoneScenarios = {
  healthcare: {
    id: 1,
    title: "Healthcare",
    description: "HIPAA-compliant patient communications",
    brandColor: "#10B981",
    businessName: "Dr. Johnson's Office",
    messages: [
      {
        id: 1,
        text: "Hi Sarah, this is Dr. Johnson's office. Your appointment is confirmed for tomorrow at 2:00 PM. Reply STOP to opt out.",
        sender: "business" as const,
        timestamp: "12:15 PM",
        businessName: "Dr. Johnson's Office",
        avatar: "🏥",
      },
      {
        id: 2,
        text: "Thank you for the confirmation!",
        sender: "user" as const,
        timestamp: "12:16 PM",
        avatar: "👤",
      },
    ],
  },
  
  premiumEvent: {
    id: 2,
    title: "Premium Event",
    description: "Age-gated luxury experiences",
    brandColor: "#F97316",
    businessName: "Gnymble Cigars",
    messages: [
      {
        id: 1,
        text: "Exclusive Drew Estate tasting event Saturday 7PM. Only 20 spots available. Age verification required. RSVP now.",
        sender: "business" as const,
        timestamp: "11:45 AM",
        businessName: "Gnymble Cigars",
        avatar: "🚬",
      },
      {
        id: 2,
        text: "Count me in! Looking forward to it.",
        sender: "user" as const,
        timestamp: "11:47 AM",
        avatar: "👤",
      },
    ],
  },
  
  compliance: {
    id: 3,
    title: "Compliance",
    description: "Real-time regulatory monitoring",
    brandColor: "#3B82F6",
    businessName: "PercyTech Compliance",
    messages: [
      {
        id: 1,
        text: "Compliance Check: All messages this month 100% compliant. Campaign Registry status: Approved. Next audit: Automated.",
        sender: "business" as const,
        timestamp: "10:30 AM",
        businessName: "PercyTech Compliance",
        avatar: "✅",
      },
    ],
  },
}; 