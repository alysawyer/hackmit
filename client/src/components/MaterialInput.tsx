import React, { useState, useCallback } from 'react';
import { DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { extractTextFromPDF } from '../utils/pdfParser';
import { useGameStore } from '../stores/gameStore';
import { Difficulty } from '../../../shared/types';

interface MaterialInputProps {
  onSubmit: (material: string, difficulty: Difficulty) => void;
  isLoading?: boolean;
}

export function MaterialInput({ onSubmit, isLoading = false }: MaterialInputProps) {
  const [textInput, setTextInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  
  const { setMaterial } = useGameStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      await processPDF(pdfFile);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await processPDF(file);
    }
    // Reset input
    e.target.value = '';
  }, []);

  const processPDF = async (file: File) => {
    setIsProcessingPDF(true);
    try {
      const text = await extractTextFromPDF(file);
      setTextInput(text);
    } catch (error) {
      alert('Error processing PDF. Please try a different file or paste text manually.');
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim() || textInput.trim().length < 100) {
      alert('Please provide at least 100 characters of study material.');
      return;
    }

    setMaterial(textInput, difficulty);
    onSubmit(textInput, difficulty);
  };

  const canSubmit = textInput.trim().length >= 100 && !isLoading && !isProcessingPDF;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Voice Quiz Game
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Study Material
            </label>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              
              {isProcessingPDF ? (
                <div className="space-y-2">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-600">Processing PDF...</p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop a PDF file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessingPDF || isLoading}
                  />
                  
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isProcessingPDF || isLoading}
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Choose PDF File
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label htmlFor="material-text" className="block text-sm font-medium text-gray-700">
              Or paste text directly
            </label>
            <textarea
              id="material-text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your study material here (minimum 100 characters)..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
              disabled={isProcessingPDF || isLoading}
            />
            <p className="text-sm text-gray-500">
              Characters: {textInput.length} (minimum 100 required)
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <div className="flex space-x-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={isLoading || isProcessingPDF}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full btn text-lg py-3 ${
                canSubmit 
                  ? 'btn-primary' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating Questions...
                </div>
              ) : (
                'Generate Quiz Questions'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
