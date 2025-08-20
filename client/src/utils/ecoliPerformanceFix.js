/**
 * E. coli Performance Fix
 *
 * This is a drop-in replacement for Dashboard.js to handle E. coli's large dataset
 * without freezing the browser.
 */

// Add this check in your Dashboard component where E. coli data is processed

export const handleEcoliData = async (organismData, organism) => {
  // Check if this is E. coli with a large dataset
  if (organism === 'ecoli' && organismData.length > 50000) {
    console.log(`🚨 Large E. coli dataset detected: ${organismData.length} records`);
    console.log(`🔧 Implementing progressive loading to prevent browser freeze...`);

    // Return a subset for initial rendering
    const initialData = organismData.slice(0, 5000);

    // Store the full dataset for progressive loading
    window.ecoliFullDataset = organismData;
    window.ecoliCurrentIndex = 5000;

    console.log(`✅ Initial 5K records ready for display`);
    console.log(`📄 ${organismData.length - 5000} records available for progressive loading`);

    return {
      data: initialData,
      isPaginated: true,
      totalRecords: organismData.length,
      currentlyShowing: 5000
    };
  }

  // For other organisms or smaller E. coli datasets, return as normal
  return {
    data: organismData,
    isPaginated: false,
    totalRecords: organismData.length,
    currentlyShowing: organismData.length
  };
};

// Progressive loading function for E. coli
export const loadMoreEcoliData = (chunkSize = 2000) => {
  if (!window.ecoliFullDataset || !window.ecoliCurrentIndex) {
    console.warn('No E. coli data available for progressive loading');
    return null;
  }

  const startIndex = window.ecoliCurrentIndex;
  const endIndex = Math.min(startIndex + chunkSize, window.ecoliFullDataset.length);

  const nextChunk = window.ecoliFullDataset.slice(startIndex, endIndex);
  window.ecoliCurrentIndex = endIndex;

  console.log(`📄 Loaded ${nextChunk.length} more E. coli records (${endIndex}/${window.ecoliFullDataset.length})`);

  return {
    data: nextChunk,
    hasMore: endIndex < window.ecoliFullDataset.length,
    totalLoaded: endIndex,
    totalRecords: window.ecoliFullDataset.length
  };
};

// UI Component for showing loading progress
export const EcoliLoadingProgress = ({ currentlyShowing, totalRecords, onLoadMore }) => {
  if (totalRecords <= 50000) return null; // Only show for large datasets

  const percentage = ((currentlyShowing / totalRecords) * 100).toFixed(1);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
        🧬 E. coli Data Loading
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
        Showing {currentlyShowing.toLocaleString()} of {totalRecords.toLocaleString()} records ({percentage}%)
      </div>
      <div style={{
        background: '#f0f0f0',
        height: '8px',
        borderRadius: '4px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#007bff',
          height: '100%',
          width: `${percentage}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
      {currentlyShowing < totalRecords && (
        <button
          onClick={onLoadMore}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            width: '100%'
          }}
        >
          Load More Data
        </button>
      )}
      {currentlyShowing >= totalRecords && (
        <div style={{
          color: '#28a745',
          fontSize: '12px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ✅ All data loaded
        </div>
      )}
    </div>
  );
};
