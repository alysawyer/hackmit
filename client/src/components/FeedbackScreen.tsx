import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/solid';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
              
              <CardTitle className="text-2xl font-bold">
                Detailed Feedback
              </CardTitle>
              
              <Button onClick={onRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{summary.total}</div>
                    <div className="text-sm text-muted-foreground">Total Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{summary.correct}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{summary.incorrect}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((summary.correct / summary.total) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question List */}
            <div className="space-y-4">
              {summary.transcript.map((entry, index) => {
                const isExpanded = expandedItems.has(entry.questionId);
                const isCorrect = entry.verdict === 'CORRECT';

                return (
                  <Card
                    key={entry.questionId}
                    className={`transition-all ${
                      isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={() => toggleExpanded(entry.questionId)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            Question {index + 1}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {entry.questionPrompt}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {entry.verdict}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <CardContent className="pt-0 border-t border-border">
                        <div className="space-y-4">
                          {/* Full Question */}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Question:
                            </h4>
                            <p className="text-foreground bg-muted/30 p-3 rounded-lg">{entry.questionPrompt}</p>
                          </div>

                          {/* User Answer */}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Your Answer:
                            </h4>
                            <div className="bg-muted/50 rounded-lg p-3 border">
                              {entry.userAnswer ? (
                                <p className="text-foreground">
                                  {renderHighlightedText(entry.userAnswer)}
                                </p>
                              ) : (
                                <p className="text-muted-foreground italic">No answer provided</p>
                              )}
                            </div>
                          </div>

                          {/* Feedback */}
                          {entry.briefFeedback && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">
                                Feedback:
                              </h4>
                              <div className={`p-3 rounded-lg border ${
                                isCorrect 
                                  ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300' 
                                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                <p>{entry.briefFeedback}</p>
                              </div>
                            </div>
                          )}

                          {/* Improvement Tips for Wrong Answers */}
                          {!isCorrect && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Study Tips:
                              </h4>
                              <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
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
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-border">
              <Button onClick={onBack} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
              <Button onClick={onRestart} size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
