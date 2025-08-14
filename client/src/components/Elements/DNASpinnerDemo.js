import { 
  DNASpinner, 
  DNASpinnerSVG, 
  DNAIconSpinner, 
  SimpleDNASpinner, 
  DNAPulseSpinner 
} from '../Elements/DNASpinner';

/**
 * DNA Spinner Demo Component
 * 
 * Showcases all available DNA spinner variants
 * Perfect for testing and choosing the right spinner for your use case
 */
export const DNASpinnerDemo = () => {
  const containerStyle = {
    padding: '40px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  };

  const sectionStyle = {
    backgroundColor: 'white',
    padding: '30px',
    margin: '20px 0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
    marginTop: '20px'
  };

  const itemStyle = {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#6F2F9F', marginBottom: '40px' }}>
        🧬 DNA Spinner Collection
      </h1>
      
      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          DNA Helix Spinner (Complex)
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          A sophisticated 3D DNA helix with animated base pairs and rotational effects
        </p>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>Default Size</h4>
            <DNASpinner height={60} width={60} color="#6F2F9F" />
            <p><code>{'<DNASpinner />'}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Large Size</h4>
            <DNASpinner height={80} width={80} color="#9C4DC7" />
            <p><code>height={80} width={80}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Fast Animation</h4>
            <DNASpinner height={60} width={60} color="#4CAF50" speed="0.8s" />
            <p><code>speed="0.8s"</code></p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          SVG DNA Spinner (Smooth)
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Vector-based DNA spinner with gradient effects and precise animations
        </p>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>Default</h4>
            <DNASpinnerSVG height={60} width={60} color="#6F2F9F" />
            <p><code>{'<DNASpinnerSVG />'}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Custom Colors</h4>
            <DNASpinnerSVG height={60} width={60} color="#FF5722" secondaryColor="#FFC107" />
            <p><code>color="#FF5722" secondaryColor="#FFC107"</code></p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Simple DNA Spinner (Lightweight)
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Minimalist DNA representation with dots and connecting lines
        </p>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>Default</h4>
            <SimpleDNASpinner height={60} width={60} color="#6F2F9F" />
            <p><code>{'<SimpleDNASpinner />'}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Slower Speed</h4>
            <SimpleDNASpinner height={60} width={60} color="#2196F3" speed="2s" />
            <p><code>speed="2s"</code></p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          DNA Pulse Spinner (Emoji-based)
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Simple pulsing DNA emoji with rotation and glow effects
        </p>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>Default</h4>
            <DNAPulseSpinner height={60} width={60} color="#6F2F9F" />
            <p><code>{'<DNAPulseSpinner />'}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Large</h4>
            <DNAPulseSpinner height={100} width={100} color="#E91E63" />
            <p><code>height={100} width={100}</code></p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          DNA Icon Spinner (Ultra Simple)
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Pure emoji spinner with color-changing effects
        </p>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>Default</h4>
            <DNAIconSpinner height={60} width={60} color="#6F2F9F" />
            <p><code>{'<DNAIconSpinner />'}</code></p>
          </div>
          <div style={itemStyle}>
            <h4>Small</h4>
            <DNAIconSpinner height={40} width={40} color="#607D8B" />
            <p><code>height={40} width={40}</code></p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Performance Comparison
        </h2>
        <div style={gridStyle}>
          <div style={itemStyle}>
            <h4>🏆 Most Performant</h4>
            <DNAIconSpinner height={50} width={50} />
            <p>DNAIconSpinner</p>
            <small>Pure CSS, minimal DOM</small>
          </div>
          <div style={itemStyle}>
            <h4>⚡ Fast</h4>
            <DNAPulseSpinner height={50} width={50} />
            <p>DNAPulseSpinner</p>
            <small>Single element, simple animations</small>
          </div>
          <div style={itemStyle}>
            <h4>🎯 Balanced</h4>
            <SimpleDNASpinner height={50} width={50} />
            <p>SimpleDNASpinner</p>
            <small>Good visual appeal vs performance</small>
          </div>
          <div style={itemStyle}>
            <h4>🎨 Feature Rich</h4>
            <DNASpinnerSVG height={50} width={50} />
            <p>DNASpinnerSVG</p>
            <small>Vector graphics, scalable</small>
          </div>
          <div style={itemStyle}>
            <h4>🌟 Most Detailed</h4>
            <DNASpinner height={50} width={50} />
            <p>DNASpinner</p>
            <small>Complex 3D effects</small>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Usage Examples
        </h2>
        <div style={{ textAlign: 'left', backgroundColor: '#f8f8f8', padding: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
          <h4>Replace react-loader-spinner Circles:</h4>
          <pre style={{ color: '#d32f2f' }}>
{`// Old way
import { Circles } from 'react-loader-spinner';
<Circles color="#6F2F9F" height={60} width={60} />`}
          </pre>
          <pre style={{ color: '#388e3c', marginTop: '10px' }}>
{`// New way - Pick your favorite!
import { SimpleDNASpinner } from '../Elements/DNASpinner';
<SimpleDNASpinner color="#6F2F9F" height={60} width={60} />

import { DNAPulseSpinner } from '../Elements/DNASpinner';
<DNAPulseSpinner color="#6F2F9F" height={60} width={60} />

import { DNASpinner } from '../Elements/DNASpinner';
<DNASpinner color="#6F2F9F" height={60} width={60} />`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DNASpinnerDemo;
