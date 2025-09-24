import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { InvestmentInput } from '../types/investment';

interface InputFormProps {
  onSubmit: (data: InvestmentInput) => void;
  defaultValues?: Partial<InvestmentInput>;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, defaultValues }) => {
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
    
    // 전체 구간 분배율에도 새로운 종류 추가
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
      
      // 전체 구간 분배율에서도 해당 종류 제거
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
        <h2 className="text-lg font-bold text-white">투자 조건 설정</h2>
        <p className="text-slate-300 text-sm mt-1">투자 종류별 금액과 분배 조건을 설정하세요</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {/* 동적 투자금 설정 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">투자금 설정</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.name} 투자금 (억원)</label>
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
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                {...register(`investmentTypes.${index}.inputMode`)}
                                value="percentage"
                                className="mr-2"
                              />
                              <span className="text-xs sm:text-sm">1종 대비 %</span>
                            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register(`investmentTypes.${index}.inputMode`)}
                value="amount"
                className="mr-2"
              />
              <span className="text-xs sm:text-sm">직접 입력</span>
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
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">초과수익 분배율 설정</h3>
          
          {/* 분배 방식 선택 */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!watchedValues.useRangeBasedDistribution}
                  onChange={() => setValue('useRangeBasedDistribution', false)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">전체 구간 동일 분배율</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={watchedValues.useRangeBasedDistribution === true}
                  onChange={() => setValue('useRangeBasedDistribution', true)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">누적수익률 범위별 분배율</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              전체 구간 동일 분배율: 모든 수익률 구간에 동일한 분배율 적용<br className="hidden sm:block"/>
              <span className="sm:hidden"> / </span>범위별 분배율: 누적수익률 구간에 따라 다른 분배율 적용 (최소: 초과, 최대: 이하)
            </p>
          </div>

          {/* 전체 구간 분배율 */}
          {!watchedValues.useRangeBasedDistribution && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm sm:text-md font-semibold text-gray-800 mb-3">전체 구간 분배율</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {watchedValues.investmentTypes?.map((type) => (
                  <div key={type.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              
              {/* 전체 구간 분배율 합계 */}
              <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm text-gray-600">
                  <strong>분배율 합계:</strong> {
                    (() => {
                      const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                      const globalDistribution = watchedValues.globalDistribution || {};
                      return currentTypeIds
                        .reduce((sum, typeId) => sum + (Number(globalDistribution[typeId]) || 0), 0)
                        .toFixed(1);
                    })()
                  }%
                </p>
              </div>
            </div>
          )}

            {/* 범위별 분배율 */}
            {watchedValues.useRangeBasedDistribution && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-800">누적수익률 범위별 분배율</h4>
                  <button
                    type="button"
                    onClick={addDistributionRange}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    + 범위 추가
                  </button>
                </div>

                <div className="space-y-4">
                  {rangeFields.map((rangeField, rangeIndex) => (
                    <div key={rangeField.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start mb-3">
                        {/* 범위 설정 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">최소 (% 초과)</label>
                          <input
                            type="number"
                            step="0.1"
                            {...register(`distributionRanges.${rangeIndex}.minReturn`, {
                              required: '최소값을 입력해주세요',
                              min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                              valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">최대 (% 이하)</label>
                          <input
                            type="number"
                            step="0.1"
                            {...register(`distributionRanges.${rangeIndex}.maxReturn`, {
                              min: { value: 0, message: '0 이상의 값을 입력해주세요' },
                              valueAsNumber: true,
                              setValueAs: (value) => value === '' || value === null || value === undefined ? null : Number(value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="무제한"
                          />
                          <p className="text-xs text-gray-500 mt-1">비워두면 무제한</p>
                        </div>

                        {/* 종류별 분배율 */}
                        {watchedValues.investmentTypes?.map((type) => (
                          <div key={type.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>

                      {/* 삭제 버튼과 분배율 합계를 한 줄에 */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        {/* 범위별 분배율 합계 표시 */}
                        <div className="p-2 bg-orange-50 rounded border border-orange-200 flex-1">
                          <p className="text-sm text-gray-600">
                            <strong>분배율 합계:</strong> {
                              (() => {
                                const currentDistributions = watchedValues.distributionRanges?.[rangeIndex]?.distributions || {};
                                const currentTypeIds = watchedValues.investmentTypes?.map(type => type.id) || [];
                                return currentTypeIds
                                  .reduce((sum, typeId) => sum + (Number(currentDistributions[typeId]) || 0), 0)
                                  .toFixed(1);
                              })()
                            }%
                          </p>
                        </div>

                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => removeDistributionRange(rangeIndex)}
                          disabled={rangeFields.length <= 1}
                          className={`px-3 py-2 text-white text-sm rounded-md focus:outline-none focus:ring-2 ${
                            rangeFields.length <= 1 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          }`}
                        >
                          삭제
                        </button>
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
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">기타 설정</h3>
          
          {/* 기준 수익률 및 투자 기간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                1종 기준 수익률 (연환산 %)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('thresholdReturn', { 
                  required: '1종 기준 수익률을 입력해주세요',
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
                placeholder="7.0"
              />
              {errors.thresholdReturn && (
                <p className="text-red-500 text-xs mt-1">{errors.thresholdReturn.message}</p>
              )}
            </div>

            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                투자 기간 (년)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="2.0"
              />
              {errors.investmentPeriod && (
                <p className="text-red-500 text-xs mt-1">{errors.investmentPeriod.message}</p>
              )}
            </div>
          </div>

          {/* 달성 수익률 */}
          <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              달성 수익률 (누적 수익률 %)
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="24.0"
            />
            {errors.simulationReturn && (
              <p className="text-red-500 text-xs mt-1">{errors.simulationReturn.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-6 rounded-xl hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
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
  );
};
