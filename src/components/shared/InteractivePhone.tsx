import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "business";
  timestamp: string;
  businessName?: string;
  avatar?: string;
}

interface Scenario {
  id: number;
  title: string;
  description?: string;
  messages: Message[];
  brandColor?: string;
  businessName?: string;
}

interface InteractivePhoneProps {
  brand?: "gnymble" | "percymd" | "percytext" | "percytech";
  scenarios?: Scenario[];
  autoPlay?: boolean;
  interactive?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
}

const defaultScenarios: Scenario[] = [
  {
    id: 1,
    title: "Healthcare",
    description: "HIPAA-compliant patient communications",
    brandColor: "#10B981",
    businessName: "Dr. Johnson's Office",
    messages: [
      {
        id: 1,
        text: "Hi Sarah, this is Dr. Johnson's office. Your appointment is confirmed for tomorrow at 2:00 PM. Reply STOP to opt out.",
        sender: "business",
        timestamp: "12:15 PM",
        businessName: "Dr. Johnson's Office",
        avatar: "🏥",
      },
      {
        id: 2,
        text: "Thank you for the confirmation!",
        sender: "user",
        timestamp: "12:16 PM",
        avatar: "👤",
      },
    ],
  },
  {
    id: 2,
    title: "Premium Retail",
    description: "Age-gated luxury experiences",
    brandColor: "#8B5CF6",
    businessName: "Gnymble Cigars",
    messages: [
      {
        id: 1,
        text: "Exclusive Drew Estate tasting event Saturday 7PM. Only 20 spots available. Age verification required. RSVP now.",
        sender: "business",
        timestamp: "11:45 AM",
        businessName: "Gnymble Cigars",
        avatar: "🚬",
      },
      {
        id: 2,
        text: "Count me in! Looking forward to it.",
        sender: "user",
        timestamp: "11:47 AM",
        avatar: "👤",
      },
    ],
  },
  {
    id: 3,
    title: "Compliance",
    description: "Real-time regulatory monitoring",
    brandColor: "#3B82F6",
    businessName: "PercyTech Compliance",
    messages: [
      {
        id: 1,
        text: "Compliance Check: All messages this month 100% compliant. Campaign Registry status: Approved. Next audit: Automated.",
        sender: "business",
        timestamp: "10:30 AM",
        businessName: "PercyTech Compliance",
        avatar: "✅",
      },
    ],
  },
];

// Enhanced stock responses with better categorization
const stockResponses: Record<string, { text: string; category: string }> = {
  compliance: {
    text: "Our platform ensures 100% regulatory compliance across all messages. HIPAA, TCPA, and industry-specific requirements are automatically monitored and enforced.",
    category: "Platform",
  },
  hipaa: {
    text: "HIPAA compliance is built into our core platform. All healthcare communications include encryption, audit trails, and automatic privacy protection.",
    category: "Healthcare",
  },
  demo: {
    text: "I'd be happy to show you a live demo! Our platform handles both healthcare (Virtue) and premium retail (Vice) communications with complete regulatory oversight.",
    category: "Sales",
  },
  pricing: {
    text: "Our pricing scales with your needs. Enterprise plans start at $299/month and include unlimited compliance monitoring, dedicated support, and custom integrations.",
    category: "Pricing",
  },
  appointment: {
    text: "Yes, we handle appointment confirmations, reminders, and rescheduling automatically. Integration with major EHR systems included.",
    category: "Features",
  },
  premium: {
    text: "Our Vice platform specializes in age-gated premium experiences - from luxury retail to exclusive events. Age verification and VIP customer management included.",
    category: "Platform",
  },
  regulatory: {
    text: "We monitor 47 different regulatory requirements in real-time. Our system automatically flags potential violations before they're sent.",
    category: "Compliance",
  },
  integration: {
    text: "We integrate with major CRM, EHR, and e-commerce platforms. Custom API connections available for enterprise clients.",
    category: "Technical",
  },
  default: {
    text: "Thanks for your interest! I can tell you about compliance features, demo options, pricing, or specific use cases. What would you like to know?",
    category: "General",
  },
};

