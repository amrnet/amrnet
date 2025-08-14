import './DNASpinner.css';

/**
 * DNA Helix Loading Spinner Component
 * 
 * A biologically-inspired loading spinner that resembles a DNA double helix
 * Perfect for AMR (Antimicrobial Resistance) applications
 */
export const DNASpinner = ({ 
  height = 60, 
  width = 60, 
  color = "#6F2F9F", 
  secondaryColor = "#9C4DC7",
  className = "",
  wrapperClass = "",
  speed = "1.5s"
}) => {
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    display: 'inline-block',
    position: 'relative'
  };

  const helixStyle = {
    '--primary-color': color,
    '--secondary-color': secondaryColor,
    '--animation-speed': speed,
    '--spinner-size': `${Math.min(width, height)}px`
  };

  return (
    <div className={`dna-spinner-container ${wrapperClass}`} style={containerStyle}>
      <div className={`dna-helix ${className}`} style={helixStyle}>
        {/* DNA Double Helix Structure */}
        <div className="helix-strand strand-1">
          <div className="base-pair base-1"></div>
          <div className="base-pair base-2"></div>
          <div className="base-pair base-3"></div>
          <div className="base-pair base-4"></div>
          <div className="base-pair base-5"></div>
          <div className="base-pair base-6"></div>
        </div>
        
        <div className="helix-strand strand-2">
          <div className="base-pair base-1"></div>
          <div className="base-pair base-2"></div>
          <div className="base-pair base-3"></div>
          <div className="base-pair base-4"></div>
          <div className="base-pair base-5"></div>
          <div className="base-pair base-6"></div>
        </div>
        
        {/* Connecting base pairs */}
        <div className="connections">
          <div className="connection connection-1"></div>
          <div className="connection connection-2"></div>
          <div className="connection connection-3"></div>
          <div className="connection connection-4"></div>
          <div className="connection connection-5"></div>
          <div className="connection connection-6"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Alternative SVG-based DNA Spinner
 * More precise control over the DNA shape
 */
export const DNASpinnerSVG = ({ 
  height = 60, 
  width = 60, 
  color = "#6F2F9F", 
  secondaryColor = "#9C4DC7",
  className = "",
  wrapperClass = ""
}) => {
  const svgStyle = {
    width: `${width}px`,
    height: `${height}px`,
    animation: 'dna-rotate 2s linear infinite'
  };

  return (
    <div className={`dna-svg-container ${wrapperClass}`}>
      <svg 
        style={svgStyle} 
        className={`dna-svg ${className}`}
        viewBox="0 0 60 60" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="dnaGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        
        {/* Left DNA strand */}
        <path 
          d="M20 5 Q10 15 20 25 Q30 35 20 45 Q10 55 20 65" 
          fill="none" 
          stroke="url(#dnaGradient1)" 
          strokeWidth="3"
          className="dna-strand-left"
        />
        
        {/* Right DNA strand */}
        <path 
          d="M40 5 Q50 15 40 25 Q30 35 40 45 Q50 55 40 65" 
          fill="none" 
          stroke="url(#dnaGradient2)" 
          strokeWidth="3"
          className="dna-strand-right"
        />
        
        {/* Base pair connections */}
        <g className="base-pairs">
          <line x1="20" y1="10" x2="40" y2="10" stroke={color} strokeWidth="2" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s"/>
          </line>
          <line x1="22" y1="20" x2="38" y2="20" stroke={secondaryColor} strokeWidth="2" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
          </line>
          <line x1="20" y1="30" x2="40" y2="30" stroke={color} strokeWidth="2" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
          </line>
          <line x1="22" y1="40" x2="38" y2="40" stroke={secondaryColor} strokeWidth="2" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.9s"/>
          </line>
          <line x1="20" y1="50" x2="40" y2="50" stroke={color} strokeWidth="2" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1.2s"/>
          </line>
        </g>
      </svg>
      
      <style jsx>{`
        @keyframes dna-rotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        .dna-svg-container {
          display: inline-block;
          perspective: 100px;
        }
        
        .dna-strand-left {
          animation: dna-pulse 2s ease-in-out infinite;
        }
        
        .dna-strand-right {
          animation: dna-pulse 2s ease-in-out infinite reverse;
        }
        
        @keyframes dna-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/**
 * Simple DNA Icon Spinner
 * Minimalist approach with rotation
 */
export const DNAIconSpinner = ({ 
  height = 60, 
  width = 60, 
  color = "#6F2F9F",
  className = "",
  wrapperClass = ""
}) => {
  return (
    <div className={`dna-icon-container ${wrapperClass}`} style={{ width: `${width}px`, height: `${height}px` }}>
      <div className={`dna-icon ${className}`} style={{ '--color': color }}>
        🧬
      </div>
      
      <style jsx>{`
        .dna-icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .dna-icon {
          font-size: ${Math.min(width, height) * 0.8}px;
          animation: dna-spin 1.5s linear infinite;
          filter: hue-rotate(0deg);
          animation: dna-spin 1.5s linear infinite, dna-color 3s ease-in-out infinite;
        }
        
        @keyframes dna-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes dna-color {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(60deg) brightness(1.2); }
        }
      `}</style>
    </div>
  );
};

export default DNASpinner;
