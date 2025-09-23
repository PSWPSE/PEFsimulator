import { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { Charts } from './components/Charts';
import type { InvestmentInput, InvestmentResult } from './types/investment';
import { calculateInvestmentResult, generateSimulationScenarios } from './utils/calculator';

function App() {
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (data: InvestmentInput) => {
    try {
      setError(null);
      
      
      // 사용자가 입력한 '달성 수익률(누적 수익률%)'로 메인 시뮬레이션 결과 계산
      // data.simulationReturn 값을 사용하여 '전체 요약'과 '수익금 현황' 계산
      const calculatedResult = calculateInvestmentResult(data);
      setResult(calculatedResult);

          // 다양한 만기 수익률 시나리오 생성 (-20%부터 40%까지, 0.5% 간격)
          const returnRates = [];
          for (let rate = -20; rate <= 40; rate += 0.5) {
            returnRates.push(Math.round(rate * 10) / 10); // 소수점 정밀도 보정
          }
      
      const simulationScenarios = generateSimulationScenarios(
        {
          investmentTypes: data.investmentTypes,
          useRangeBasedDistribution: data.useRangeBasedDistribution,
          distributionRanges: data.distributionRanges,
          globalDistribution: data.globalDistribution,
          thresholdReturn: data.thresholdReturn,
          investmentPeriod: data.investmentPeriod
        },
        returnRates
      );
      
      setScenarios(simulationScenarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
      setResult(null);
      setScenarios([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* 컴팩트 헤더 */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
      <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                PEF 투자 수익 배분 시뮬레이터
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                투자금 종류별 수익률 구조와 초과 수익 배분 시뮬레이션
              </p>
            </div>
            {result && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>시뮬레이션 완료</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 반응형 레이아웃 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className={`${result ? 'space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0' : 'max-w-4xl mx-auto'} transition-all duration-300`}>
          {/* 입력 폼 */}
          <div className={`${result ? 'lg:col-span-1' : ''}`}>
            <div className={`${result ? 'lg:sticky lg:top-24' : ''}`}>
              <InputForm onSubmit={handleSubmit} />
            </div>
          </div>

          {/* 결과 및 차트 영역 */}
          {result && (
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* 오류 메시지 */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">계산 오류</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 결과 카드 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ResultDisplay result={result} />
              </div>

              {/* 차트 카드 */}
              {scenarios.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">시각화 분석</h2>
                    <p className="text-gray-600 text-sm mt-1">수익률별 시나리오 분석 및 비교</p>
                  </div>
                  <Charts scenarios={scenarios} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 결과가 없을 때 오류 메시지 */}
        {!result && error && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">계산 오류</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
      </div>
        )}
      </main>

      {/* 컴팩트 푸터 */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 text-xs">
            © 2024 PEF 투자 시뮬레이터. 투자 결정 시 전문가와 상담하시기 바랍니다.
        </p>
      </div>
      </footer>
    </div>
  );
}

export default App;