import React from 'react';
import type { InvestmentResult } from '../types/investment';
import { formatCurrency, formatPercentage } from '../utils/calculator';

interface ResultDisplayProps {
  result: InvestmentResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center sm:text-left bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">시뮬레이션 결과</h2>
            <p className="text-gray-600 text-sm sm:text-base">투자금 종류별 수익 분배 결과를 확인하세요</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* 전체 요약 */}
      <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 flex items-center">
          <div className="w-6 h-6 bg-slate-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          전체 요약
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">총 투자금</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{formatCurrency(result.totalInvestment)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">총 평가액</p>
            <p className="text-lg sm:text-xl font-bold text-blue-700">{formatCurrency(result.totalValue)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">총 수익금</p>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {formatCurrency(result.totalValue - result.totalInvestment)}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1 font-semibold">누적 수익률</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatPercentage(result.totalCumulativeReturn)}</p>
          </div>
        </div>
      </div>

      {/* 수익/손실 구조 분석 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 ${
            result.scenarioType === 'loss' ? 'bg-red-500' : 'bg-orange-500'
          }`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {result.scenarioType === 'loss' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              )}
            </svg>
          </div>
          {result.scenarioType === 'loss' ? '손실 구조 분석' : '수익금 현황'}
        </h3>
        
        {result.scenarioType === 'loss' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-red-800 ml-3">총 손실금</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {formatCurrency(result.typeResults.reduce((sum, type) => sum + type.loss, 0))}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border border-yellow-200 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-yellow-800 ml-3">손실 배분 순서</h4>
              </div>
              <p className="text-sm text-yellow-700 font-medium">
                {result.typeResults
                  .filter(type => !type.isBaseType)
                  .reverse()
                  .map(type => type.name)
                  .concat(result.typeResults.find(type => type.isBaseType)?.name || '')
                  .join(' → ')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-800 ml-3">잔여 투자금</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(result.totalValue)}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-center mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-xs sm:text-base sm:ml-3 text-center sm:text-left">기준 수익금</h4>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 text-center sm:text-left">{formatCurrency(result.thresholdProfit)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-5 border border-orange-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-center mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-orange-800 text-xs sm:text-base sm:ml-3 text-center sm:text-left">초과 수익금</h4>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-orange-600 text-center sm:text-left">{formatCurrency(result.excessProfit)}</p>
            </div>
          </div>
        )}
      </div>

      {/* 투자금 종별 상세 결과 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9m0 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9V5z" />
            </svg>
          </div>
          투자금 종류별 상세 결과
        </h3>
        
        {/* 모바일: 카드 형식 */}
        <div className="block sm:hidden space-y-4">
          {result.typeResults.map((typeResult, index) => (
            <div key={typeResult.id} className={`bg-gradient-to-br rounded-xl p-5 shadow-sm border ${
              index === 0 ? 'from-blue-50 to-blue-100 border-blue-200' :
              index === 1 ? 'from-orange-50 to-orange-100 border-orange-200' :
              'from-purple-50 to-purple-100 border-purple-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-orange-500' :
                  'bg-purple-500'
                }`}>
                  <span className="text-white font-bold text-sm">{typeResult.name}</span>
                </div>
                <h4 className="font-bold text-gray-800 ml-3 text-base">{typeResult.name} 투자금</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">투자금</span>
                  <p className="font-medium break-all">{formatCurrency(typeResult.investment)}</p>
                </div>
                {result.scenarioType === 'loss' ? (
                  <div>
                    <span className="text-gray-600">손실금</span>
                    <p className="font-medium text-red-600 break-all">{formatCurrency(typeResult.loss)}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-600">기준 수익금</span>
                      <p className="font-medium break-all">{formatCurrency(typeResult.thresholdProfit)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">초과 수익 분배금</span>
                      <p className="font-medium text-green-600 break-all">{formatCurrency(typeResult.excessProfit)}</p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-gray-600">총 평가액</span>
                  <p className="font-semibold break-all">{formatCurrency(typeResult.totalValue)}</p>
                </div>
                <div>
                  <span className="text-gray-600">누적 수익률</span>
                  <p className={`font-bold ${typeResult.cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(typeResult.cumulativeReturn)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 데스크톱: 테이블 형식 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">구분</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">투자금</th>
                {result.scenarioType === 'loss' ? (
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">손실금</th>
                ) : (
                  <>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">기준 수익금</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">초과 수익 분배금</th>
                  </>
                )}
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">총 평가액</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">누적 수익률</th>
              </tr>
            </thead>
            <tbody>
              {/* 동적으로 각 투자 종류의 행 생성 */}
              {result.typeResults.map((typeResult) => (
                <tr key={typeResult.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {typeResult.name} 투자금
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    {formatCurrency(typeResult.investment)}
                  </td>
                  {result.scenarioType === 'loss' ? (
                    <td className="border border-gray-300 px-4 py-3 text-right text-red-600">
                      {formatCurrency(typeResult.loss)}
                    </td>
                  ) : (
                    <>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatCurrency(typeResult.thresholdProfit)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-green-600">
                        {formatCurrency(typeResult.excessProfit)}
                      </td>
                    </>
                  )}
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                    {formatCurrency(typeResult.totalValue)}
                  </td>
                  <td className={`border border-gray-300 px-4 py-3 text-right font-semibold ${
                    typeResult.cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(typeResult.cumulativeReturn)}
                  </td>
                </tr>
              ))}
              
              <tr className="bg-blue-50 font-semibold">
                <td className="border border-gray-300 px-4 py-3">합계</td>
                <td className="border border-gray-300 px-4 py-3 text-right">
                  {formatCurrency(result.totalInvestment)}
                </td>
                {result.scenarioType === 'loss' ? (
                  <td className="border border-gray-300 px-4 py-3 text-right text-red-600">
                    {formatCurrency(result.typeResults.reduce((sum, type) => sum + type.loss, 0))}
                  </td>
                ) : (
                  <>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {formatCurrency(result.thresholdProfit)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-green-600">
                      {formatCurrency(result.excessProfit)}
                    </td>
                  </>
                )}
                <td className="border border-gray-300 px-4 py-3 text-right">
                  {formatCurrency(result.totalValue)}
                </td>
                <td className={`border border-gray-300 px-4 py-3 text-right font-semibold ${
                  result.totalCumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(result.totalCumulativeReturn)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
