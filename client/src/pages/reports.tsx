import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getAuthHeaders } from '@/lib/auth';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';

interface TeacherStat {
  teacher: {
    id: number;
    name: string;
    subjectAreas: string[];
  };
  completedStandards: number;
  totalStandards: number;
  lessonsThisMonth: number;
  subjectAreas: string[];
  progressPercentage: number;
}

interface ReportOverview {
  totalTeachers: number;
  totalStandards: number;
  totalLessons: number;
  totalProgress: number;
  averageProgress: number;
  teacherStats: TeacherStat[];
}

export default function Reports() {
  const { data: reportData, isLoading } = useQuery<ReportOverview>({
    queryKey: ['/api/reports/overview'],
    queryFn: async () => {
      const response = await fetch('/api/reports/overview', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Monitor teaching activities and standards compliance across all teachers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load report data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Monitor teaching activities and standards compliance across all teachers</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-primary mt-2">{reportData.totalTeachers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Standards</p>
                <p className="text-3xl font-bold text-foreground mt-2">{reportData.totalStandards}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Lessons</p>
                <p className="text-3xl font-bold text-accent mt-2">{reportData.totalLessons}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <BookOpen className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Average Progress</p>
                <p className="text-3xl font-bold text-secondary mt-2">{Math.round(reportData.averageProgress)}%</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Overview</CardTitle>
          <CardDescription>
            Individual teacher progress and activity summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reportData.teacherStats.map((teacher) => (
              <div key={teacher.teacher.id} className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{teacher.teacher.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacher.teacher.subjectAreas.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{Math.round(teacher.progressPercentage)}%</p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{teacher.completedStandards}</p>
                    <p className="text-sm text-muted-foreground">Standards Completed</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{teacher.lessonsThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Lessons This Month</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{teacher.totalStandards - teacher.completedStandards}</p>
                    <p className="text-sm text-muted-foreground">Standards Remaining</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{teacher.completedStandards} / {teacher.totalStandards} standards</span>
                  </div>
                  <Progress value={teacher.progressPercentage} className="h-2" />
                </div>
              </div>
            ))}

            {reportData.teacherStats.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teacher data available</h3>
                <p className="text-muted-foreground">
                  No teachers have been added to the system yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Activity Summary</CardTitle>
            <CardDescription>Overall platform usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Progress Entries</span>
                <span className="text-lg font-bold">{reportData.totalProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Completion Rate</span>
                <span className="text-lg font-bold">{Math.round(reportData.averageProgress)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Teachers</span>
                <span className="text-lg font-bold">{reportData.totalTeachers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Lesson Plans</span>
                <span className="text-lg font-bold">{reportData.totalLessons}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standards Compliance</CardTitle>
            <CardDescription>Overall standards coverage analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Compliance</span>
                  <span>{Math.round(reportData.averageProgress)}%</span>
                </div>
                <Progress value={reportData.averageProgress} className="h-3" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Teachers have collectively completed {reportData.totalProgress} standard requirements 
                  out of {reportData.totalTeachers * reportData.totalStandards} total possible completions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
