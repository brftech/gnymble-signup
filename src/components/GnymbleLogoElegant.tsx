import React from "react";

interface GnymbleLogoElegantProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "inverted" | "minimal";
}

const GnymbleLogoElegant: React.FC<GnymbleLogoElegantProps> = ({
  size = "md",
  className = "",
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const baseStyles = `
    font-sans select-none font-extrabold tracking-tight
    ${sizeClasses[size]} ${className}
  `;

  const gStyles = `
    text-[#CC5500] font-black tracking-[-0.02em]
    drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]
    relative
  `;

  const nymbleStyles = `
    text-white font-bold tracking-[0.05em]
    drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]
    relative
  `;

  const invertedGStyles = `
    text-[#CC5500] font-black tracking-[-0.02em]
    drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]
    relative
  `;

  const invertedNymbleStyles = `
    text-black font-bold tracking-[0.05em]
    drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]
    relative
  `;

  const minimalGStyles = `
    text-[#CC5500] font-extrabold tracking-[-0.03em]
    relative
  `;

  const minimalNymbleStyles = `
    text-white font-extrabold tracking-[-0.01em]
    relative
  `;

  const getStyles = () => {
    switch (variant) {
      case "inverted":
        return {
          g: invertedGStyles,
          nymble: invertedNymbleStyles,
        };
      case "minimal":
        return {
          g: minimalGStyles,
          nymble: minimalNymbleStyles,
        };
      default:
        return {
          g: gStyles,
          nymble: nymbleStyles,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={baseStyles}>
      <span className={styles.g}>G</span>
      <span className={styles.nymble}>nymble</span>
    </div>
  );
};

export default GnymbleLogoElegant; 