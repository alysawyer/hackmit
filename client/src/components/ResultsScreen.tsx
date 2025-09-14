import React from 'react';
import { CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { CheckCircle, XCircle, FileText, RotateCcw, Trophy, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGameStore } from '../stores/gameStore';

interface ResultsScreenProps {
  onRestart: () => void;
  onViewFeedback: () => void;
}

export function ResultsScreen({ onRestart, onViewFeedback }: ResultsScreenProps) {
  const { getGameSummary } = useGameStore();
  const summary = getGameSummary();
  
  const percentage = summary.total > 0 
    ? Math.round((summary.correct / summary.total) * 100)
    : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Excellent! 🎉", color: "text-green-600" };
    if (percentage >= 80) return { text: "Great job! 👏", color: "text-green-600" };
    if (percentage >= 70) return { text: "Good work! 👍", color: "text-blue-600" };
    if (percentage >= 60) return { text: "Not bad! 📚", color: "text-yellow-600" };
    return { text: "Keep studying! 💪", color: "text-red-600" };
  };

  const performanceMessage = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center pb-6">
          {/* Header with Trophy Icon */}
          <div className="flex justify-center mb-4">
            {percentage >= 80 ? (
              <Trophy className="w-16 h-16 text-yellow-500" />
            ) : (
              <Target className="w-16 h-16 text-primary" />
            )}
          </div>
          
          <CardTitle className="text-4xl font-bold mb-4">
            Quiz Complete!
          </CardTitle>
          <p className={`text-2xl font-semibold ${performanceMessage.color}`}>
            {performanceMessage.text}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Score Display */}
          <div className="text-center">
            <div className="inline-block bg-muted/50 rounded-2xl p-8 border">
              <div className="text-6xl font-bold text-foreground mb-2">
                {percentage}%
              </div>
              <div className="text-lg text-muted-foreground">
                {summary.correct} out of {summary.total} correct
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="flex items-center justify-center p-6">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {summary.correct}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Correct
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex items-center justify-center p-6">
                <XCircle className="w-6 h-6 text-red-600 mr-3" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {summary.incorrect}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Incorrect
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          {summary.total > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance Insights
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  {percentage >= 80 && (
                    <p>• You demonstrated strong understanding of the material!</p>
                  )}
                  {percentage < 80 && percentage >= 60 && (
                    <p>• You have a good foundation but could benefit from more review.</p>
                  )}
                  {percentage < 60 && (
                    <p>• Consider reviewing the material more thoroughly before retaking.</p>
                  )}
                  {summary.incorrect > 0 && (
                    <p>• Review the feedback section to understand your mistakes.</p>
                  )}
                  <p>• Each question was designed to be answerable in ~15 seconds by a well-prepared student.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={onViewFeedback}
              size="lg"
              className="h-12 px-8"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Detailed Feedback
            </Button>
            
            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="h-12 px-8"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Take Another Quiz
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Quiz completed with {summary.total} questions • 
                {summary.correct > 0 && ` ${summary.correct} answered correctly`}
                {summary.incorrect > 0 && ` • ${summary.incorrect} need review`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
