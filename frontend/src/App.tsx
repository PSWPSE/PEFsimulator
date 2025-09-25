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
  const [isLoading, setIsLoading] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);

  const handleSubmit = async (data: InvestmentInput) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // 1초 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 사용자가 입력한 '달성 수익률(누적 수익률%)'로 메인 시뮬레이션 결과 계산
      // data.simulationReturn 값을 사용하여 '전체 요약'과 '수익금 현황' 계산
      const calculatedResult = calculateInvestmentResult(data);
      setResult(calculatedResult);

      // 다양한 만기 수익률 시나리오 생성 (-20%부터 40%까지, 0.5% 간격)
      const returnRates = [];
      for (let rate = -20; rate <= 40; rate += 0.5) {
        returnRates.push(parseFloat(rate.toFixed(1))); // 소수점 정밀도 보정
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
      setIsLoading(false);
      
      // 시뮬레이션 완료 후 자동으로 투자조건 설정 접기
      setIsInputCollapsed(true);
      
      // 사이트 최상단으로 자동 스크롤 (접기 애니메이션 완료 후)
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 400); // 300ms 애니메이션 + 100ms 여유시간
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
      setResult(null);
      setScenarios([]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 컴팩트 헤더 */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
      <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                PEF 투자 수익 배분 시뮬레이터
              </h1>
              <p className="text-slate-300 text-sm mt-0.5">
                투자금 종류별 수익률 구조와 초과 수익 배분 시뮬레이션
              </p>
            </div>
            {result && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-300">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>시뮬레이션 완료</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 반응형 레이아웃 */}
      <main className={`max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 ${result ? 'lg:h-[calc(100vh-6rem)] lg:flex lg:gap-6' : ''}`}>
        <div className={`${result ? (isInputCollapsed ? 'lg:w-16 lg:flex-shrink-0' : 'lg:w-1/3 lg:flex-shrink-0') : 'max-w-4xl mx-auto'} transition-all duration-300`}>
          {/* PC에서 접힌 상태일 때 재열기 탭 */}
          {result && isInputCollapsed && (
            <div className="hidden lg:block h-full">
              <button
                onClick={() => setIsInputCollapsed(false)}
                className="relative h-full w-16 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white flex flex-col items-center justify-center rounded-r-2xl shadow-xl border-r border-slate-600 transition-all duration-300 group overflow-hidden"
                title="투자조건 설정 열기"
              >
                {/* 배경 장식 */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* 상단 설정 아이콘 */}
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
                    <svg 
                      className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  
                  {/* 세로 텍스트 */}
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-semibold text-slate-300 tracking-wider">투</span>
                    <span className="text-[10px] font-semibold text-slate-300 tracking-wider">자</span>
                    <span className="text-[10px] font-semibold text-slate-300 tracking-wider">설</span>
                    <span className="text-[10px] font-semibold text-slate-300 tracking-wider">정</span>
                  </div>
                </div>
                
                {/* 하단 화살표 */}
                <div className="pb-4">
                  <div className="w-6 h-6 bg-slate-600/50 rounded-full flex items-center justify-center group-hover:bg-slate-500/70 transition-all duration-300">
                    <svg 
                      className="w-3 h-3 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          )}
          
          {/* 입력 폼 */}
          <div className={`${result ? 'lg:h-full lg:overflow-y-auto lg:pr-2 scrollbar-thin' : ''} ${result && isInputCollapsed ? 'lg:hidden' : ''}`}>
            <div className={`${result ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200'}`}>
              <InputForm 
                onSubmit={handleSubmit} 
                showCollapseButton={!!result}
                isCollapsed={isInputCollapsed}
                onToggleCollapse={() => setIsInputCollapsed(!isInputCollapsed)}
              />
            </div>
          </div>
        </div>

        {/* 로딩 화면 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 mx-4 max-w-sm w-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">계산 중</h3>
                <p className="text-sm text-slate-600">투자 수익 분배를 계산하고 있습니다...</p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 및 차트 영역 */}
        {result && (
          <div className={`mt-6 lg:mt-0 lg:flex-1 lg:h-full lg:overflow-y-auto scrollbar-thin ${isInputCollapsed ? 'lg:pl-2' : 'lg:pl-2'}`}>
            <div className="space-y-4 sm:space-y-6">
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

              {/* 결과 표시 */}
              <ResultDisplay result={result} />

              {/* 차트 표시 */}
              {scenarios.length > 0 && (
                <div className="mt-6">
                  <Charts scenarios={scenarios} />
                </div>
              )}
            </div>
          </div>
        )}

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