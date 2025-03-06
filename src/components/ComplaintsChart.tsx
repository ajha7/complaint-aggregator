
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps
} from 'recharts';
import { ComplaintCluster } from '@/utils/types';

interface ComplaintsChartProps {
  clusters: ComplaintCluster[];
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass p-4 rounded-lg border border-border">
        <p className="font-medium mb-1">{data.summary}</p>
        <p className="text-sm text-muted-foreground">Frequency: <span className="font-medium">{data.frequency}</span></p>
        <p className="text-sm text-muted-foreground">Total Score: <span className="font-medium">{data.totalScore}</span></p>
      </div>
    );
  }

  return null;
};

const ComplaintsChart: React.FC<ComplaintsChartProps> = ({ clusters }) => {
  // Prepare data for the chart
  const chartData = clusters.slice(0, 10).map(cluster => ({
    id: cluster.id,
    summary: cluster.summary.length > 30 
      ? cluster.summary.substring(0, 30) + '...' 
      : cluster.summary,
    frequency: cluster.frequency,
    totalScore: cluster.totalScore
  }));

  // Generate colors based on frequency
  const getBarColor = (frequency: number) => {
    const max = Math.max(...clusters.map(c => c.frequency));
    const intensity = Math.min(0.4 + (frequency / max) * 0.6, 1);
    return `rgba(37, 99, 235, ${intensity})`;
  };

  return (
    <Card className="glass p-6 w-full animate-fade-in">
      <h3 className="text-xl font-medium mb-4">Top Complaints by Frequency</h3>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="summary" 
              tick={{ fontSize: 12 }}
              width={150}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={getBarColor(entry.frequency)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ComplaintsChart;
