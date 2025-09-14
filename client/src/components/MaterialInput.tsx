import React, { useState, useCallback } from 'react';
import { DocumentTextIcon, ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Upload, FileText, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Your Quiz
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Upload your study material and we'll generate personalized quiz questions
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Upload Area */}
            <div className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessingPDF ? (
                  <div className="space-y-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Processing PDF...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Drop your PDF here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessingPDF || isLoading}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isProcessingPDF || isLoading}
                      className="pointer-events-none"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose PDF File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-sm text-muted-foreground">Or paste text directly</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              
              <div className="space-y-2">
                <textarea
                  id="material-text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your study material here (minimum 100 characters)..."
                  className="w-full h-40 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
                  disabled={isProcessingPDF || isLoading}
                />
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    textInput.length >= 100 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {textInput.length >= 100 ? (
                      <span className="flex items-center gap-1">
                        <CheckIcon className="w-4 h-4" />
                        Ready to generate questions
                      </span>
                    ) : (
                      `${textInput.length}/100 characters (minimum required)`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <label 
                    key={level} 
                    className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      difficulty === level
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="sr-only"
                      disabled={isLoading || isProcessingPDF}
                    />
                    <span className="text-sm font-medium capitalize">
                      {level}
                    </span>
                    {difficulty === level && (
                      <CheckIcon className="w-4 h-4 ml-2" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
