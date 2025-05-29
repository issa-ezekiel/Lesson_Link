import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getAuthHeaders } from '@/lib/auth';
import { Users, Mail, GraduationCap, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface Teacher {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  subjectAreas: string[];
  gradeLevels: string[];
}

interface TeacherStats {
  completedStandards: number;
  totalStandards: number;
  lessonsThisMonth: number;
  subjectAreas: string[];
}

const addTeacherSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  subjectAreas: z.array(z.string()).min(1, "At least one subject area is required"),
  gradeLevels: z.array(z.string()).min(1, "At least one grade level is required"),
});

type AddTeacherFormData = z.infer<typeof addTeacherSchema>;

const SUBJECT_AREAS = [
  "Mathematics",
  "English Language Arts", 
  "Science",
  "Social Studies",
  "Music",
  "Art",
  "French"
];

const GRADE_LEVELS = [
  "PK", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

export default function Teachers() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['/api/users/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/users/teachers', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  // Fetch stats for each teacher
  const teacherStatsQueries = useQuery({
    queryKey: ['/api/reports/overview'],
    queryFn: async () => {
      const response = await fetch('/api/reports/overview', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      return data.teacherStats;
    },
  });

  const teacherStats = teacherStatsQueries.data || [];

  const getTeacherStats = (teacherId: number) => {
    return teacherStats.find((stat: any) => stat.teacher.id === teacherId);
  };

  // Add teacher form
  const form = useForm<AddTeacherFormData>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      subjectAreas: [],
      gradeLevels: [],
    },
  });

  // Add teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: async (data: AddTeacherFormData) => {
      const response = await fetch('/api/users/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add teacher');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/overview'] });
      setIsAddTeacherOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddTeacherFormData) => {
    addTeacherMutation.mutate(data);
  };

  if (teachersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage and monitor teacher profiles and performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded"></div>
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage and monitor teacher profiles and performance</p>
        </div>
        {user?.role === 'administrator' && (
          <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subjectAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Areas</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {SUBJECT_AREAS.map((subject) => (
                            <div key={subject} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subject-${subject}`}
                                checked={field.value?.includes(subject)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, subject]);
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== subject));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`subject-${subject}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {subject}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gradeLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Levels</FormLabel>
                        <div className="grid grid-cols-6 gap-2">
                          {GRADE_LEVELS.map((grade) => (
                            <div key={grade} className="flex items-center space-x-2">
                              <Checkbox
                                id={`grade-${grade}`}
                                checked={field.value?.includes(grade)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, grade]);
                                  } else {
                                    field.onChange(field.value?.filter((g) => g !== grade));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`grade-${grade}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {grade}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddTeacherOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addTeacherMutation.isPending}>
                      {addTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teacherStats.reduce((sum: number, stat: any) => sum + stat.lessonsThisMonth, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Lessons This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teacherStats.length > 0 
                    ? Math.round(teacherStats.reduce((sum: number, stat: any) => sum + stat.progressPercentage, 0) / teacherStats.length)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(teachers.flatMap(t => t.subjectAreas)).size}
                </p>
                <p className="text-sm text-muted-foreground">Subject Areas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      {teachers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
            <p className="text-muted-foreground">
              No teachers have been added to the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const stats = getTeacherStats(teacher.id);
            const progressPercentage = stats ? stats.progressPercentage : 0;
            
            return (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {teacher.firstName} {teacher.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{teacher.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Subject Areas */}
                    <div>
                      <p className="text-sm font-medium mb-2">Subject Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectAreas.length > 0 ? (
                          teacher.subjectAreas.map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Grade Levels */}
                    <div>
                      <p className="text-sm font-medium mb-2">Grade Levels</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.gradeLevels.length > 0 ? (
                          teacher.gradeLevels.map((grade) => (
                            <Badge key={grade} variant="outline" className="text-xs">
                              Grade {grade}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Stats */}
                    {stats && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-lg font-bold text-primary">{stats.completedStandards}</p>
                            <p className="text-xs text-muted-foreground">Standards</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-lg font-bold text-secondary">{stats.lessonsThisMonth}</p>
                            <p className="text-xs text-muted-foreground">Lessons</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/progress?teacher=${teacher.id}`)}
                      >
                        View Progress
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/lessons?teacher=${teacher.id}`)}
                      >
                        View Lessons
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
