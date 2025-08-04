import React, { useState, useEffect, useMemo } from 'react';

/**
 * Progressive Data Renderer - Prevents browser freezing with large datasets
 *
 * This component renders large datasets progressively to prevent the browser
 * from freezing when trying to render 227k+ E. coli records at once.
 */
export const ProgressiveDataRenderer = ({
  data = [],
  chunkSize = 1000,
  renderDelay = 50,
  children
}) => {
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [isLoading, setIsLoading] = useState(false);

  // Get the data slice that should be visible
  const visibleData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  // Progressive loading effect
  useEffect(() => {
    if (visibleCount < data.length) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + chunkSize, data.length));
        setIsLoading(false);
      }, renderDelay);

      return () => clearTimeout(timer);
    }
  }, [visibleCount, data.length, chunkSize, renderDelay]);

  // Reset when data changes
  useEffect(() => {
    setVisibleCount(Math.min(chunkSize, data.length));
  }, [data, chunkSize]);

  return (
    <div>
      {children(visibleData)}

      {visibleCount < data.length && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          <div>
            📊 Showing {visibleCount.toLocaleString()} of {data.length.toLocaleString()} records
          </div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            {isLoading ? '⏳ Loading more...' : '✅ More data loading automatically'}
          </div>
          <button
            onClick={() => setVisibleCount(data.length)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load All Data ({(data.length - visibleCount).toLocaleString()} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * E. coli Specific Data Wrapper
 *
 * Handles the E. coli dataset with special considerations for its large size
 */
export const EcoliDataWrapper = ({ data, children }) => {
  const [dataStrategy, setDataStrategy] = useState('progressive');

  // Automatically choose strategy based on data size
  useEffect(() => {
    if (data.length > 50000) {
      setDataStrategy('progressive');
      console.log(`🔄 Large E. coli dataset detected (${data.length} records) - using progressive rendering`);
    } else {
      setDataStrategy('normal');
    }
  }, [data.length]);

  if (dataStrategy === 'progressive') {
    return (
      <div>
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <strong>🚀 Performance Mode Active</strong>
          <div>Large E. coli dataset ({data.length.toLocaleString()} records) is loading progressively to prevent browser freezing.</div>
        </div>

        <ProgressiveDataRenderer
          data={data}
          chunkSize={2000}
          renderDelay={100}
        >
          {(visibleData) => children(visibleData)}
        </ProgressiveDataRenderer>
      </div>
    );
  }

  return children(data);
};

export default ProgressiveDataRenderer;
