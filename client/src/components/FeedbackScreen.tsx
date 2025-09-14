import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/solid';
import { useGameStore } from '../stores/gameStore';

interface FeedbackScreenProps {
  onBack: () => void;
  onRestart: () => void;
}

export function FeedbackScreen({ onBack, onRestart }: FeedbackScreenProps) {
  const { getGameSummary } = useGameStore();
  const summary = getGameSummary();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedItems(newExpanded);
  };

  const renderHighlightedText = (text: string, wrongSpans?: Array<{ start: number; end: number }>) => {
    if (!wrongSpans || wrongSpans.length === 0) {
      return <span>{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort spans by start position
    const sortedSpans = [...wrongSpans].sort((a, b) => a.start - b.start);

    sortedSpans.forEach((span, index) => {
      // Add text before this span
      if (span.start > lastIndex) {
        parts.push(
          <span key={`before-${index}`}>
            {text.substring(lastIndex, span.start)}
          </span>
        );
      }

      // Add highlighted wrong span
      parts.push(
        <span 
          key={`wrong-${index}`}
          className="bg-red-100 text-red-800 px-1 rounded"
        >
          {text.substring(span.start, span.end)}
        </span>
      );

      lastIndex = span.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="after">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Results
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Detailed Feedback
          </h1>
          
          <button
            onClick={onRestart}
            className="btn-primary"
          >
            New Quiz
          </button>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.correct}</div>
              <div className="text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.incorrect}</div>
              <div className="text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((summary.correct / summary.total) * 100)}%
              </div>
              <div className="text-gray-600">Score</div>
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-4">
          {summary.transcript.map((entry, index) => {
            const isExpanded = expandedItems.has(entry.questionId);
            const isCorrect = entry.verdict === 'CORRECT';

            return (
              <div
                key={entry.questionId}
                className={`border rounded-lg ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleExpanded(entry.questionId)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isCorrect ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        Question {index + 1}
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-md">
                        {entry.questionPrompt}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.verdict}
                    </span>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                    <div className="pt-4 space-y-4">
                      {/* Full Question */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Question:
                        </h4>
                        <p className="text-gray-900">{entry.questionPrompt}</p>
                      </div>

                      {/* User Answer */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Your Answer:
                        </h4>
                        <div className="bg-gray-50 rounded p-3">
                          {entry.userAnswer ? (
                            <p className="text-gray-900">
                              {renderHighlightedText(entry.userAnswer)}
                            </p>
                          ) : (
                            <p className="text-gray-500 italic">No answer provided</p>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      {entry.briefFeedback && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Feedback:
                          </h4>
                          <div className={`p-3 rounded ${
                            isCorrect 
                              ? 'bg-green-50 text-green-800' 
                              : 'bg-red-50 text-red-800'
                          }`}>
                            <p>{entry.briefFeedback}</p>
                          </div>
                        </div>
                      )}

                      {/* Improvement Tips for Wrong Answers */}
                      {!isCorrect && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            💡 Study Tips:
                          </h4>
                          <div className="bg-blue-50 text-blue-800 p-3 rounded">
                            <ul className="text-sm space-y-1">
                              <li>• Review the highlighted sections in your answer</li>
                              <li>• Focus on the key concepts mentioned in the feedback</li>
                              <li>• Practice explaining this topic in your own words</li>
                              <li>• Consider the specific wording of the question</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="btn-secondary"
          >
            Back to Results
          </button>
          <button
            onClick={onRestart}
            className="btn-primary"
          >
            Take New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