const placeholderTexts = [
  "Try typing something...",
  "Ask about compliance...",
  "Request information...",
  "Test the platform...",
  "Type 'demo' for details...",
  "Ask about pricing...",
  "Learn about HIPAA...",
  "See integrations...",
];

const brandConfigs = {
  gnymble: {
    primaryColor: "#F97316", // Orange-500
    secondaryColor: "#EA580C", // Orange-600
    name: "Gnymble",
    tagline: "Premium SMS for hospitality & retail",
  },
  percymd: {
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    name: "PercyMD",
    tagline: "HIPAA-compliant healthcare communications",
  },
  percytext: {
    primaryColor: "#F59E0B",
    secondaryColor: "#D97706",
    name: "PercyText",
    tagline: "Regulated messaging for all industries",
  },
  percytech: {
    primaryColor: "#3B82F6",
    secondaryColor: "#2563EB",
    name: "PercyTech",
    tagline: "Building the future of regulated communications",
  },
};

export default function InteractivePhone({
  brand = "gnymble",
  scenarios = defaultScenarios,
  autoPlay = true,
  interactive = true,
  className = "",
  size = "md",
  theme = "dark",
}: InteractivePhoneProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Interactive messaging state
  const [inputValue, setInputValue] = useState("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const brandConfig = brandConfigs[brand];

  // Size configurations
  const sizeConfigs = {
    sm: { width: "280px", height: "560px", fontSize: "14px" },
    md: { width: "320px", height: "640px", fontSize: "16px" },
    lg: { width: "360px", height: "720px", fontSize: "18px" },
  };

  const currentSize = sizeConfigs[size];

  // Cycle through placeholder texts
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scenario cycling (paused when user interacts)
  useEffect(() => {
    if (!autoPlay || isPaused || showResponse) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, showResponse, scenarios.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Handle user message submission
  const handleSendMessage = () => {
    if (!inputValue.trim() || !interactive) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      avatar: "👤",
    };

    setCurrentMessages([userMessage]);
    setShowResponse(true);
    setIsTyping(true);

    // Generate intelligent response based on keywords
    const lowerInput = inputValue.toLowerCase();
    let responseKey = "default";

    for (const key of Object.keys(stockResponses)) {
      if (key !== "default" && lowerInput.includes(key)) {
        responseKey = key;
        break;
      }
    }

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      const businessResponse: Message = {
        id: Date.now() + 1,
        text: stockResponses[responseKey].text,
        sender: "business",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        businessName: brandConfig.name,
        avatar: "💬",
      };

      setCurrentMessages([userMessage, businessResponse]);
    }, 1500 + Math.random() * 1000); // Random delay for realism

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const currentScenario = scenarios[currentScenarioIndex];
  const displayMessages = showResponse
    ? currentMessages
    : currentScenario.messages;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <style>
        {`
          @keyframes phonePivot {
            0%, 100% { transform: perspective(1000px) rotateX(-10deg) rotateY(-5deg); }
            50% { transform: perspective(1000px) rotateX(-10deg) rotateY(-15deg); }
          }
            
          .phone-wrapper {
            transform: rotateY(-15deg) rotateX(5deg) rotate(8deg);
            transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .phone-3d {
            animation: phonePivot 8s ease-in-out infinite;
            transform-style: preserve-3d;
          }
          
          .interactive-input {
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          
          .interactive-input:hover {
            border-color: ${brandConfig.primaryColor};
            box-shadow: 0 0 10px ${brandConfig.primaryColor}40;
          }
          
          .interactive-input:focus {
            border-color: ${brandConfig.primaryColor};
            box-shadow: 0 0 15px ${brandConfig.primaryColor}60;
          }
          
          .send-button {
            transition: all 0.2s ease;
          }
          
          .send-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px ${brandConfig.primaryColor}60;
          }

          .typing-indicator {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 50%;
            border-top-color: ${brandConfig.primaryColor};
            animation: spin 1s ease-in-out infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        className="relative phone-3d"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: currentSize.width,
          height: currentSize.height,
          background: theme === "dark" ? "#333333" : "#ffffff",
          borderRadius: "30px",
          border: `8px solid ${theme === "dark" ? "#333333" : "#e5e7eb"}`,
          boxShadow:
            theme === "dark"
              ? "0 20px 50px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.2)"
              : "0 20px 50px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Inner screen */}
        <div
          style={{
            width: `calc(${currentSize.width} - 16px)`,
            height: `calc(${currentSize.height} - 16px)`,
            background: theme === "dark" ? "#000000" : "#ffffff",
            borderRadius: "22px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              height: "44px",
              background: theme === "dark" ? "#000000" : "#ffffff",
              color: theme === "dark" ? "white" : "black",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              position: "relative",
              zIndex: 10,
              borderBottom:
                theme === "dark" ? "1px solid #333" : "1px solid #e5e7eb",
            }}
          >
            <span>{brandConfig.name}</span>
            <span>
              {new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "12px" }}>●●●</span>
              <span style={{ fontSize: "12px" }}>100%</span>
            </div>
          </div>

          {/* Messages area */}
          <div
            style={{
              height: `calc(${currentSize.height} - 16px - 44px - 44px)`,
              background: theme === "dark" ? "#1a1a1a" : "#f8fafc",
              padding: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                opacity: isTransitioning ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
              }}
            >
              {displayMessages.map((message) => (
                <div key={message.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        message.sender === "user" ? "flex-end" : "flex-start",
                      marginBottom: "4px",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {message.sender === "business" && message.avatar && (
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: brandConfig.primaryColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {message.avatar}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: "18px",
                        background:
                          message.sender === "user"
                            ? brandConfig.primaryColor
                            : theme === "dark"
                            ? "#333333"
                            : "#ffffff",
                        color:
                          message.sender === "user"
                            ? "white"
                            : theme === "dark"
                            ? "white"
                            : "black",
                        fontSize: currentSize.fontSize,
                        lineHeight: "1.4",
                        border:
                          message.sender === "business"
                            ? `1px solid ${
                                theme === "dark" ? "#444" : "#e5e7eb"
                              }`
                            : "none",
                      }}
                    >
                      {message.businessName &&
                        message.sender === "business" && (
                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.8,
                              marginBottom: "4px",
                              fontWeight: "600",
                              color: brandConfig.primaryColor,
                            }}
                          >
                            {message.businessName}
                          </div>
                        )}
                      {message.text}
                    </div>
                    {message.sender === "user" && message.avatar && (
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#007AFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {message.avatar}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        message.sender === "user" ? "flex-end" : "flex-start",
                      paddingLeft: message.sender === "user" ? "0" : "32px",
                      paddingRight: message.sender === "user" ? "32px" : "0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: theme === "dark" ? "#8E8E93" : "#6b7280",
                      }}
                    >
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: brandConfig.primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      marginRight: "8px",
                    }}
                  >
                    💬
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "18px",
                      background: theme === "dark" ? "#333333" : "#ffffff",
                      border: `1px solid ${
                        theme === "dark" ? "#444" : "#e5e7eb"
                      }`,
                    }}
                  >
                    <div className="typing-indicator"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Interactive text input area */}
          {interactive && (
            <div
              style={{
                height: "44px",
                background: theme === "dark" ? "#1a1a1a" : "#f8fafc",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: "8px",
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                borderTop:
                  theme === "dark" ? "1px solid #333" : "1px solid #e5e7eb",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholderTexts[placeholderIndex]}
                className="interactive-input"
                style={{
                  flex: 1,
                  height: "32px",
                  background: theme === "dark" ? "#333333" : "#ffffff",
                  borderRadius: "16px",
                  padding: "0 12px",
                  fontSize: currentSize.fontSize,
                  outline: "none",
                  border: `2px solid transparent`,
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="send-button"
                style={{
                  width: "32px",
                  height: "32px",
                  background: inputValue.trim()
                    ? brandConfig.primaryColor
                    : "#C7C7CC",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: inputValue.trim() ? "pointer" : "default",
                }}
              >
                ↑
              </button>
            </div>
          )}
        </div>

        {/* Scenario indicator */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background:
              theme === "dark" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "10px",
            fontWeight: "600",
            color: theme === "dark" ? "#333333" : "#ffffff",
            zIndex: 20,
          }}
        >
          {currentScenario.title}
        </div>
      </div>
    </div>
  );
}
