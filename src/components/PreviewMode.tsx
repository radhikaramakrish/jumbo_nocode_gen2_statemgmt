import React, { useState } from 'react';
import { DroppedControl, Section } from '../types';
import { CheckCircle, AlertCircle, Circle, ChevronRight, Trash2 } from 'lucide-react';

interface PreviewModeProps {
  droppedControls: DroppedControl[];
  sections: Section[];
  onDeleteControl?: (controlId: string) => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  droppedControls,
  sections,
  onDeleteControl
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (controlId: string, value: any) => {
    setFormData(prev => ({ ...prev, [controlId]: value }));
  };

  const handleDeleteControl = (controlId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteControl) {
      onDeleteControl(controlId);
    }
  };

  // Check if control should be visible based on dependencies
  const isControlVisible = (control: DroppedControl): boolean => {
    // If no dependencies, always visible
    if (!control.properties.dependencies || control.properties.dependencies.length === 0) {
      return true;
    }

    // Check each dependency
    return control.properties.dependencies.every((dep: any) => {
      const dependentValue = formData[dep.controlId];
      
      switch (dep.condition) {
        case 'equals':
          return dependentValue === dep.value;
        case 'not_equals':
          return dependentValue !== dep.value;
        case 'contains':
          return dependentValue && dependentValue.toString().includes(dep.value);
        case 'greater_than':
          return Number(dependentValue) > Number(dep.value);
        case 'less_than':
          return Number(dependentValue) < Number(dep.value);
        case 'is_empty':
          return !dependentValue || dependentValue === '';
        case 'is_not_empty':
          return dependentValue && dependentValue !== '';
        default:
          return true;
      }
    });
  };

  const getSectionStatus = (section: Section) => {
    const sectionControls = droppedControls.filter(c => c.sectionId === section.id && isControlVisible(c));
    const requiredControls = sectionControls.filter(c => c.properties.required);
    const completedRequired = requiredControls.filter(c => formData[c.id]);
    
    if (requiredControls.length === 0) return 'completed';
    if (completedRequired.length === requiredControls.length) return 'completed';
    if (completedRequired.length > 0) return 'partial';
    return 'empty';
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderControl = (control: DroppedControl) => {
    const value = formData[control.id] || '';

    const inputProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleInputChange(control.id, e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors",
      required: control.properties.required
    };

    switch (control.type) {
      case 'textInput':
        return (
          <input
            type="text"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={control.properties.placeholder}
            rows={control.properties.rows || 4}
            {...inputProps}
          />
        );
      
      case 'numberInput':
        return (
          <input
            type="number"
            min={control.properties.min}
            max={control.properties.max}
            step={control.properties.step}
            {...inputProps}
          />
        );

      case 'emailInput':
        return (
          <input
            type="email"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );

      case 'phoneInput':
        return (
          <input
            type="tel"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );

      case 'urlInput':
        return (
          <input
            type="url"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );

      case 'passwordInput':
        return (
          <input
            type="password"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );

      case 'richTextEditor':
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-800 min-h-[100px] transition-colors">
            <textarea
              placeholder={control.properties.placeholder || 'Enter formatted text...'}
              rows={6}
              {...inputProps}
              className="w-full border-0 bg-transparent resize-none focus:ring-0 focus:outline-none"
            />
          </div>
        );
      
      case 'dropdown':
        const options = control.properties.options?.split(',') || [];
        return (
          <select {...inputProps}>
            <option value="">Select an option...</option>
            {options.map((option: string, index: number) => (
              <option key={index} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );

      case 'multiSelectDropdown':
        const multiOptions = control.properties.options?.split(',') || [];
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 min-h-[40px] transition-colors">
            <div className="space-y-1">
              {multiOptions.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.trim())}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.trim()]
                        : selectedValues.filter((v: string) => v !== option.trim());
                      handleInputChange(control.id, newValues);
                    }}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm">{option.trim()}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'radioGroup':
        const radioOptions = control.properties.options?.split(',') || [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={control.id}
                  value={option.trim()}
                  checked={value === option.trim()}
                  onChange={(e) => handleInputChange(control.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option.trim()}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkboxGroup':
        const checkboxOptions = control.properties.options?.split(',') || [];
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option.trim()}
                  checked={checkedValues.includes(option.trim())}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkedValues, option.trim()]
                      : checkedValues.filter((v: string) => v !== option.trim());
                    handleInputChange(control.id, newValues);
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option.trim()}</span>
              </label>
            ))}
          </div>
        );

      case 'buttonGroup':
        const buttonOptions = control.properties.options?.split(',') || [];
        const isMultiSelect = control.properties.selectionType === 'multiple';
        const buttonValues = isMultiSelect ? (Array.isArray(value) ? value : []) : value;
        
        return (
          <div className="flex flex-wrap gap-2">
            {buttonOptions.map((option: string, index: number) => {
              const isSelected = isMultiSelect 
                ? buttonValues.includes(option.trim())
                : buttonValues === option.trim();
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (isMultiSelect) {
                      const newValues = isSelected
                        ? buttonValues.filter((v: string) => v !== option.trim())
                        : [...buttonValues, option.trim()];
                      handleInputChange(control.id, newValues);
                    } else {
                      handleInputChange(control.id, option.trim());
                    }
                  }}
                  className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.trim()}
                </button>
              );
            })}
          </div>
        );

      case 'ratingScale':
        const maxRating = control.properties.maxValue || 5;
        const isStars = control.properties.scaleType === 'stars';
        const currentRating = parseInt(value) || 0;
        
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: maxRating }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleInputChange(control.id, i + 1)}
                className={`text-2xl transition-colors ${
                  i < currentRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                {isStars ? '★' : i + 1}
              </button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={control.properties.min || 0}
              max={control.properties.max || 100}
              step={control.properties.step || 1}
              value={value || control.properties.defaultValue || 50}
              onChange={(e) => handleInputChange(control.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{control.properties.min || 0}</span>
              <span className="font-medium">{value || control.properties.defaultValue || 50}</span>
              <span>{control.properties.max || 100}</span>
            </div>
          </div>
        );

      case 'toggleSwitch':
        const isToggled = Boolean(value);
        return (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">{control.properties.offLabel || 'Off'}</span>
            <button
              type="button"
              onClick={() => handleInputChange(control.id, !isToggled)}
              className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                isToggled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isToggled ? 'translate-x-5' : 'translate-x-1'
              }`}></div>
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{control.properties.onLabel || 'On'}</span>
          </div>
        );

      case 'tagInput':
        const tags = Array.isArray(value) ? value : [];
        const [newTag, setNewTag] = useState('');
        
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 transition-colors">
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = tags.filter((_: string, i: number) => i !== index);
                      handleInputChange(control.id, newTags);
                    }}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTag.trim()) {
                  e.preventDefault();
                  const newTags = [...tags, newTag.trim()];
                  handleInputChange(control.id, newTags);
                  setNewTag('');
                }
              }}
              placeholder="Type and press Enter to add tags"
              className="w-full border-0 bg-transparent focus:ring-0 focus:outline-none text-sm"
            />
          </div>
        );
      
      case 'datePicker':
        return <input type="date" {...inputProps} />;
      
      case 'timePicker':
        return <input type="time" {...inputProps} />;

      case 'dateRangePicker':
        const [startDate, endDate] = Array.isArray(value) ? value : ['', ''];
        return (
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => handleInputChange(control.id, [e.target.value, endDate])}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" 
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => handleInputChange(control.id, [startDate, e.target.value])}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" 
            />
          </div>
        );

      // Grid & Matrix Controls
      case 'singleSelectiveGrid':
      case 'multiSelectiveGrid':
        const rowLabels = control.properties.rowLabels?.split(',') || ['Row 1', 'Row 2'];
        const columnOptions = control.properties.columnOptions?.split(',') || ['Col 1', 'Col 2'];
        const gridValue = value || {};
        
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left text-xs"></th>
                  {columnOptions.map((col: string, index: number) => (
                    <th key={index} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowLabels.map((row: string, rowIndex: number) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">{row.trim()}</td>
                    {columnOptions.map((col: string, colIndex: number) => (
                      <td key={colIndex} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center">
                        <input 
                          type={control.type === 'singleSelectiveGrid' ? 'radio' : 'checkbox'}
                          name={control.type === 'singleSelectiveGrid' ? `grid-${control.id}-${rowIndex}` : undefined}
                          checked={control.type === 'singleSelectiveGrid' 
                            ? gridValue[rowIndex] === colIndex
                            : gridValue[rowIndex]?.includes(colIndex)
                          }
                          onChange={(e) => {
                            const newGridValue = { ...gridValue };
                            if (control.type === 'singleSelectiveGrid') {
                              newGridValue[rowIndex] = e.target.checked ? colIndex : null;
                            } else {
                              if (!newGridValue[rowIndex]) newGridValue[rowIndex] = [];
                              if (e.target.checked) {
                                newGridValue[rowIndex] = [...newGridValue[rowIndex], colIndex];
                              } else {
                                newGridValue[rowIndex] = newGridValue[rowIndex].filter((i: number) => i !== colIndex);
                              }
                            }
                            handleInputChange(control.id, newGridValue);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'matrixQuestions':
        const questions = control.properties.questions?.split(',') || ['Question 1', 'Question 2'];
        const answers = control.properties.answers?.split(',') || ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];
        const matrixValue = value || {};
        
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left text-xs w-1/3">Question</th>
                  {answers.map((answer: string, index: number) => (
                    <th key={index} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">
                      {answer.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((question: string, qIndex: number) => (
                  <tr key={qIndex}>
                    <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">{question.trim()}</td>
                    {answers.map((answer: string, aIndex: number) => (
                      <td key={aIndex} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center">
                        <input 
                          type="radio"
                          name={`matrix-${control.id}-${qIndex}`}
                          checked={matrixValue[qIndex] === aIndex}
                          onChange={() => {
                            const newMatrixValue = { ...matrixValue };
                            newMatrixValue[qIndex] = aIndex;
                            handleInputChange(control.id, newMatrixValue);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'rankingControl':
        const items = control.properties.items?.split(',') || ['Item 1', 'Item 2', 'Item 3'];
        const rankedItems = Array.isArray(value) ? value : items.map((item, index) => ({ item: item.trim(), rank: index + 1 }));
        
        return (
          <div className="space-y-2">
            {rankedItems.map((rankedItem: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-700 dark:text-gray-300">{rankedItem.item}</span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (index > 0) {
                        const newRanked = [...rankedItems];
                        [newRanked[index], newRanked[index - 1]] = [newRanked[index - 1], newRanked[index]];
                        handleInputChange(control.id, newRanked);
                      }
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (index < rankedItems.length - 1) {
                        const newRanked = [...rankedItems];
                        [newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]];
                        handleInputChange(control.id, newRanked);
                      }
                    }}
                    disabled={index === rankedItems.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'fileUpload':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors">
            <input
              type="file"
              accept={control.properties.accept}
              multiple={control.properties.multiple}
              className="hidden"
              id={control.id}
              onChange={(e) => handleInputChange(control.id, e.target.files)}
            />
            <label htmlFor={control.id} className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-300">Click to upload or drag files here</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {control.properties.accept || 'All files'} • Max {control.properties.maxSize || 10}MB
              </p>
            </label>
          </div>
        );

      case 'imageUpload':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors">
            <input
              type="file"
              accept={control.properties.accept || 'image/*'}
              multiple={control.properties.multiple}
              className="hidden"
              id={control.id}
              onChange={(e) => handleInputChange(control.id, e.target.files)}
            />
            <label htmlFor={control.id} className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-300">Click to upload images</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {control.properties.accept || 'Images'} • Max {control.properties.maxSize || 5}MB
              </p>
            </label>
          </div>
        );

      case 'signaturePad':
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 p-4 text-center transition-colors">
            <div 
              className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 flex items-center justify-center transition-colors"
              style={{ 
                width: '100%', 
                height: control.properties.canvasHeight || 200 
              }}
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm">Click to sign</p>
            </div>
          </div>
        );

      case 'colorPicker':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value || control.properties.defaultColor || '#3B82F6'}
              onChange={(e) => handleInputChange(control.id, e.target.value)}
              className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{value || control.properties.defaultColor || '#3B82F6'}</span>
          </div>
        );

      case 'tableInput':
        const columnHeaders = control.properties.columnHeaders?.split(',') || ['Column 1', 'Column 2'];
        const tableData = Array.isArray(value) ? value : [{}];
        
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {columnHeaders.map((header: string, index: number) => (
                    <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                      {header.trim()}
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {columnHeaders.map((header: string, colIndex: number) => (
                      <td key={colIndex} className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                        <input
                          type="text"
                          value={row[header.trim()] || ''}
                          onChange={(e) => {
                            const newTableData = [...tableData];
                            newTableData[rowIndex] = { ...newTableData[rowIndex], [header.trim()]: e.target.value };
                            handleInputChange(control.id, newTableData);
                          }}
                          className="w-full px-2 py-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 border-b border-gray-300 dark:border-gray-600">
                      <button
                        type="button"
                        onClick={() => {
                          const newTableData = tableData.filter((_, index) => index !== rowIndex);
                          handleInputChange(control.id, newTableData);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => {
                  const newTableData = [...tableData, {}];
                  handleInputChange(control.id, newTableData);
                }}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                + Add Row
              </button>
            </div>
          </div>
        );

      // Address Controls
      case 'addressLine1':
      case 'addressLine2':
      case 'city':
      case 'zipPostal':
        return (
          <input
            type="text"
            placeholder={control.properties.placeholder}
            {...inputProps}
          />
        );

      case 'stateProvince':
        if (control.properties.inputType === 'dropdown') {
          return (
            <select {...inputProps}>
              <option value="">Select state...</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
            </select>
          );
        }
        return (
          <input
            type="text"
            placeholder="Enter state/province"
            {...inputProps}
          />
        );

      case 'country':
        return (
          <select {...inputProps}>
            <option value="">Select country...</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        );

      case 'completeAddress':
        const addressData = value || {};
        return (
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Street address" 
              value={addressData.line1 || ''}
              onChange={(e) => handleInputChange(control.id, { ...addressData, line1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            />
            {control.properties.includeAddressLine2 && (
              <input 
                type="text" 
                placeholder="Apartment, suite, etc." 
                value={addressData.line2 || ''}
                onChange={(e) => handleInputChange(control.id, { ...addressData, line2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="City" 
                value={addressData.city || ''}
                onChange={(e) => handleInputChange(control.id, { ...addressData, city: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
              <input 
                type="text" 
                placeholder="State" 
                value={addressData.state || ''}
                onChange={(e) => handleInputChange(control.id, { ...addressData, state: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="ZIP Code" 
                value={addressData.zip || ''}
                onChange={(e) => handleInputChange(control.id, { ...addressData, zip: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
              <select 
                value={addressData.country || ''}
                onChange={(e) => handleInputChange(control.id, { ...addressData, country: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>
        );
      
      case 'heading':
        const HeadingTag = control.properties.level || 'h2';
        return React.createElement(
          HeadingTag,
          {
            className: `font-bold text-${control.properties.alignment || 'left'} mb-2 text-gray-900 dark:text-white transition-colors`,
            style: {
              fontSize: control.properties.fontSize === 'small' ? '14px' : 
                       control.properties.fontSize === 'large' ? '24px' :
                       control.properties.fontSize === 'xl' ? '32px' : '18px',
              color: control.properties.color || undefined
            }
          },
          control.properties.text || 'Heading Text'
        );
      
      case 'sectionDivider':
        return (
          <hr 
            className="w-full my-4"
            style={{
              borderStyle: control.properties.style || 'solid',
              borderWidth: `${control.properties.thickness || 1}px 0 0 0`,
              borderColor: control.properties.color || '#e5e7eb',
              margin: control.properties.spacing === 'small' ? '8px 0' :
                      control.properties.spacing === 'large' ? '24px 0' : '16px 0'
            }}
          />
        );

      case 'progressBar':
        const progress = 45; // Mock progress value
        return (
          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
              <span>{control.properties.label || 'Progress'}</span>
              {control.properties.showPercentage && <span>{progress}%</span>}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all" 
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: control.properties.color || '#3B82F6' 
                }}
              ></div>
            </div>
          </div>
        );

      // Security Controls
      case 'captcha':
        return (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-800 text-center transition-colors">
            <div className="w-32 h-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">CAPTCHA</span>
            </div>
            <input 
              type="text" 
              placeholder="Enter code" 
              value={value}
              onChange={(e) => handleInputChange(control.id, e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" 
            />
          </div>
        );

      case 'termsConditions':
        return (
          <div className="space-y-2">
            <label className="flex items-start space-x-2">
              <input 
                type="checkbox" 
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(control.id, e.target.checked)}
                className="mt-1 text-blue-600 focus:ring-blue-500 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {control.properties.text || 'I agree to the terms and conditions'}
                {control.properties.linkText && (
                  <a href={control.properties.linkUrl || '#'} className="text-blue-600 dark:text-blue-400 ml-1 underline" target="_blank" rel="noopener noreferrer">
                    {control.properties.linkText}
                  </a>
                )}
              </span>
            </label>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-center text-gray-500 dark:text-gray-400 transition-colors">
            {control.name}
          </div>
        );
    }
  };

  if (sections.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Circle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2 transition-colors">No Sections Created</h3>
          <p className="text-gray-500 dark:text-gray-400 transition-colors">Create sections to organize your form controls.</p>
        </div>
      </div>
    );
  }

  const currentSection = sections[activeSection];
  const sectionControls = droppedControls
    .filter(c => c.sectionId === currentSection?.id)
    .filter(isControlVisible); // Apply visibility filter

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-800 flex h-full transition-colors">
      {/* Section Tabs - Fixed width sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="font-medium text-gray-900 dark:text-white transition-colors">Form Sections</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            Navigate through form sections
          </p>
        </div>
        <div className="p-2 flex-1 overflow-y-auto">
          {sections.map((section, index) => {
            const status = getSectionStatus(section);
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 text-left transition-colors ${
                  activeSection === index
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {renderStatusIcon(status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors">{section.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{section.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content - Scrollable area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentSection && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{currentSection.name}</h2>
                  {currentSection.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">{currentSection.description}</p>
                  )}
                  
                  {sectionControls.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 transition-colors">No visible controls in this section</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sectionControls
                        .sort((a, b) => a.y - b.y || a.x - b.x)
                        .map(control => (
                          <div key={control.id} className="space-y-2 relative group">
                            {/* Delete button for controls (except first control) */}
                            {control.y > 0 && onDeleteControl && (
                              <button
                                onClick={(e) => handleDeleteControl(control.id, e)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hover:bg-red-600"
                                title="Delete Control"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            
                            {control.properties.label && (
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                                {control.properties.required && (
                                  <span className="text-red-500 mr-1">*</span>
                                )}
                                {control.properties.label}
                                {/* Dependency indicator */}
                                {control.properties.dependencies && control.properties.dependencies.length > 0 && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">
                                    Conditional
                                  </span>
                                )}
                              </label>
                            )}
                            {renderControl(control)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex justify-between">
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
              disabled={activeSection === sections.length - 1}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};