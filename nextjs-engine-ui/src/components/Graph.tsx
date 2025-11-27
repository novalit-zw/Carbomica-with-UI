import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// register required components for react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type SeriesLike = {
  label?: string;
  name?: string;
  values?: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};

interface GraphProps {
  data?: {
    labels?: string[];
    datasets?: any[];
  } | SeriesLike[];
  title?: string;
  height?: number;
}

const Graph: React.FC<GraphProps> = ({ data, title = 'Results Graph', height = 300 }) => {
  // Normalize incoming data into Chart.js format
  let chartData: { labels: string[]; datasets: any[] } = { labels: [], datasets: [] };

  if (!data) {
    chartData = { labels: [], datasets: [] };
  } else if (Array.isArray(data)) {
    // array of series: each item { name?, values? }
    const maxLen = Math.max(0, ...data.map((s) => (s.values ? s.values.length : 0)));
    const labels = Array.from({ length: maxLen }, (_, i) => String(i + 1));
    chartData = {
      labels,
      datasets: data.map((s: SeriesLike, idx: number) => ({
        label: s.label ?? s.name ?? `Series ${idx + 1}`,
        data: s.values ?? [],
        backgroundColor: s.backgroundColor ?? `rgba(0,0,0,0.05)`,
        borderColor: s.borderColor ?? `rgba(0,0,0,0.6)`,
        borderWidth: s.borderWidth ?? 2,
        fill: true,
      })),
    };
  } else if (typeof data === 'object' && Array.isArray((data as any).datasets)) {
    // already Chart.js-like
    chartData = {
      labels: (data as any).labels ?? [],
      datasets: (data as any).datasets.map((ds: any) => ({
        ...ds,
        data: ds.data ?? [],
        backgroundColor: ds.backgroundColor ?? 'rgba(0,0,0,0.05)',
        borderColor: ds.borderColor ?? 'rgba(0,0,0,0.6)',
        borderWidth: ds.borderWidth ?? 2,
      })),
    };
  } else {
    // fallback: try to coerce object values to datasets
    try {
      const entries = Object.entries(data as any);
      const labels = entries.map(([k]) => k);
      const values = entries.map(([, v]) => (Array.isArray(v) ? v : [v]));
      chartData = {
        labels,
        datasets: values.map((arr, idx) => ({
          label: `Series ${idx + 1}`,
          data: arr,
          backgroundColor: `rgba(0,0,0,0.05)`,
          borderColor: `rgba(0,0,0,0.6)`,
          borderWidth: 2,
          fill: true,
        })),
      };
    } catch {
      chartData = { labels: [], datasets: [] };
    }
  }

  return (
    <div style={{ height }}>
      <h2 className="text-sm font-medium mb-2">{title}</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: { display: false },
          },
        }}
      />
    </div>
  );
};

export default Graph;