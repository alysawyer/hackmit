import React from 'react';
import { CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Quiz Complete!
          </h1>
          <p className={`text-2xl font-semibold ${performanceMessage.color}`}>
            {performanceMessage.text}
          </p>
        </div>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-50 rounded-lg p-8">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {percentage}%
            </div>
            <div className="text-lg text-gray-600">
              {summary.correct} out of {summary.total} correct
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-900">
                {summary.correct} Correct
              </span>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <XCircleIcon className="w-6 h-6 text-red-600" />
              <span className="text-lg font-semibold text-red-900">
                {summary.incorrect} Incorrect
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {summary.total > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewFeedback}
            className="btn-primary text-lg px-8 py-3"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            View Detailed Feedback
          </button>
          
          <button
            onClick={onRestart}
            className="btn-secondary text-lg px-8 py-3"
          >
            Take Another Quiz
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              Quiz completed with {summary.total} questions • 
              {summary.correct > 0 && ` ${summary.correct} answered correctly`}
              {summary.incorrect > 0 && ` • ${summary.incorrect} need review`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
