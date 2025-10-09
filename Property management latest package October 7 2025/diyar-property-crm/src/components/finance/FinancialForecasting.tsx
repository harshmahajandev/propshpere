import React, { useState, useEffect } from 'react';
// @ts-ignore
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Forecast {
  period: string;
  revenue: string;
  profit: string;
  confidence: number;
}

interface MarketInsight {
  title: string;
  trend: string;
  change: string;
  description: string;
}

interface ForecastMetrics {
  revenueForecast: number;
  cashFlowProjection: number;
  riskScore: string;
  pipelineValue: number;
}

interface FinancialForecastingProps {}

const FinancialForecasting: React.FC<FinancialForecastingProps> = () => {
  const [forecastPeriod, setForecastPeriod] = useState('quarterly');
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [metrics, setMetrics] = useState<ForecastMetrics>({
    revenueForecast: 0,
    cashFlowProjection: 0,
    riskScore: 'Low',
    pipelineValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Initialize with demo data immediately
  useEffect(() => {
    setLoading(true);
    
    // Simulate loading delay for realistic experience
    setTimeout(() => {
      setDemoForecastData();
      setLoading(false);
    }, 700);
  }, []);

  const setDemoForecastData = () => {
    // Comprehensive demo forecast data
    const demoForecasts = [
      {
        period: 'Q4 2024',
        revenue: 'BD 28.5M',
        profit: 'BD 6.4M',
        confidence: 87
      },
      {
        period: 'Q1 2025',
        revenue: 'BD 32.1M',
        profit: 'BD 7.8M',
        confidence: 82
      },
      {
        period: 'Q2 2025',
        revenue: 'BD 35.7M',
        profit: 'BD 8.9M',
        confidence: 78
      },
      {
        period: 'Q3 2025',
        revenue: 'BD 38.2M',
        profit: 'BD 9.8M',
        confidence: 75
      }
    ];

    const demoInsights = [
      {
        title: 'Bahrain Real Estate Market',
        trend: 'Positive',
        change: '+8.2%',
        description: 'Property values showing steady growth driven by Vision 2030'
      },
      {
        title: 'Villa Segment Demand',
        trend: 'Strong',
        change: '+15.4%',
        description: 'High-end villa demand exceeding supply in premium locations'
      },
      {
        title: 'Investment Interest',
        trend: 'Rising',
        change: '+12.1%',
        description: 'Foreign investment in Bahrain properties increasing significantly'
      }
    ];

    setForecasts(demoForecasts);
    setMarketInsights(demoInsights);
    setMetrics({
      revenueForecast: 124800000,
      cashFlowProjection: 32400000,
      riskScore: 'Low',
      pipelineValue: 45200000
    });

    setRiskData([
      { category: 'Market Risk', current: 2.3, previous: 2.8 },
      { category: 'Credit Risk', current: 1.8, previous: 2.1 },
      { category: 'Operational Risk', current: 1.5, previous: 1.9 },
      { category: 'Liquidity Risk', current: 1.2, previous: 1.4 },
      { category: 'Regulatory Risk', current: 1.6, previous: 1.8 }
    ]);

    setPerformanceData([
      { month: 'Jan', forecast: 25.5, actual: 26.2 },
      { month: 'Feb', forecast: 27.1, actual: 26.8 },
      { month: 'Mar', forecast: 28.4, actual: 29.1 },
      { month: 'Apr', forecast: 29.8, actual: 28.5 },
      { month: 'May', forecast: 31.2, actual: 32.1 },
      { month: 'Jun', forecast: 32.5, actual: 31.9 },
      { month: 'Jul', forecast: 33.8, actual: 34.2 },
      { month: 'Aug', forecast: 35.1, actual: 33.7 },
      { month: 'Sep', forecast: 36.4, actual: 37.1 }
    ]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading forecast data...</div>
        </div>
      </div>
    );
  }
  
  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'positive':
      case 'strong':
      case 'rising':
        return 'text-green-600';
      case 'neutral':
        return 'text-yellow-600';
      case 'negative':
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Forecast Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue Forecast (12M)</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">BD {(metrics.revenueForecast / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">+18.5% projected growth</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Cash Flow Projection</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">BD {(metrics.cashFlowProjection / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">Positive outlook</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Market Risk Score</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{metrics.riskScore}</div>
            <div className="text-xs text-gray-500">Risk assessment: 2.3/10</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Pipeline Value</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">BD {(metrics.pipelineValue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">Potential sales value</div>
          </div>
        </div>
      </div>
      
      {/* Forecast Controls & Data */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Revenue Projections</span>
            <div className="space-x-2">
              {['quarterly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setForecastPeriod(period)}
                  className={`px-3 py-1 text-sm rounded capitalize ${
                    forecastPeriod === period 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </h3>
        </div>
        <div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-left py-2">Projected Revenue</th>
                  <th className="text-left py-2">Projected Profit</th>
                  <th className="text-left py-2">Confidence Level</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold">{forecast.period}</td>
                    <td className="py-3 text-green-600 font-semibold">{forecast.revenue}</td>
                    <td className="py-3 text-blue-600 font-semibold">{forecast.profit}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${forecast.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{forecast.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Forecast Chart */}
          {/* @ts-ignore */}
          <ResponsiveContainer width="100%" height={280}>
            {/* @ts-ignore */}
            <LineChart data={performanceData}>
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
                dataKey="forecast" 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
              />
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Market Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Market Insights & Strategic Recommendations</h3>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {marketInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{insight.title}</h4>
                  <span className={`text-sm font-semibold ${getTrendColor(insight.trend)}`}>
                    {insight.change}
                  </span>
                </div>
                <div className={`text-sm font-medium mb-1 ${getTrendColor(insight.trend)}`}>
                  {insight.trend}
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
          
          {/* Strategic Planning Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Strategic Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus on villa development in Al Naseem area due to high demand</li>
              <li>• Consider expanding commercial properties portfolio</li>
              <li>• Optimize pricing strategy for Q1 2025 launch</li>
              <li>• Strengthen marketing for investment properties</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <BarChart data={riskData}>
                {/* @ts-ignore */}
                <CartesianGrid strokeDasharray="3 3" />
                {/* @ts-ignore */}
                <XAxis dataKey="category" />
                {/* @ts-ignore */}
                <YAxis />
                {/* @ts-ignore */}
                <Tooltip formatter={(value, name) => [value, name]} />
                {/* @ts-ignore */}
                <Legend />
                {/* @ts-ignore */}
                <Bar dataKey="current" fill="#EF4444" name="Current Risk" />
                {/* @ts-ignore */}
                <Bar dataKey="previous" fill="#F59E0B" name="Previous Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Performance vs. Forecast</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <LineChart data={performanceData}>
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
                  dataKey="forecast" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
                {/* @ts-ignore */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Performance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialForecasting;