'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Download,
  Copy,
  Star,
  BookOpen,
  Lightbulb,
  Target,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocumentSummary({ summary, onRegenerate, onDownload }) {
  const [copiedItems, setCopiedItems] = React.useState(new Set());

  const handleCopy = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyButton = (text, itemId, label) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, itemId)}
      className="h-8 w-8 p-0"
    >
      {copiedItems.has(itemId) ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Document Summary</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" />
                {Math.round(summary.confidence * 100)}% confidence
              </Badge>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                Regenerate
              </Button>
            </div>
          </div>
          <CardDescription>
            AI-generated summary with key points and study aids
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed">{summary.summary}</p>
          </div>
          <div className="flex justify-end mt-2">
            {copyButton(summary.summary, 'summary', 'Copy Summary')}
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="flex-1">{point}</span>
                {copyButton(point, `keypoint-${index}`, 'Copy Point')}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Important Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Important Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summary.importantTerms.map((term, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {term}
                {copyButton(term, `term-${index}`, 'Copy Term')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Study Questions
          </CardTitle>
          <CardDescription>
            Use these questions to test your understanding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.studyQuestions.map((question, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                    Q{index + 1}
                  </span>
                  <p className="flex-1 text-sm">{question}</p>
                  {copyButton(question, `question-${index}`, 'Copy Question')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Related Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summary.relatedTopics.map((topic, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {topic}
                {copyButton(topic, `topic-${index}`, 'Copy Topic')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{summary.keyPoints.length}</p>
              <p className="text-xs text-muted-foreground">Key Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{summary.importantTerms.length}</p>
              <p className="text-xs text-muted-foreground">Terms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{summary.studyQuestions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{summary.relatedTopics.length}</p>
              <p className="text-xs text-muted-foreground">Topics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          Generated with AI • {summary.summaryLength} length • {Math.round(summary.confidence * 100)}% confidence
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
          <Button onClick={onRegenerate}>
            Regenerate Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
