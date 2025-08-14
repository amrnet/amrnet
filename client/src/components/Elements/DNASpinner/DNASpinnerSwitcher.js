import { 
  DNASpinner, 
  DNASpinnerSVG, 
  DNAIconSpinner
} from './DNASpinner';
import { SimpleDNASpinner, DNAPulseSpinner } from './SimpleDNASpinner';

/**
 * Quick DNA Spinner Switcher
 * 
 * Easy way to switch between different DNA spinners
 * Just change the 'type' prop to switch styles
 */
export const DNASpinnerSwitcher = ({ 
  type = 'simple',  // 'simple', 'complex', 'pulse', 'svg', 'icon'
  ...props 
}) => {
  const spinnerComponents = {
    simple: SimpleDNASpinner,
    complex: DNASpinner,
    pulse: DNAPulseSpinner,
    svg: DNASpinnerSVG,
    icon: DNAIconSpinner
  };

  const SpinnerComponent = spinnerComponents[type] || SimpleDNASpinner;

  return <SpinnerComponent {...props} />;
};

/**
 * Usage Examples:
 * 
 * // Default (Simple)
 * <DNASpinnerSwitcher color="#6F2F9F" height={60} width={60} />
 * 
 * // Complex 3D Helix
 * <DNASpinnerSwitcher type="complex" color="#6F2F9F" height={60} width={60} />
 * 
 * // Fast Emoji
 * <DNASpinnerSwitcher type="pulse" color="#6F2F9F" height={60} width={60} />
 * 
 * // Vector Graphics
 * <DNASpinnerSwitcher type="svg" color="#6F2F9F" height={60} width={60} />
 * 
 * // Ultra Simple
 * <DNASpinnerSwitcher type="icon" color="#6F2F9F" height={60} width={60} />
 */

export default DNASpinnerSwitcher;
