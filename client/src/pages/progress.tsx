import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getAuthHeaders } from '@/lib/auth';
import { CheckCircle, Clock, TrendingUp, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherStats {
  completedStandards: number;
  totalStandards: number;
  lessonsThisMonth: number;
  subjectAreas: string[];
}

interface ProgressEntry {
  id: number;
  standardId: number;
  completedAt: string;
  lessonId: number;
  standard: {
    code: string;
    title: string;
    description: string;
    subjectArea: string;
    gradeLevel: string;
    category: string;
  };
}

export default function ProgressPage() {
  const { data: stats } = useQuery<TeacherStats>({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: progress = [], isLoading } = useQuery<ProgressEntry[]>({
    queryKey: ['/api/progress'],
    queryFn: async () => {
      const response = await fetch('/api/progress', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const progressPercentage = stats ? (stats.completedStandards / stats.totalStandards) * 100 : 0;

  // Group progress by subject
  const progressBySubject = progress.reduce((acc, entry) => {
    const subject = entry.standard.subjectArea;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(entry);
    return acc;
  }, {} as Record<string, ProgressEntry[]>);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">Track your standards completion and learning journey</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your standards completion and learning journey</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedStandards}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStandards - stats.completedStandards}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.subjectAreas.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            You've completed {stats.completedStandards} out of {stats.totalStandards} standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Progress by Subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(progressBySubject).map(([subject, entries]) => (
          <Card key={subject}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {subject}
                <Badge variant="secondary">{entries.length} completed</Badge>
              </CardTitle>
              <CardDescription>Recently completed standards in this subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {entries
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{entry.standard.code}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.standard.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">Grade {entry.standard.gradeLevel}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.completedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {entries.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No standards completed in this subject yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completions</CardTitle>
          <CardDescription>Standards you've completed recently</CardDescription>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No progress yet</h3>
              <p className="text-muted-foreground">
                Start adding lessons to track your standards completion progress.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{entry.standard.code}</span>
                        <Badge variant="outline" className="text-xs">{entry.standard.subjectArea}</Badge>
                        <Badge variant="secondary" className="text-xs">Grade {entry.standard.gradeLevel}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.standard.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.completedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
