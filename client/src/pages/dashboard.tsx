import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddLessonModal } from '@/components/add-lesson-modal';
import { useAuth } from '@/hooks/use-auth';
import { getAuthHeaders } from '@/lib/auth';
import { CheckCircle, List, BookOpen, GraduationCap, Plus, TrendingUp, Search, Award, Users, Target, Calendar, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface TeacherStats {
  completedStandards: number;
  totalStandards: number;
  lessonsThisMonth: number;
  subjectAreas: string[];
}

interface RecentActivity {
  id: string;
  type: 'standard_completed' | 'lesson_added' | 'milestone_reached';
  title: string;
  description: string;
  time: string;
  subject: string;
}

export default function Dashboard() {
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<TeacherStats>({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const progressPercentage = stats ? (stats.completedStandards / stats.totalStandards) * 100 : 0;

  // Sample recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'standard_completed',
      title: 'Standard completed: MA.3.NBT.1',
      description: 'Use place value understanding to round whole numbers',
      time: '2 hours ago',
      subject: 'Mathematics'
    },
    {
      id: '2',
      type: 'lesson_added',
      title: 'Added lesson: Fraction Basics',
      description: 'Introduction to numerators and denominators',
      time: '1 day ago',
      subject: 'Mathematics'
    },
    {
      id: '3',
      type: 'milestone_reached',
      title: `Milestone reached: ${Math.round(progressPercentage)}% complete`,
      description: `You've completed ${stats?.completedStandards || 0} out of ${stats?.totalStandards || 0} standards`,
      time: '3 days ago',
      subject: 'Progress'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'standard_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'lesson_added':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'milestone_reached':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
            <p className="text-gray-600 mt-1">Here's your teaching progress overview</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Standards Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedStandards}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(progressPercentage)}% Complete
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Standards</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalStandards}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Available
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Lessons This Month</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.lessonsThisMonth}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      This Month
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Subject Areas</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.subjectAreas.length}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Teaching
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="text-orange-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Your standards completion progress across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Standards Completion</span>
                <span className="text-sm text-muted-foreground">
                  {stats.completedStandards} of {stats.totalStandards}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {stats.subjectAreas.map((subject, index) => (
                  <div key={subject} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{subject}</p>
                    <Badge variant="outline" className="mt-1">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-4 group hover:border-primary hover:bg-primary/5"
              onClick={() => setIsAddLessonModalOpen(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Add New Lesson</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-4 group hover:border-primary hover:bg-primary/5"
              onClick={() => setLocation('/standards')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <Search className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">Browse Standards</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-4 group hover:border-primary hover:bg-primary/5"
              onClick={() => setLocation('/progress')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">View Progress</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest teaching activities and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.subject}
                      </Badge>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AddLessonModal 
        open={isAddLessonModalOpen} 
        onOpenChange={setIsAddLessonModalOpen} 
      />
    </div>
  );
}