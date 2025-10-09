import React, { useState, useEffect } from 'react';
// @ts-ignore
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
  cashFlow: number;
}

interface DevelopmentRevenue {
  name: string;
  revenue: number;
  color: string;
}

interface RevenueAnalyticsProps {}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [developmentData, setDevelopmentData] = useState<DevelopmentRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCashFlow, setTotalCashFlow] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [roi, setRoi] = useState(0);

  // Initialize with demo data immediately
  useEffect(() => {
    setLoading(true);
    
    // Simulate loading delay for realistic experience
    setTimeout(() => {
      setDemoData();
      setLoading(false);
    }, 500);
  }, []);

  // Demo data for comprehensive financial dashboard
  const setDemoData = () => {
    const revenueData = [
      { month: 'Jan', revenue: 6.2, profit: 1.4, cashFlow: 2.1 },
      { month: 'Feb', revenue: 7.1, profit: 1.6, cashFlow: 2.3 },
      { month: 'Mar', revenue: 8.4, profit: 1.9, cashFlow: 2.8 },
      { month: 'Apr', revenue: 7.8, profit: 1.7, cashFlow: 2.5 },
      { month: 'May', revenue: 9.2, profit: 2.1, cashFlow: 3.1 },
      { month: 'Jun', revenue: 10.5, profit: 2.4, cashFlow: 3.4 },
      { month: 'Jul', revenue: 11.2, profit: 2.5, cashFlow: 3.7 },
      { month: 'Aug', revenue: 9.8, profit: 2.2, cashFlow: 3.2 },
      { month: 'Sep', revenue: 12.1, profit: 2.7, cashFlow: 4.1 },
      { month: 'Oct', revenue: 13.4, profit: 3.0, cashFlow: 4.5 },
      { month: 'Nov', revenue: 14.2, profit: 3.2, cashFlow: 4.8 },
      { month: 'Dec', revenue: 15.1, profit: 3.4, cashFlow: 5.2 }
    ];

    const developmentData = [
      { name: 'Al Naseem Villas', revenue: 28.4, color: '#10B981' },
      { name: 'Al Bareh Residences', revenue: 22.1, color: '#3B82F6' },
      { name: 'Deerat Al Oyoun', revenue: 18.7, color: '#8B5CF6' },
      { name: 'Diyar Al Muharraq', revenue: 16.0, color: '#F59E0B' },
      { name: 'Marina District', revenue: 12.8, color: '#EF4444' }
    ];

    setRevenueData(revenueData);
    setDevelopmentData(developmentData);
    setTotalRevenue(85200000);
    setTotalCashFlow(24800000);
    setProfitMargin(22.4);
    setRoi(18.7);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading financial data...</div>
        </div>
      </div>
    );
  }
  // @ts-ignore
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue Metrics Cards */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">BD {(totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">+12.5% from last quarter</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Cash Flow</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">BD {(totalCashFlow / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">Positive inflow</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Profit Margin</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{profitMargin.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Above industry average</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">ROI</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{roi}%</div>
            <div className="text-xs text-gray-500">Annual return</div>
          </div>
        </div>
      </div>
      
      {/* Revenue Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Revenue Trends</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <LineChart data={revenueData}>
                {/* @ts-ignore */}
                <CartesianGrid strokeDasharray="3 3" />
                {/* @ts-ignore */}
                <XAxis dataKey="month" />
                {/* @ts-ignore */}
                <YAxis />
                {/* @ts-ignore */}
                <Tooltip formatter={(value, name) => [`BD ${value}M`, name]} />
                {/* @ts-ignore */}
                <Legend />
                {/* @ts-ignore */}
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Revenue"
                />
                {/* @ts-ignore */}
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Revenue by Development</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <PieChart>
                {/* @ts-ignore */}
                <Pie
                  data={developmentData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {developmentData.map((entry, index) => (
                    // @ts-ignore
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* @ts-ignore */}
                <Tooltip formatter={(value) => [`BD ${value}M`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Cash Flow Analysis</h3>
        </div>
        <div>
          {/* @ts-ignore */}
          <ResponsiveContainer width="100%" height={320}>
            {/* @ts-ignore */}
            <AreaChart data={revenueData}>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis dataKey="month" />
              {/* @ts-ignore */}
              <YAxis />
              {/* @ts-ignore */}
              <Tooltip formatter={(value, name) => [`BD ${value}M`, name]} />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Area 
                type="monotone" 
                dataKey="cashFlow" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Cash Flow"
              />
              {/* @ts-ignore */}
              <Area 
                type="monotone" 
                dataKey="profit" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.8}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;