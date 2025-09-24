import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { SimulationScenario } from '../types/investment';
import { formatCurrency, getProfitColorClass } from '../utils/calculator';

interface ChartsProps {
  scenarios: SimulationScenario[];
}

export const Charts: React.FC<ChartsProps> = ({ scenarios }) => {
  // 동적 투자 종류 정보 추출 (첫 번째 시나리오에서)
  const investmentTypes = scenarios.length > 0 ? scenarios[0].result.typeResults : [];
  
  // 수익률별 시나리오 차트 데이터
  const scenarioData = scenarios.map(scenario => {
    const baseData = {
      returnRate: `${scenario.returnRate.toFixed(1)}%`,
      returnRateNum: scenario.returnRate,
      totalCumulativeReturn: scenario.result.totalCumulativeReturn,
      totalReturn: scenario.result.totalReturn,
      excessProfit: scenario.result.excessProfit
    };
    
    // 동적으로 각 투자 종류의 데이터 추가
    const dynamicData: any = {};
    scenario.result.typeResults.forEach((typeResult) => {
      dynamicData[`${typeResult.id}CumulativeReturn`] = typeResult.cumulativeReturn;
      dynamicData[`${typeResult.id}Return`] = typeResult.return;
      dynamicData[`${typeResult.id}Value`] = typeResult.totalValue;
    });
    
    
    // 호환성을 위한 기존 필드들도 유지
    return {
      ...baseData,
      ...dynamicData,
      // 기존 호환성 필드들
      type1CumulativeReturn: scenario.result.type1CumulativeReturn,
      type2CumulativeReturn: scenario.result.type2CumulativeReturn,
      type3CumulativeReturn: scenario.result.type3CumulativeReturn,
      type1Return: scenario.result.type1Return,
      type2Return: scenario.result.type2Return,
      type3Return: scenario.result.type3Return,
      type1Value: scenario.result.type1TotalValue,
      type2Value: scenario.result.type2TotalValue,
      type3Value: scenario.result.type3TotalValue
    };
  });


  return (
    <div className="space-y-5">
      {/* 누적 수익률별 시나리오 비교 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">누적 수익률별 시나리오 비교</h2>
          <p className="text-slate-300 text-sm mt-1">만기 수익률에 따른 각 투자 종류별 누적 수익률 변화를 확인하세요</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="returnRate" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => value}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  // Recharts는 Line 컴포넌트의 name prop 값을 전달합니다
                  let label = name;
                  
                  // name prop에서 ' 누적 수익률' 제거하여 깔끔한 라벨 생성
                  if (name.includes(' 누적 수익률')) {
                    label = name.replace(' 누적 수익률', '');
                  }
                  
                  return [`${label}: ${Math.round(value * 100) / 100}%`];
                }}
                labelFormatter={(label) => `만기: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  minWidth: '120px',
                  maxWidth: '250px'
                }}
                labelStyle={{
                  color: '#1f2937',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
                itemStyle={{
                  fontSize: '12px',
                  padding: '2px 0',
                  fontWeight: '600'
                }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
                position={{ x: -10, y: -10 }}
                offset={10}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="line"
              />
              {/* 동적으로 각 투자 종류의 Line 생성 */}
              {investmentTypes.map((type, index) => {
                const colors = ['#334155', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#F59E0B'];
                return (
                  <Line 
                    key={type.id}
                    type="monotone" 
                    dataKey={`${type.id}CumulativeReturn`} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 2.5, strokeWidth: 1 }}
                    name={`${type.name} 누적 수익률`}
                  />
                );
              })}
              <Line 
                type="monotone" 
                dataKey="totalCumulativeReturn" 
                stroke="#DC2626" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 2.5, strokeWidth: 1 }}
                name="전체 누적 수익률"
              />
            </LineChart>
          </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 종별 평가액 변동 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">투자금 종류별 평가액 변동 분석</h2>
          <p className="text-slate-300 text-sm mt-1">수익률 변화에 따른 각 종류별 평가액의 누적 변동을 확인하세요</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="returnRate" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => value}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${(value / 100000000).toFixed(1)}억`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  // Recharts는 Bar 컴포넌트의 name prop 값을 전달합니다
                  let label = name;
                  
                  // name prop에서 ' 평가액' 제거하여 깔끔한 라벨 생성
                  if (name.includes(' 평가액')) {
                    label = name.replace(' 평가액', '');
                  }
                  
                  return [`${label}: ${formatCurrency(value)}`];
                }}
                labelFormatter={(label) => `만기: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  minWidth: '120px',
                  maxWidth: '250px'
                }}
                labelStyle={{
                  color: '#1f2937',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
                itemStyle={{
                  fontSize: '12px',
                  padding: '2px 0',
                  fontWeight: '600'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                position={{ x: -10, y: -10 }}
                offset={10}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="rect"
              />
              {/* 동적으로 각 투자 종류의 Bar 생성 */}
              {investmentTypes.map((type, index) => {
                const colors = ['#334155', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#F59E0B'];
                return (
                  <Bar 
                    key={type.id}
                    dataKey={`${type.id}Value`} 
                    stackId="total" 
                    fill={colors[index % colors.length]} 
                    name={`${type.name} 평가액`} 
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 수익률별 투자 시나리오 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">수익률별 투자 시나리오 분석</h2>
          <p className="text-slate-300 text-sm mt-1">다양한 수익률 시나리오별 투자 성과를 표로 확인하세요</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200">
        <div className="overflow-x-auto mb-4 sm:mb-6">
          <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold text-xs sm:text-sm w-24">전체</th>
                {scenarioData.filter((_, index) => index % 5 === 0).map((scenario, index) => (
                  <th key={index} className={`border border-gray-300 px-2 sm:px-3 py-2 text-center font-semibold text-xs sm:text-sm w-20 ${getProfitColorClass(scenario.returnRateNum)}`}>
                    {scenario.returnRate}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 동적으로 각 투자 종류의 행 생성 */}
              {investmentTypes.map((type) => (
                <tr key={type.id}>
                  <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 w-24">
                    {type.name}
                  </td>
                  {scenarioData.filter((_, index) => index % 5 === 0).map((scenario, index) => {
                    const cumulativeReturn = scenario[`${type.id}CumulativeReturn`] || 0;
                    const colorClass = type.isBaseType 
                      ? (cumulativeReturn >= 0 ? 'text-black' : 'text-orange-600')
                      : (cumulativeReturn >= 0 ? 'text-black' : 'text-red-600');
                    
                    return (
                      <td key={index} className={`border border-gray-300 px-3 py-2 text-center w-20 ${colorClass}`}>
                        {cumulativeReturn >= -99 ? cumulativeReturn.toFixed(1) : type.isBaseType ? '-' : '-100.0'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
