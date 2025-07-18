import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X, RefreshCw, Eye, Zap } from 'lucide-react';

interface ImportResults {
  success: number;
  total: number;
  errors: string[];
}

interface ImportSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: ImportResults | null;
  directImportMode?: boolean;
}

export const ImportSuccessDialog: React.FC<ImportSuccessDialogProps> = ({
  isOpen,
  onClose,
  results,
  directImportMode = false
}) => {
  const [countdown, setCountdown] = useState(3);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isOpen && autoRefresh && results && results.success > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, autoRefresh, results, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
    }
  }, [isOpen]);

  if (!isOpen || !results) return null;

  const isSuccess = results.success > 0;
  const hasErrors = results.errors.length > 0;
  const isDirectImportSuccess = directImportMode && results.success === results.total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 transition-colors">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${
          isSuccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
        } rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${
                  isSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                }`}>
                  {isDirectImportSuccess ? 'Direct Import Successful!' : 
                   isSuccess ? 'Import Completed' : 'Import Failed'}
                </h3>
                <p className={`text-sm ${
                  isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {isSuccess 
                    ? `${results.success} of ${results.total} controls imported ${directImportMode ? 'directly to UI' : 'to database'}`
                    : `Failed to import controls`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAutoRefresh(false);
                onClose();
              }}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {isDirectImportSuccess ? 'Direct UI import completed successfully!' : 
                   `Successfully imported ${results.success} controls!`}
                </span>
              </div>
              
              {isDirectImportSuccess && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Direct UI Import Success
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        All controls were imported directly to the UI, bypassing the database completely. 
                        This approach eliminates synchronization issues and provides instant results.
                        {autoRefresh && (
                          <span className="font-medium"> Auto-closing in {countdown} seconds...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!directImportMode && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                        Database Import Complete
                      </h4>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Controls have been saved to the database and the UI will refresh automatically.
                        {autoRefresh && (
                          <span className="font-medium"> Auto-closing in {countdown} seconds...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Steps:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Controls are visible in the Design tab</li>
                  <li>• You can modify properties in the Properties panel</li>
                  <li>• Use Preview tab to test your form</li>
                  <li>• Export JSON when ready for deployment</li>
                  {directImportMode && (
                    <li>• Use "Save to Database" to persist changes</li>
                  )}
                </ul>
              </div>

              {hasErrors && !isDirectImportSuccess && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    Partial Import - Some Issues Found:
                  </h4>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    {results.errors.slice(0, 3).map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                    {results.errors.length > 3 && (
                      <div>• ... and {results.errors.length - 3} more issues</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Import failed</span>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Errors:</h4>
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  {results.errors.slice(0, 5).map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {results.errors.length > 5 && (
                    <div>• ... and {results.errors.length - 5} more errors</div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Suggestions:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Check that your Excel file follows the template format</li>
                  <li>• Ensure all required fields are filled</li>
                  <li>• Verify control types are valid</li>
                  <li>• Try downloading a fresh template and re-filling it</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isSuccess && autoRefresh && (
                <button
                  onClick={() => setAutoRefresh(false)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel auto-close
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isSuccess && (
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Controls</span>
                </button>
              )}
              {!isSuccess && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};