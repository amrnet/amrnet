import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../stores/hooks';

/**
 * Sophisticated Progressive Loading Indicator
 *
 * Shows actual loading progress with meaningful information
 */
export const GenotypeLoadingIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const totalGenotypes = useAppSelector(state => state.dashboard.totalGenotypes);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const totalGenomes = useAppSelector(state => state.dashboard.totalGenomes);
  const organism = useAppSelector(state => state.dashboard.organism);

  // Large dataset organisms
  const largeDatasetOrganisms = ['ecoli', 'kpneumo', 'decoli'];
  const isLargeDataset = largeDatasetOrganisms.includes(organism);

  // Listen for console messages to track loading progress
  useEffect(() => {
    if (!isLargeDataset) {
      setIsVisible(false);
      return;
    }

    // Show loading indicator when data is being loaded
    const shouldShow = totalGenomes > 0 && totalGenotypes < 100; // Arbitrary threshold
    setIsVisible(shouldShow);

    if (shouldShow) {
      // Estimate progress based on genotypes loaded
      const estimatedTotalGenotypes = getEstimatedGenotypes(organism);
      const currentProgress = Math.min((totalGenotypes / estimatedTotalGenotypes) * 100, 95);
      setProgress(currentProgress);

      if (totalGenotypes === 0) {
        setStatusMessage('Loading initial data...');
      } else if (totalGenotypes < 50) {
        setStatusMessage(`Loading genotypes... (${totalGenotypes} found)`);
      } else if (totalGenotypes < estimatedTotalGenotypes * 0.5) {
        setStatusMessage(`Processing data... (${totalGenotypes} genotypes)`);
      } else {
        setStatusMessage(`Almost ready... (${totalGenotypes} genotypes)`);
      }
    }
  }, [organism, totalGenotypes, totalGenomes, isLargeDataset]);

  // Hide after a few seconds when loading is complete
  useEffect(() => {
    if (totalGenotypes > 100 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [totalGenotypes, isVisible]);

  const getEstimatedGenotypes = (organism) => {
    // Rough estimates based on known data sizes
    switch (organism) {
      case 'ecoli': return 300; // E.coli has many genotypes
      case 'kpneumo': return 200;
      case 'decoli': return 150;
      default: return 100;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: '280px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontWeight: '600' }}>
          {organism.toUpperCase()} - {statusMessage}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4CAF50, #81C784)',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        opacity: '0.9'
      }}>
        <span>{totalGenomes.toLocaleString()} genomes</span>
        <span>{progress.toFixed(0)}% complete</span>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GenotypeLoadingIndicator;