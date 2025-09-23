export interface DistributionRange {
  id: string;
  minReturn: number; // 최소 누적수익률 %
  maxReturn: number | null; // 최대 누적수익률 % (null이면 무제한)
  distributions: { [typeId: string]: number }; // 각 종류별 분배율 %
}

export interface InvestmentType {
  id: string;
  name: string;
  investment: number; // 1종은 금액(억원), 2종 이상은 % 또는 금액(억원)
  investmentAmount?: number; // 2종 이상의 직접 금액 입력 (억원)
  inputMode: 'percentage' | 'amount'; // 입력 방식: % 또는 금액
  isBaseType: boolean; // 1종 여부 (금액 기준)
}

export interface InvestmentInput {
  // 동적 투자 종류
  investmentTypes: InvestmentType[];
  
  // 범위별 분배율 사용 여부
  useRangeBasedDistribution: boolean;
  
  // 범위별 분배율 설정 (useRangeBasedDistribution이 true일 때 사용)
  distributionRanges: DistributionRange[];
  
  // 전체 구간 분배율 (useRangeBasedDistribution이 false일 때 사용)
  globalDistribution: { [typeId: string]: number };
  
  // 기준 수익률 (연환산)
  thresholdReturn: number;
  
  // 투자 기간 (년)
  investmentPeriod: number;
  
  // 시뮬레이션할 수익률 (연환산)
  simulationReturn: number;
}

export interface InvestmentTypeResult {
  id: string;
  name: string;
  investment: number; // 실제 투자금 (원)
  thresholdProfit: number; // 기준 수익금
  excessProfit: number; // 초과 수익 분배금
  loss: number; // 손실금
  totalValue: number; // 총 평가액
  return: number; // 연환산 수익률
  cumulativeReturn: number; // 누적 수익률
  isBaseType: boolean; // 1종 여부
}

export interface InvestmentResult {
  // 총 투자금
  totalInvestment: number;
  
  // 각 종별 결과
  typeResults: InvestmentTypeResult[];
  
  // 기준 수익금 (1종만)
  thresholdProfit: number;
  
  // 초과 수익금 (전체)
  excessProfit: number;
  
  // 전체 평가액 및 수익률
  totalValue: number;
  totalReturn: number;
  totalCumulativeReturn: number;
  
  // 시나리오 유형
  scenarioType: 'profit' | 'loss' | 'break-even';
  
  // 호환성을 위한 기존 필드들 (deprecated)
  type1Investment: number;
  type2Investment: number;
  type3Investment: number;
  type1ThresholdProfit: number;
  type2ThresholdProfit: number;
  type3ThresholdProfit: number;
  type1ExcessProfit: number;
  type2ExcessProfit: number;
  type3ExcessProfit: number;
  type1Loss: number;
  type2Loss: number;
  type3Loss: number;
  type1TotalValue: number;
  type2TotalValue: number;
  type3TotalValue: number;
  type1Return: number;
  type2Return: number;
  type3Return: number;
  type1CumulativeReturn: number;
  type2CumulativeReturn: number;
  type3CumulativeReturn: number;
}

export interface SimulationScenario {
  returnRate: number;
  result: InvestmentResult;
}
