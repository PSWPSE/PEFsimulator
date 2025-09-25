import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { InvestmentInput } from '../types/investment';

interface InputFormProps {
  onSubmit: (data: InvestmentInput) => void;
  defaultValues?: Partial<InvestmentInput>;
  showCollapseButton?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// 도움말 툴팁 컴포넌트
const HelpTooltip: React.FC<{ content: string; title?: string }> = ({ content, title }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="ml-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors"
        aria-label="도움말"
      >
        ?
      </button>
      
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsVisible(false)}
          />
          
          {/* 툴팁 내용 */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-w-[90vw] bg-white border border-gray-300 rounded-lg shadow-2xl p-4 mx-4">
            {title && (
              <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
            )}
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {content}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs transition-colors"
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const InputForm: React.FC<InputFormProps> = ({ 
  onSubmit, 
  defaultValues, 
  showCollapseButton = false, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { register, control, handleSubmit, watch, setValue, unregister, formState: { errors } } = useForm<InvestmentInput>({
    defaultValues: {
      investmentTypes: [
        { id: 'type1', name: '1종', investment: 100.0, inputMode: 'amount', isBaseType: true },
        { id: 'type2', name: '2종', investment: 14, investmentAmount: 14.0, inputMode: 'percentage', isBaseType: false },
        { id: 'type3', name: '3종', investment: 1, investmentAmount: 1.0, inputMode: 'percentage', isBaseType: false },
      ],
      useRangeBasedDistribution: false,
      distributionRanges: [
        {
          id: 'range1',
          minReturn: 0,
          maxReturn: 30,
          distributions: { type1: 60, type2: 30, type3: 10 }
        },
        {
          id: 'range2',
          minReturn: 30,
          maxReturn: null,
          distributions: { type1: 40, type2: 50, type3: 10 }
        }
      ],
      globalDistribution: { type1: 15, type2: 70, type3: 15 },
      thresholdReturn: 7,
      investmentPeriod: 2,
      simulationReturn: 20,
      ...defaultValues
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'investmentTypes'
  });

  const { fields: rangeFields, append: appendRange, remove: removeRange } = useFieldArray({
    control,
    name: 'distributionRanges'
  });

  const watchedValues = watch();

  const addInvestmentType = () => {
    const newId = `type${fields.length + 1}`;
    const newName = `${fields.length + 1}종`;
    append({ 
      id: newId, 
      name: newName, 
      investment: 50, // 기본 50% (1종 대비)
      investmentAmount: 0.5, // 기본 0.5억원
      inputMode: 'percentage',
      isBaseType: false 
    });

    // 모든 범위에 새로운 종류 추가
    rangeFields.forEach((_, rangeIndex) => {
      setValue(`distributionRanges.${rangeIndex}.distributions.${newId}`, 0);
    });
    
    // 전 구간 분배율에도 새로운 종류 추가
    setValue(`globalDistribution.${newId}`, 0);
  };

  const addDistributionRange = () => {
    const newId = `range${rangeFields.length + 1}`;
    const lastRange = rangeFields[rangeFields.length - 1];
    const minReturn = lastRange ? (lastRange.maxReturn ?? 50) : 0;
    
    // 새로운 범위의 기본 분배율 (모든 종류에 대해)
    const distributions: { [key: string]: number } = {};
    watchedValues.investmentTypes?.forEach(type => {
      distributions[type.id] = 0;
    });

    appendRange({
      id: newId,
      minReturn: minReturn,
      maxReturn: null,
      distributions: distributions
    });
  };

  const removeDistributionRange = (index: number) => {
    if (rangeFields.length > 1) { // 최소 1개 범위는 유지
      removeRange(index);
    }
  };


  const removeInvestmentType = (index: number) => {
    // 1종(기준 타입)은 삭제할 수 없음
    const typeToRemove = watchedValues.investmentTypes?.[index];
    if (typeToRemove && !typeToRemove.isBaseType) {
      const typeId = typeToRemove.id;
      
      // 투자 종류 삭제
      remove(index);
      
      // 모든 범위별 분배율에서 해당 종류 제거
      rangeFields.forEach((_, rangeIndex) => {
        const currentDistributions = watchedValues.distributionRanges?.[rangeIndex]?.distributions;
        if (currentDistributions && currentDistributions[typeId] !== undefined) {
          // 해당 종류의 분배율을 unregister로 완전 제거
          unregister(`distributionRanges.${rangeIndex}.distributions.${typeId}`);
        }
      });
      
      // 전 구간 분배율에서도 해당 종류 제거
      const globalDistribution = watchedValues.globalDistribution;
      if (globalDistribution && globalDistribution[typeId] !== undefined) {
        unregister(`globalDistribution.${typeId}`);
      }
    }
  };

  // 실시간 값 동기화 (% ↔ 금액)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.includes('investmentTypes') && value.investmentTypes) {
        const baseType = value.investmentTypes.find(t => t && t.isBaseType);
        if (!baseType) return;

        const baseAmount = baseType.investment || 0;

        // 1종 투자금이 변경된 경우 - 모든 다른 종류 업데이트
        if (name.includes('.investment') && name.includes('investmentTypes.0')) {
          value.investmentTypes.forEach((type, index) => {
            if (type && !type.isBaseType) {
              if (type.inputMode === 'percentage') {
                // % 방식인 경우 금액 자동 계산
                const percentage = type.investment || 0;
                const newAmount = Math.round((baseAmount * percentage / 100) * 10) / 10;
                const currentAmount = type.investmentAmount || 0;
                if (Math.abs(newAmount - currentAmount) > 0.01) {
                  setValue(`investmentTypes.${index}.investmentAmount`, newAmount);
                }
              } else if (type.inputMode === 'amount') {
                // 금액 방식인 경우 % 자동 계산
                const amount = type.investmentAmount || 0;
                const newPercentage = baseAmount > 0 ? Math.round((amount / baseAmount * 100) * 10) / 10 : 0;
                const currentPercentage = type.investment || 0;
                if (Math.abs(newPercentage - currentPercentage) > 0.01) {
                  setValue(`investmentTypes.${index}.investment`, newPercentage);
                }
              }
            }
          });
        }

        // % 값이 변경된 경우 (1종 제외)
        if (name.includes('.investment') && !name.includes('investmentTypes.0')) {
          const indexMatch = name.match(/investmentTypes\.(\d+)\.investment/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const type = value.investmentTypes[index];
            if (type && !type.isBaseType && type.inputMode === 'percentage') {
              const percentage = type.investment || 0;
              const newAmount = Math.round((baseAmount * percentage / 100) * 10) / 10;
              const currentAmount = type.investmentAmount || 0;
              // 값이 다를 때만 업데이트
              if (Math.abs(newAmount - currentAmount) > 0.01) {
                setValue(`investmentTypes.${index}.investmentAmount`, newAmount);
              }
            }
          }
        }

        // 금액이 변경된 경우
        if (name.includes('.investmentAmount')) {
          const indexMatch = name.match(/investmentTypes\.(\d+)\.investmentAmount/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const type = value.investmentTypes[index];
            if (type && !type.isBaseType && type.inputMode === 'amount') {
              const amount = type.investmentAmount || 0;
              const newPercentage = baseAmount > 0 ? Math.round((amount / baseAmount * 100) * 10) / 10 : 0;
              const currentPercentage = type.investment || 0;
              if (Math.abs(newPercentage - currentPercentage) > 0.01) {
                setValue(`investmentTypes.${index}.investment`, newPercentage);
              }
            }
          }
        }

        // 입력 방식이 변경된 경우
        if (name.includes('.inputMode')) {
          const indexMatch = name.match(/investmentTypes\.(\d+)\.inputMode/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const type = value.investmentTypes[index];
            if (type && !type.isBaseType) {
              if (type.inputMode === 'percentage') {
                // % 방식으로 변경 시 현재 금액을 기반으로 % 계산
                const amount = type.investmentAmount || 0;
                const newPercentage = baseAmount > 0 ? Math.round((amount / baseAmount * 100) * 10) / 10 : 0;
                const currentPercentage = type.investment || 0;
                if (Math.abs(newPercentage - currentPercentage) > 0.01) {
                  setValue(`investmentTypes.${index}.investment`, newPercentage);
                }
              } else if (type.inputMode === 'amount') {
                // 금액 방식으로 변경 시 현재 %를 기반으로 금액 계산
                const percentage = type.investment || 0;
                const newAmount = Math.round((baseAmount * percentage / 100) * 10) / 10;
                const currentAmount = type.investmentAmount || 0;
                if (Math.abs(newAmount - currentAmount) > 0.01) {
                  setValue(`investmentTypes.${index}.investmentAmount`, newAmount);
                }
              }
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">투자 조건 설정</h2>
            <p className="text-slate-300 text-sm mt-1">투자 종류별 금액과 분배 조건을 설정하세요</p>
          </div>
          {showCollapseButton && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="ml-4 p-2 text-white hover:text-slate-200 transition-colors rounded-lg hover:bg-white/10"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isCollapsed 
                    ? 'lg:rotate-180' // PC에서는 기존과 동일 (접힌 상태에서 180도 회전)
                    : 'rotate-180 lg:rotate-0' // 모바일에서는 반대 (펼친 상태에서 180도 회전)
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* 폼 내용 - 모바일에서는 접힌 상태에서 숨김, PC에서는 항상 표시 */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100' : 'max-h-[2000px] opacity-100'
      }`}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* 동적 투자금 설정 */}
        <div className="pb-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-700 flex items-center">
              <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
              투자금 설정
            </h3>
            <button
              type="button"
              onClick={addInvestmentType}
              className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
            >
              + 종류 추가
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => {
              const currentInputMode = watchedValues.investmentTypes?.[index]?.inputMode || 'percentage';
              
              return (
                <div key={field.id} className="bg-gray-50/50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                  {/* 숨겨진 필드로 name 값 유지 */}
                  <input type="hidden" {...register(`investmentTypes.${index}.name`)} value={field.name} />
                  
                  {/* 투자금 입력 - 1종 (금액만) */}
                  {field.isBaseType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.name} 투자금</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          {...register(`investmentTypes.${index}.investment`, {
                            required: '투자금을 입력해주세요',
                            min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                            valueAsNumber: true,
                            validate: (value) => {
                              if (isNaN(value) || !isFinite(value)) {
                                return '올바른 숫자를 입력해주세요';
                              }
                              return true;
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="1.0"
                        />
                        <span className="text-xs text-gray-500">억원</span>
                      </div>
                      {errors.investmentTypes?.[index]?.investment && (
                        <p className="text-red-500 text-xs mt-1">{errors.investmentTypes[index]?.investment?.message}</p>
                      )}
                    </div>
                  )}
                    
                  {/* 투자금 입력 - 1종이 아닌 경우 */}
                  {!field.isBaseType && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">{field.name} 투자금</label>
                          <button
                            type="button"
                            onClick={() => removeInvestmentType(index)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="space-y-2">
                          {/* 입력 방식 선택 라디오 버튼 */}
                          <div className="flex gap-3 sm:gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                {...register(`investmentTypes.${index}.inputMode`)}
                                value="percentage"
                                className="mr-2"
                              />
                              <span className="text-xs">1종 대비 %</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                {...register(`investmentTypes.${index}.inputMode`)}
                                value="amount"
                                className="mr-2"
                              />
                              <span className="text-xs">직접 입력</span>
                            </label>
                          </div>
                          
                          {/* 입력 필드들을 한 줄로 배치 */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* % 입력 필드 */}
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">1종 대비 비율</label>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  step="1"
                                  {...register(`investmentTypes.${index}.investment`, {
                                    required: currentInputMode === 'percentage' ? '비율을 입력해주세요' : false,
                                    min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                                    valueAsNumber: true
                                  })}
                                  className={`w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                    currentInputMode === 'percentage' 
                                      ? 'border-gray-300 bg-white' 
                                      : 'border-gray-200 bg-gray-100 text-gray-600'
                                  }`}
                                  placeholder="50"
                                  readOnly={currentInputMode !== 'percentage'}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </div>
                            
                            {/* 금액 입력 필드 */}
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">투자 금액</label>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  {...register(`investmentTypes.${index}.investmentAmount`, {
                                    required: currentInputMode === 'amount' ? '투자금을 입력해주세요' : false,
                                    min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                                    valueAsNumber: true
                                  })}
                                  className={`w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                    currentInputMode === 'amount' 
                                      ? 'border-gray-300 bg-white' 
                                      : 'border-gray-200 bg-gray-100 text-gray-600'
                                  }`}
                                  placeholder="0.5"
                                  readOnly={currentInputMode !== 'amount'}
                                />
                                <span className="text-xs text-gray-500">억원</span>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  )}
                
                  {/* 숨겨진 필드들 */}
                  <input type="hidden" {...register(`investmentTypes.${index}.id`)} value={field.id} />
                  <input type="hidden" {...register(`investmentTypes.${index}.isBaseType`)} value={field.isBaseType ? 'true' : 'false'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 분배율 설정 */}
        <div className="pb-6 border-b-2 border-gray-200">
          <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center">
            <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
            초과수익 분배율 설정
          </h3>
          
          {/* 분배 방식 선택 */}
          <div className="mb-4">
            <div className="flex gap-3 sm:gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!watchedValues.useRangeBasedDistribution}
                  onChange={() => setValue('useRangeBasedDistribution', false)}
                  className="mr-2"
                />
                <span className="text-xs font-medium">전 구간 일괄적용</span>
                <HelpTooltip 
                  title="전 구간 일괄적용"
                  content="• 모든 수익률 구간에 동일한 분배율을 적용합니다.&#10;• 수익률에 관계없이 설정한 비율로 일정하게 분배됩니다.&#10;• 간단하고 예측 가능한 분배 방식입니다."
                />
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={watchedValues.useRangeBasedDistribution === true}
                  onChange={() => setValue('useRangeBasedDistribution', true)}
                  className="mr-2"
                />
                <span className="text-xs font-medium">수익률 구간별 적용</span>
                <HelpTooltip 
                  title="수익률 구간별 적용"
                  content="• 누적수익률 구간에 따라 다른 분배율을 적용합니다.&#10;• 최소: 해당 수익률을 초과하는 구간&#10;• 최대: 해당 수익률 이하인 구간&#10;• 최대 부분 미입력 시 '최대한도없음'이 적용됩니다.&#10;• 수익률 성과에 따른 차등 분배가 가능합니다."
                />
              </label>
            </div>
          </div>

          {/* 전 구간 분배율 */}
          {!watchedValues.useRangeBasedDistribution && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm sm:text-md font-semibold text-gray-800">전 구간 분배율</h4>
                
                {/* 전 구간 분배율 합계 */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`font-semibold px-2 py-1 rounded ${
                    (() => {
                      const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                      const globalDistribution = watchedValues.globalDistribution || {};
                      const total = currentTypeIds
                        .reduce((sum, typeId) => sum + (Number(globalDistribution[typeId]) || 0), 0);
                      return total === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                    })()
                  }`}>
                    합계: {
                      (() => {
                        const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                        const globalDistribution = watchedValues.globalDistribution || {};
                        return currentTypeIds
                          .reduce((sum, typeId) => sum + (Number(globalDistribution[typeId]) || 0), 0)
                          .toFixed(1);
                      })()
                    }%
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                {watchedValues.investmentTypes?.map((type) => (
                  <div key={type.id} className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {type.name} (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`globalDistribution.${type.id}`, {
                        required: '분배율을 입력해주세요',
                        min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                        max: { value: 100, message: '100 이하의 값을 입력해주세요' },
                        valueAsNumber: true
                      })}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

            {/* 범위별 분배율 */}
            {watchedValues.useRangeBasedDistribution && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-800">수익률 구간별 분배율</h4>
                  <button
                    type="button"
                    onClick={addDistributionRange}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                  >
                    + 구간 추가
                  </button>
                </div>

                <div className="space-y-0">
                  {rangeFields.map((rangeField, rangeIndex) => (
                    <div key={rangeField.id} className={`relative ${rangeIndex === 0 ? 'pt-0 pb-6' : rangeIndex === rangeFields.length - 1 ? 'pt-6 pb-0' : 'py-6'} ${rangeIndex < rangeFields.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                      {/* 구간 제목과 분배율 합계, 삭제 버튼을 한 줄에 */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                          <div className="w-1 h-6 bg-slate-800 rounded-full mr-3"></div>
                          {rangeIndex === 0 ? '첫번째 구간' : 
                           rangeIndex === 1 ? '두번째 구간' : 
                           rangeIndex === 2 ? '세번째 구간' : 
                           rangeIndex === 3 ? '네번째 구간' : 
                           rangeIndex === 4 ? '다섯번째 구간' : 
                           `${rangeIndex + 1}번째 구간`}
                        </h4>
                        
                        <div className="flex items-center gap-3">
                          {/* 분배율 합계 표시 */}
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className={`font-semibold px-2 py-1 rounded ${
                              (() => {
                                const currentDistributions = watchedValues.distributionRanges?.[rangeIndex]?.distributions || {};
                                const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                                const total = currentTypeIds
                                  .reduce((sum, typeId) => sum + (Number(currentDistributions[typeId]) || 0), 0);
                                return total === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                              })()
                            }`}>
                              합계: {
                                (() => {
                                  const currentDistributions = watchedValues.distributionRanges?.[rangeIndex]?.distributions || {};
                                  const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                                  return currentTypeIds
                                    .reduce((sum, typeId) => sum + (Number(currentDistributions[typeId]) || 0), 0)
                                    .toFixed(1);
                                })()
                              }%
                            </span>
                          </div>

                          {/* 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => removeDistributionRange(rangeIndex)}
                            disabled={rangeFields.length <= 1}
                            className={`px-3 py-1 text-white text-xs rounded-md focus:outline-none focus:ring-2 transition-colors ${
                              rangeFields.length <= 1 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            }`}
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      {/* 수익률 구간 설정 헤드라인 */}
                      <div className="mb-2">
                        <h5 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          수익률 구간 설정
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">최소 (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              {...register(`distributionRanges.${rangeIndex}.minReturn`, {
                                required: '최소값을 입력해주세요',
                                min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                                valueAsNumber: true
                              })}
                              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">최대 (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              {...register(`distributionRanges.${rangeIndex}.maxReturn`, {
                                min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                                valueAsNumber: true,
                                setValueAs: (value) => value === '' || value === null || value === undefined ? null : Number(value)
                              })}
                              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                              placeholder="무제한"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 종류별 분배율 헤드라인 */}
                      <div className="mt-4">
                        <h5 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          종류별 분배율 설정
                        </h5>
                        <div className="flex gap-2 sm:gap-3">
                          {watchedValues.investmentTypes?.map((type) => (
                          <div key={type.id} className="flex-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              {type.name} (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              {...register(`distributionRanges.${rangeIndex}.distributions.${type.id}`, {
                                required: '분배율을 입력해주세요',
                                min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                                max: { value: 100, message: '100 이하의 값을 입력해주세요' },
                                valueAsNumber: true
                              })}
                              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                              placeholder="0"
                            />
                          </div>
                          ))}
                        </div>
                      </div>


                      {/* 숨겨진 필드 */}
                      <input type="hidden" {...register(`distributionRanges.${rangeIndex}.id`)} value={rangeField.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* 기타 설정 */}
        <div>
          <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center">
            <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
            기타 설정
          </h3>
          
          {/* 기준 수익률, 투자 기간, 달성 수익률 */}
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
                <div>기준수익률</div>
                <div>(연, %)</div>
              </label>
              <input
                type="number"
                step="0.1"
                {...register('thresholdReturn', { 
                  required: '기준 수익률을 입력해주세요',
                  min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                  valueAsNumber: true,
                  validate: (value) => {
                    if (isNaN(value) || !isFinite(value)) {
                      return '올바른 숫자를 입력해주세요';
                    }
                    return true;
                  }
                })}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder="7.0"
              />
              {errors.thresholdReturn && (
                <p className="text-red-500 text-xs mt-1">{errors.thresholdReturn.message}</p>
              )}
            </div>

            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
                <div>투자기간</div>
                <div>(년)</div>
              </label>
              <input
                type="number"
                step="0.1"
                {...register('investmentPeriod', { 
                  required: '투자 기간을 입력해주세요',
                  min: { value: 0.1, message: '0.1년 이상의 값을 입력해주세요' },
                  valueAsNumber: true,
                  validate: (value) => {
                    if (isNaN(value) || !isFinite(value)) {
                      return '올바른 숫자를 입력해주세요';
                    }
                    return true;
                  }
                })}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder="2.0"
              />
              {errors.investmentPeriod && (
                <p className="text-red-500 text-xs mt-1">{errors.investmentPeriod.message}</p>
              )}
            </div>

            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
                <div>달성수익률</div>
                <div>(누적, %)</div>
              </label>
              <input
                type="number"
                step="0.1"
                {...register('simulationReturn', { 
                  required: '달성 수익률을 입력해주세요',
                  valueAsNumber: true,
                  validate: (value) => {
                    if (isNaN(value) || !isFinite(value)) {
                      return '올바른 숫자를 입력해주세요';
                    }
                    return true;
                  }
                })}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder="24.0"
              />
              {errors.simulationReturn && (
                <p className="text-red-500 text-xs mt-1">{errors.simulationReturn.message}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            시뮬레이션 실행
          </span>
        </button>
        </form>
      </div>
    </div>
  );
};
