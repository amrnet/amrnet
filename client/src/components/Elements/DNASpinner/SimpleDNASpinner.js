import './SimpleDNASpinner.css';

/**
 * Simple, Lightweight DNA Spinner
 * 
 * A more minimalist approach to DNA-themed loading
 * Perfect replacement for react-loader-spinner's Circles
 */
export const SimpleDNASpinner = ({ 
  height = 60, 
  width = 60, 
  color = "#6F2F9F", 
  className = "",
  wrapperClass = "",
  speed = "1.2s"
}) => {
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    '--spinner-color': color,
    '--spinner-speed': speed,
    '--spinner-size': `${Math.min(width, height)}px`
  };

  return (
    <div className={`simple-dna-container ${wrapperClass}`} style={containerStyle}>
      <div className={`simple-dna-spinner ${className}`}>
        <div className="dna-dot dot-1"></div>
        <div className="dna-dot dot-2"></div>
        <div className="dna-dot dot-3"></div>
        <div className="dna-dot dot-4"></div>
        <div className="dna-line line-1"></div>
        <div className="dna-line line-2"></div>
        <div className="dna-line line-3"></div>
      </div>
    </div>
  );
};

/**
 * DNA Pulse Spinner - Simplified pulsing version
 */
export const DNAPulseSpinner = ({ 
  height = 60, 
  width = 60, 
  color = "#6F2F9F", 
  className = "",
  wrapperClass = ""
}) => {
  const style = {
    width: `${width}px`,
    height: `${height}px`,
    '--pulse-color': color,
    fontSize: `${Math.min(width, height) * 0.8}px`
  };

  return (
    <div className={`dna-pulse-container ${wrapperClass}`} style={style}>
      <div className={`dna-pulse-emoji ${className}`}>
        🧬
      </div>
    </div>
  );
};

export default SimpleDNASpinner;
