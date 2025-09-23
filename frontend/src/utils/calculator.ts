import type { InvestmentInput, InvestmentResult, InvestmentTypeResult, SimulationScenario } from '../types/investment';

// 안전한 숫자 변환 함수
function safeNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

// 소수점 반올림 함수
function roundTo(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// 적용 가능한 분배율 범위 찾기 (구간별 누적 분배로 대체됨)
// function findApplicableDistributionRange(ranges: DistributionRange[], cumulativeReturn: number): DistributionRange | null {
//   if (!ranges || ranges.length === 0) return null;
//   
//   // 범위를 정렬 (최소값 기준 오름차순)
//   const sortedRanges = [...ranges].sort((a, b) => a.minReturn - b.minReturn);
//   
//   for (const range of sortedRanges) {
//     const minReturn = safeNumber(range.minReturn);
//     const maxReturn = range.maxReturn === null ? Infinity : safeNumber(range.maxReturn);
//     
//     if (cumulativeReturn > minReturn && cumulativeReturn <= maxReturn) {
//       return range;
//     }
//   }
//   
//   return null;
// }

export function calculateInvestmentResult(input: InvestmentInput): InvestmentResult {
  // 입력값 안전하게 변환
  const investmentPeriod = safeNumber(input.investmentPeriod);
  const simulationReturn = safeNumber(input.simulationReturn);
  const thresholdReturn = safeNumber(input.thresholdReturn);

  // 입력값 검증
  if (investmentPeriod <= 0) {
    throw new Error('투자 기간은 0보다 커야 합니다.');
  }

  if (!input.investmentTypes || input.investmentTypes.length === 0) {
    throw new Error('최소 하나의 투자 종류가 필요합니다.');
  }

  // 1종(기준 타입) 찾기
  const baseType = input.investmentTypes.find(type => type.isBaseType);
  if (!baseType) {
    throw new Error('기준 투자 종류(1종)가 필요합니다.');
  }

  // 실제 투자금 계산
  const baseInvestmentAmount = safeNumber(baseType.investment) * 100000000; // 억원 → 원
  
  const typeResults: InvestmentTypeResult[] = input.investmentTypes.map(type => {
    let actualInvestment: number;
    
    if (type.isBaseType) {
      // 1종은 직접 금액
      actualInvestment = baseInvestmentAmount;
    } else {
      // 1종이 아닌 경우 입력 방식에 따라 계산
      if (type.inputMode === 'amount') {
        // 직접 금액 입력
        actualInvestment = safeNumber(type.investmentAmount || 0) * 100000000; // 억원 → 원
      } else {
        // % 입력
        actualInvestment = roundTo(baseInvestmentAmount * (safeNumber(type.investment) / 100));
      }
    }

    return {
      id: type.id,
      name: type.name,
      investment: actualInvestment,
      thresholdProfit: 0,
      excessProfit: 0,
      loss: 0,
      totalValue: actualInvestment,
      return: 0,
      cumulativeReturn: 0,
      isBaseType: type.isBaseType
    };
  });

  // 총 투자금
  const totalInvestment = typeResults.reduce((sum, type) => sum + type.investment, 0);

  if (totalInvestment <= 0) {
    throw new Error('총 투자금은 0보다 커야 합니다.');
  }

  // 1종 기준수익률 계산
  const TYPE1_HURDLE_RATE = (thresholdReturn / 100) * investmentPeriod;
  
  // 시뮬레이션 수익률 기반 총 수익금/손실금
  const totalProfit = roundTo(totalInvestment * (simulationReturn / 100));
  
  // 1종 기준 수익금
  const baseTypeResult = typeResults.find(type => type.isBaseType)!;
  const type1HurdleProfit = roundTo(baseTypeResult.investment * TYPE1_HURDLE_RATE);
  
  baseTypeResult.thresholdProfit = type1HurdleProfit;

  if (totalProfit > type1HurdleProfit) {
    // 수익 시나리오: 1종 기준 수익률 초과 시
    
    // 1단계: 1종에 기준 수익 지급
    baseTypeResult.totalValue += type1HurdleProfit;
    
    // 2단계: 초과 수익 분배
    const excessProfit = totalProfit - type1HurdleProfit;
    
    if (input.useRangeBasedDistribution) {
      // 구간별 누적 분배율 적용
      const totalCumulativeReturn = (totalProfit / totalInvestment) * 100;
      const thresholdCumulativeReturn = (type1HurdleProfit / totalInvestment) * 100;
      
      // 범위를 정렬 (최소값 기준 오름차순)
      const sortedRanges = [...input.distributionRanges].sort((a, b) => a.minReturn - b.minReturn);
      
      // 각 투자 종류별 초과수익 분배금 초기화
      const typeExcessProfits: { [typeId: string]: number } = {};
      input.investmentTypes.forEach(type => {
        typeExcessProfits[type.id] = 0;
      });
      
      // 구간별로 순차적으로 분배 계산
      let currentReturn = thresholdCumulativeReturn; // 기준수익률부터 시작
      
      for (const range of sortedRanges) {
        const rangeMin = Math.max(currentReturn, range.minReturn);
        const rangeMax = range.maxReturn === null ? totalCumulativeReturn : Math.min(totalCumulativeReturn, range.maxReturn);
        
        // 현재 구간에 해당하는 수익률 범위가 있는지 확인
        if (rangeMax > rangeMin && totalCumulativeReturn > rangeMin) {
          // 이 구간에 해당하는 수익 계산
          const rangeReturnSpan = Math.min(rangeMax, totalCumulativeReturn) - rangeMin;
          const totalReturnSpan = totalCumulativeReturn - thresholdCumulativeReturn;
          
          if (totalReturnSpan > 0) {
            const rangeProfitRatio = rangeReturnSpan / totalReturnSpan;
            const rangeProfitAmount = roundTo(excessProfit * rangeProfitRatio);
            
            // 이 구간의 수익을 각 투자 종류별 분배율에 따라 분배
            input.investmentTypes.forEach(inputType => {
              const distributionRate = (range.distributions[inputType.id] || 0) / 100;
              const typeRangeProfit = roundTo(rangeProfitAmount * distributionRate);
              typeExcessProfits[inputType.id] += typeRangeProfit;
            });
            
            currentReturn = Math.min(rangeMax, totalCumulativeReturn);
          }
        }
        
        // 전체 수익률에 도달하면 종료
        if (currentReturn >= totalCumulativeReturn) {
          break;
        }
      }
      
      // 계산된 초과수익 분배금을 각 투자 종류에 적용
      input.investmentTypes.forEach((inputType, index) => {
        const typeExcessProfit = typeExcessProfits[inputType.id] || 0;
        typeResults[index].excessProfit = typeExcessProfit;
        typeResults[index].totalValue += typeExcessProfit;
      });
    } else {
      // 전체 구간 동일 분배율 적용
      input.investmentTypes.forEach((inputType, index) => {
        const distributionRate = (input.globalDistribution[inputType.id] || 0) / 100;
        const typeExcessProfit = roundTo(excessProfit * distributionRate);
        typeResults[index].excessProfit = typeExcessProfit;
        typeResults[index].totalValue += typeExcessProfit;
      });
    }
    
  } else if (totalProfit >= 0) {
    // 1종 기준 수익률 미달이지만 손실은 없는 경우
    const remainingProfit = totalProfit;
    
    if (remainingProfit <= type1HurdleProfit) {
      // 1종에 우선 지급
      const type1ActualProfit = Math.min(remainingProfit, type1HurdleProfit);
      baseTypeResult.totalValue += type1ActualProfit;
      baseTypeResult.thresholdProfit = type1ActualProfit;
      
      // 나머지를 다른 종류에 투자 비율로 배분
      const remaining = remainingProfit - type1ActualProfit;
      if (remaining > 0) {
        const nonBaseTypes = typeResults.filter(type => !type.isBaseType);
        const nonBaseTotalInvestment = nonBaseTypes.reduce((sum, type) => sum + type.investment, 0);
        
        if (nonBaseTotalInvestment > 0) {
          nonBaseTypes.forEach(type => {
            const ratio = type.investment / nonBaseTotalInvestment;
            const additionalProfit = roundTo(remaining * ratio);
            type.totalValue += additionalProfit;
          });
        }
      }
    }
    
  } else {
    // 손실 시나리오: 높은 숫자 종류부터 원금 완전 소진 → 낮은 숫자 종류 순서
    let remainingLoss = Math.abs(totalProfit);
    
    // 종류를 숫자 순서 역순으로 정렬 (높은 숫자부터)
    const sortedTypes = typeResults
      .filter(type => !type.isBaseType)
      .sort((a, b) => {
        const aNum = parseInt(a.id.replace('type', ''));
        const bNum = parseInt(b.id.replace('type', ''));
        return bNum - aNum; // 내림차순 정렬
      });
    
    // 높은 숫자 종류부터 순차적으로 원금 완전 소진
    for (const type of sortedTypes) {
      if (remainingLoss <= 0) break;
      
      const typeLoss = Math.min(remainingLoss, type.investment);
      type.loss = typeLoss;
      type.totalValue = type.investment - typeLoss;
      remainingLoss -= typeLoss;
    }
    
    // 1종(기준 타입)에 남은 손실 적용
    if (remainingLoss > 0) {
      const type1Loss = Math.min(remainingLoss, baseTypeResult.investment);
      baseTypeResult.loss = type1Loss;
      baseTypeResult.totalValue = baseTypeResult.investment - type1Loss;
    }
  }

  // 각 종별 수익률 계산
  typeResults.forEach(type => {
    type.totalValue = Math.max(0, type.totalValue);
    
    if (type.investment > 0) {
      type.return = roundTo(((type.totalValue - type.investment) / type.investment) * 100 / investmentPeriod, 2);
      type.cumulativeReturn = roundTo(((type.totalValue - type.investment) / type.investment) * 100, 2);
    }
  });

  // 전체 계산
  const totalValue = typeResults.reduce((sum, type) => sum + type.totalValue, 0);
  const totalReturn = totalInvestment > 0 ? 
    roundTo(((totalValue - totalInvestment) / totalInvestment) * 100 / investmentPeriod, 2) : 0;
  const totalCumulativeReturn = totalInvestment > 0 ? 
    roundTo(((totalValue - totalInvestment) / totalInvestment) * 100, 2) : 0;

  const thresholdProfit = type1HurdleProfit;
  const excessProfit = Math.max(0, totalProfit - type1HurdleProfit);

  // 시나리오 유형 결정
  let scenarioType: 'profit' | 'loss' | 'break-even';
  if (totalProfit > type1HurdleProfit) {
    scenarioType = 'profit';
  } else if (totalProfit < 0) {
    scenarioType = 'loss';
  } else {
    scenarioType = 'break-even';
  }

  // 호환성을 위한 기존 필드들 (처음 3개 종류만)
  const type1 = typeResults.find(t => t.isBaseType) || typeResults[0];
  const type2 = typeResults.find(t => !t.isBaseType && t.id === 'type2') || typeResults[1];
  const type3 = typeResults.find(t => !t.isBaseType && t.id === 'type3') || typeResults[2];

  return {
    totalInvestment,
    typeResults,
    thresholdProfit,
    excessProfit,
    totalValue,
    totalReturn,
    totalCumulativeReturn,
    scenarioType,
    
    // 호환성을 위한 기존 필드들
    type1Investment: type1?.investment || 0,
    type2Investment: type2?.investment || 0,
    type3Investment: type3?.investment || 0,
    type1ThresholdProfit: type1?.thresholdProfit || 0,
    type2ThresholdProfit: type2?.thresholdProfit || 0,
    type3ThresholdProfit: type3?.thresholdProfit || 0,
    type1ExcessProfit: type1?.excessProfit || 0,
    type2ExcessProfit: type2?.excessProfit || 0,
    type3ExcessProfit: type3?.excessProfit || 0,
    type1Loss: type1?.loss || 0,
    type2Loss: type2?.loss || 0,
    type3Loss: type3?.loss || 0,
    type1TotalValue: type1?.totalValue || 0,
    type2TotalValue: type2?.totalValue || 0,
    type3TotalValue: type3?.totalValue || 0,
    type1Return: type1?.return || 0,
    type2Return: type2?.return || 0,
    type3Return: type3?.return || 0,
    type1CumulativeReturn: type1?.cumulativeReturn || 0,
    type2CumulativeReturn: type2?.cumulativeReturn || 0,
    type3CumulativeReturn: type3?.cumulativeReturn || 0,
  };
}

export function generateSimulationScenarios(
  input: Omit<InvestmentInput, 'simulationReturn'>,
  returnRates: number[]
): SimulationScenario[] {
  return returnRates.map(returnRate => ({
    returnRate,
    result: calculateInvestmentResult({ ...input, simulationReturn: returnRate })
  }));
}

export function formatCurrency(amount: number): string {
  // NaN이나 무한대 값 처리
  if (!isFinite(amount) || isNaN(amount)) {
    return '0억원';
  }
  
  // 억원 단위로 변환 (100,000,000으로 나누기)
  const amountInEokWon = amount / 100000000;
  
  // 1억원 미만인 경우 소수점 표시, 1억원 이상인 경우 정수로 표시
  if (Math.abs(amountInEokWon) < 1) {
    return `${amountInEokWon.toFixed(2)}억원`;
  } else {
    return `${amountInEokWon.toFixed(1)}억원`;
  }
}

export function formatPercentage(rate: number, decimals: number = 2): string {
  // NaN이나 무한대 값 처리
  if (!isFinite(rate) || isNaN(rate)) {
    return '0.00%';
  }
  
  return `${rate.toFixed(decimals)}%`;
}

export function formatNumber(num: number): string {
  // NaN이나 무한대 값 처리
  if (!isFinite(num) || isNaN(num)) {
    return '0';
  }
  
  return new Intl.NumberFormat('ko-KR').format(Math.round(num));
}
