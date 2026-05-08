import { Box, Typography } from '@mui/material';
import { Component } from 'react';

// Diagnostic error boundary for charts. Catches synchronous render errors
// (e.g. Recharts NaN crashes) and shows a placeholder instead of taking
// the whole React tree down. The error is also logged to console with
// a clearly-tagged label so we can see which chart blew up.
//
// Usage: <ChartErrorBoundary label="DistributionGraph"><Chart ... /></ChartErrorBoundary>
export class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(
      `[ChartErrorBoundary] ${this.props.label || 'unlabelled chart'} crashed:`,
      error,
      '\nReact stack:',
      info.componentStack,
    );
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ padding: 2, border: '1px dashed rgba(244,67,54,0.5)', borderRadius: 1, backgroundColor: 'rgba(244,67,54,0.04)' }}>
          <Typography variant="body2" color="error" fontWeight={600}>
            Chart failed to render: {this.props.label || 'unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {String(this.state.error?.message ?? this.state.error)}
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}
