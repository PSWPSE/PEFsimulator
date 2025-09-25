import React, { forwardRef } from 'react';
import type { InvestmentResult } from '../types/investment';
import { formatCurrency, formatPercentage, getProfitColorClass } from '../utils/calculator';

interface ResultDisplayProps {
  result: InvestmentResult;
}

export const ResultDisplay = forwardRef<HTMLDivElement, ResultDisplayProps>(({ result }, ref) => {
  return (
    <div className="space-y-5">
      {/* 전체 요약 */}
      <div ref={ref} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">전체 현황</h2>
          <p className="text-slate-300 text-sm mt-1">설정한 수익률 달성 시 펀드 전체의 성과 현황을 확인하세요</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">총 투자금</p>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(result.totalInvestment)}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">총 평가액</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(result.totalValue)}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">총 수익금</p>
                    <p className="text-sm font-bold text-orange-600">
                      {formatCurrency(result.totalValue - result.totalInvestment)}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 font-semibold">누적 수익률</p>
                    <p className={`text-sm font-bold ${getProfitColorClass(result.totalCumulativeReturn)}`}>{formatPercentage(result.totalCumulativeReturn)}</p>
                  </div>
                </div>
              </div>
        </div>
      </div>

      {/* 수익금 현황 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">
            {result.scenarioType === 'loss' ? '손실 구조 분석' : '수익금 발생 현황'}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            {result.scenarioType === 'loss' ? '손실 분배 구조를 확인하세요' : '기준 수익금 규모와 초과 수익금 규모를 확인하세요'}
          </p>
        </div>
        
        <div className="p-6">
          {result.scenarioType === 'loss' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">총 손실금</p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(result.typeResults.reduce((sum, type) => sum + type.loss, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">손실 배분 순서</p>
                      <p className="text-xs text-yellow-700 font-medium">
                        {result.typeResults
                          .filter(type => !type.isBaseType)
                          .reverse()
                          .map(type => type.name)
                          .concat(result.typeResults.find(type => type.isBaseType)?.name || '')
                          .join(' → ')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">잔여 투자금</p>
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(result.totalValue)}</p>
                    </div>
                  </div>
                </div>
          ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">기준 수익금</p>
                      <p className="text-sm font-bold text-gray-800">{formatCurrency(result.thresholdProfit)}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">초과 수익금</p>
                      <p className="text-sm font-bold text-orange-600">{formatCurrency(result.excessProfit)}</p>
                    </div>
                  </div>
                </div>
          )}
        </div>
      </div>

      {/* 투자금 종류별 상세 결과 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
          <h2 className="text-lg font-bold text-white">종류별 수익금 분배 현황</h2>
          <p className="text-slate-300 text-sm mt-1">각 투자금 종류별로 배분된 수익금 현황과 수익률을 확인하세요</p>
        </div>
        
        <div className="px-6 pt-4 pb-6 space-y-4">
          {/* 모바일: 컴팩트 카드 형식 */}
          <div className="block sm:hidden space-y-2">
            {result.typeResults.map((typeResult, index) => (
              <div key={typeResult.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <h4 className={`font-semibold text-xs flex items-center ${
                    index === 0 ? 'text-slate-700' :
                    index === 1 ? 'text-orange-600' :
                    'text-purple-600'
                  }`}>
                    <span className={`w-4 h-4 rounded flex items-center justify-center mr-1.5 text-sm font-bold text-white ${
                      index === 0 ? 'bg-slate-600' :
                      index === 1 ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}>
                      {index + 1}
                    </span>
                    {typeResult.name} 투자금
                  </h4>
                </div>
                <div className="p-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 text-xs">투자금</span>
                      <span className="font-medium text-gray-800 text-xs">{formatCurrency(typeResult.investment)}</span>
                    </div>
                    {result.scenarioType === 'loss' ? (
                      <div className="flex justify-between items-center py-1 border-t border-gray-100">
                        <span className="text-gray-600 text-xs">손실금</span>
                        <span className="font-medium text-red-600 text-xs">{formatCurrency(typeResult.loss)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-gray-600 text-xs">기준 수익금</span>
                          <span className="font-medium text-gray-800 text-xs">{formatCurrency(typeResult.thresholdProfit)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 text-xs">초과 수익금</span>
                          <span className="font-medium text-orange-600 text-xs">{formatCurrency(typeResult.excessProfit)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center py-1 border-t border-gray-100">
                      <span className="text-gray-600 text-xs">총 평가액</span>
                      <span className="font-semibold text-gray-800 text-xs">{formatCurrency(typeResult.totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-gray-100 mt-1">
                      <span className="text-gray-600 text-xs font-medium">누적 수익률</span>
                      <span className={`font-bold text-sm ${getProfitColorClass(typeResult.cumulativeReturn)}`}>
                        {formatPercentage(typeResult.cumulativeReturn)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱: 테이블 형식 */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <th className="px-5 py-3 text-left font-semibold text-slate-700 text-xs">구분</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">투자금</th>
                    {result.scenarioType === 'loss' ? (
                      <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">손실금</th>
                    ) : (
                      <>
                        <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">기준 수익금</th>
                        <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">초과 수익금</th>
                      </>
                    )}
                    <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">총 평가액</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-700 text-xs">누적 수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 동적으로 각 투자 종류의 행 생성 */}
                  {result.typeResults.map((typeResult, index) => (
                    <tr key={typeResult.id} className="hover:bg-slate-50/50 transition-colors duration-150 border-b border-gray-100">
                      <td className="px-5 py-3 font-medium text-slate-800 text-sm">
                        <div className="flex items-center">
                          <span className={`w-4 h-4 rounded flex items-center justify-center mr-2.5 text-xs font-bold text-white ${
                            index === 0 ? 'bg-slate-600' :
                            index === 1 ? 'bg-orange-500' :
                            'bg-purple-500'
                          }`}>
                            {index + 1}
                          </span>
                          {typeResult.name} 투자금
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-700 text-sm">
                        {formatCurrency(typeResult.investment)}
                      </td>
                      {result.scenarioType === 'loss' ? (
                        <td className="px-5 py-3 text-right font-medium text-red-600 text-sm">
                          {formatCurrency(typeResult.loss)}
                        </td>
                      ) : (
                        <>
                          <td className="px-5 py-3 text-right font-medium text-slate-700 text-sm">
                            {formatCurrency(typeResult.thresholdProfit)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-orange-600 text-sm">
                            {formatCurrency(typeResult.excessProfit)}
                          </td>
                        </>
                      )}
                      <td className="px-5 py-3 text-right font-semibold text-slate-800 text-sm">
                        {formatCurrency(typeResult.totalValue)}
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold text-sm ${getProfitColorClass(typeResult.cumulativeReturn)}`}>
                        {formatPercentage(typeResult.cumulativeReturn)}
                      </td>
                    </tr>
                  ))}
                  
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300">
                    <td className="px-5 py-3.5 font-bold text-slate-800 text-sm">
                      <div className="flex items-center">
                        <span className="w-4 h-4 rounded flex items-center justify-center mr-2.5 text-xs font-bold text-white bg-slate-400">
                          Σ
                        </span>
                        합계
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800 text-sm">
                      {formatCurrency(result.totalInvestment)}
                    </td>
                    {result.scenarioType === 'loss' ? (
                      <td className="px-5 py-3.5 text-right font-bold text-red-600 text-sm">
                        {formatCurrency(result.typeResults.reduce((sum, type) => sum + type.loss, 0))}
                      </td>
                    ) : (
                      <>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-800 text-sm">
                          {formatCurrency(result.thresholdProfit)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-orange-600 text-sm">
                          {formatCurrency(result.excessProfit)}
                        </td>
                      </>
                    )}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800 text-sm">
                      {formatCurrency(result.totalValue)}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold text-sm ${getProfitColorClass(result.totalCumulativeReturn)}`}>
                      {formatPercentage(result.totalCumulativeReturn)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResultDisplay.displayName = 'ResultDisplay';