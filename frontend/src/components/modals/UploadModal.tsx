import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { DataQualityReport } from '../../types';
import { api } from '../../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const STAGES = [
  'File uploaded',
  'Validate columns & schema',
  'Clean data & impute nulls',
  'Analyze dataset & quality',
  'Train predictive ML model',
  'Generate employee forecasts',
  'Update dashboard analytics'
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg(null);
    const validExtensions = ['.csv', '.xlsx', '.xls', '.json', '.txt'];
    const hasValidExt = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMsg('Invalid file format. Please choose a valid .csv, .xlsx, .xls, .json, or .txt employee dataset.');
      return;
    }
    setFile(selectedFile);
  };

  const processUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setCurrentStage(0);

    try {
      // Simulate real stage progression while api executes
      const stageInterval = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev < STAGES.length - 2) return prev + 1;
          return prev;
        });
      }, 700);

      const response = await api.uploadDataset(file);
      clearInterval(stageInterval);

      setCurrentStage(STAGES.length - 1); // final stage
      setQualityReport(response.report);
      setIsProcessing(false);
      onUploadSuccess();
    } catch (err: any) {
      setIsProcessing(false);
      setCurrentStage(-1);
      setErrorMsg(err.message || 'Failed to upload and process employee dataset.');
    }
  };

  const handleLoadDemo = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setCurrentStage(0);

    try {
      const stageInterval = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev < STAGES.length - 2) return prev + 1;
          return prev;
        });
      }, 600);

      const response = await api.loadDemoData();
      clearInterval(stageInterval);

      setCurrentStage(STAGES.length - 1);
      setQualityReport(response.report);
      setIsProcessing(false);
      onUploadSuccess();
    } catch (err: any) {
      setIsProcessing(false);
      setCurrentStage(-1);
      setErrorMsg(err.message || 'Failed to generate demo dataset.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setCurrentStage(-1);
    setIsProcessing(false);
    setErrorMsg(null);
    setQualityReport(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload Employee Dataset
              </h3>
              <p className="text-xs text-slate-500">
                Supports CSV, Excel (.xlsx, .xls) files with workforce metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Processing Error</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {!qualityReport ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : file 
                    ? 'border-emerald-400 bg-emerald-50/30' 
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  onChange={handleChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · Click or drag to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-800">
                      Drag and drop your employee dataset here, or <span className="text-blue-600 font-bold">browse</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Accepted: CSV, XLSX, XLS, JSON, TXT (up to 25MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Progress UI if processing */}
              {isProcessing && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      Processing Workforce Data...
                    </span>
                    <span className="font-mono text-blue-600 font-bold">
                      Step {currentStage + 1} of {STAGES.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {STAGES.map((stg, idx) => {
                      const isDone = idx < currentStage;
                      const isCurrent = idx === currentStage;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className={`font-medium ${isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                            {stg}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alternative action: Load Demo */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Need a sample dataset?
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Load 520 realistic employee profiles with 16 correlated workforce features.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLoadDemo}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                >
                  Load Demo Data
                </button>
              </div>
            </>
          ) : (
            /* Data Quality Report */
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Dataset Validated & Processed Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Model: {qualityReport.model_used} · Accuracy: {qualityReport.accuracy}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-800">
                    {qualityReport.quality_score}%
                  </span>
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-wider">
                    Quality Score
                  </span>
                </div>
              </div>

              {/* Quality Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Total Records</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.total_rows}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Total Columns</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.total_columns}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Missing Values</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.missing_values_pct}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Duplicate Rows</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.duplicate_rows}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Numeric Features</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.numeric_features_count}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Categorical Features</span>
                  <span className="text-base font-bold text-slate-900">{qualityReport.categorical_features_count}</span>
                </div>
              </div>

              {/* Cleaning Actions Taken */}
              {qualityReport.cleaning_actions_taken.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Automated Data Cleaning Actions Applied:
                  </h5>
                  <ul className="space-y-1 text-slate-600 pl-5 list-disc text-[11px]">
                    {qualityReport.cleaning_actions_taken.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {!qualityReport ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={processUpload}
                disabled={!file || isProcessing}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isProcessing ? 'Processing File...' : 'Upload & Train Model'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Upload Another
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              >
                View Updated Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
