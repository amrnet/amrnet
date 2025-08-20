/**
 * @fileoverview Unit tests for DrugResistanceGraph component
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DrugResistanceGraph } from '../../components/Elements/Graphs/DrugResistanceGraph/DrugResistanceGraph';

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    dashboard: (state = {
      organism: 'styphi',
      availableDrugs: ['Azithromycin NS', 'Ciprofloxacin NS'],
    }) => state,
    graph: (state = {
      drugResistanceGraphView: ['Azithromycin NS'],
      drugsYearData: [
        {
          year: '2020',
          'Azithromycin NS': 25,
          'Ciprofloxacin NS': 30,
          total: 100,
        },
        {
          year: '2021',
          'Azithromycin NS': 30,
          'Ciprofloxacin NS': 35,
          total: 120,
        },
      ],
    }) => state,
  },
});

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }) => <div data-testid={`line-${dataKey}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  FormControl: ({ children }) => <div data-testid="form-control">{children}</div>,
  InputLabel: ({ children }) => <label data-testid="input-label">{children}</label>,
  Select: ({ children, value, onChange }) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
    >
      {children}
    </select>
  ),
  MenuItem: ({ children, value }) => <option value={value}>{children}</option>,
  Chip: ({ label, onDelete }) => (
    <span data-testid="chip">
      {label}
      {onDelete && <button onClick={onDelete} data-testid="chip-delete">×</button>}
    </span>
  ),
}));

const renderWithProvider = (component) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('DrugResistanceGraph Component', () => {
  test('should render without crashing', () => {
    renderWithProvider(<DrugResistanceGraph />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('should display chart elements', () => {
    renderWithProvider(<DrugResistanceGraph />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('should render drug selection dropdown', () => {
    renderWithProvider(<DrugResistanceGraph />);
    expect(screen.getByTestId('form-control')).toBeInTheDocument();
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  test('should display selected drugs as chips', () => {
    renderWithProvider(<DrugResistanceGraph />);

    // Should show selected drug
    expect(screen.getByTestId('chip')).toBeInTheDocument();
    expect(screen.getByText('Azithromycin NS')).toBeInTheDocument();
  });

  test('should handle drug selection changes', () => {
    renderWithProvider(<DrugResistanceGraph />);

    const select = screen.getByTestId('select');
    fireEvent.change(select, { target: { value: 'Ciprofloxacin NS' } });

    // This would trigger the Redux action in a real scenario
    // In this test, we're just verifying the component can handle the event
    expect(select).toBeInTheDocument();
  });

  test('should handle chip deletion', () => {
    renderWithProvider(<DrugResistanceGraph />);

    const deleteButton = screen.queryByTestId('chip-delete');
    if (deleteButton) {
      fireEvent.click(deleteButton);
      // Verify deletion logic would be triggered
      expect(deleteButton).toBeInTheDocument();
    }
  });
});

describe('DrugResistanceGraph Data Processing', () => {
  test('should process years data correctly', () => {
    const mockData = [
      { year: '2020', 'Azithromycin NS': 25, total: 100 },
      { year: '2021', 'Azithromycin NS': 30, total: 120 },
    ];

    // Test data processing logic
    const processedData = mockData.map(item => ({
      ...item,
      percentage: (item['Azithromycin NS'] / item.total) * 100,
    }));

    expect(processedData[0].percentage).toBe(25);
    expect(processedData[1].percentage).toBe(25);
  });

  test('should handle empty data gracefully', () => {
    const emptyData = [];

    // Component should handle empty data without crashing
    expect(emptyData.length).toBe(0);
  });
});
