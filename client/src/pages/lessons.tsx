import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AddLessonModal } from '@/components/add-lesson-modal';
import { getAuthHeaders } from '@/lib/auth';
import { Plus, Search, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface LessonWithTeacher {
  id: number;
  title: string;
  description: string;
  subjectArea: string;
  gradeLevel: string;
  dateTaught: string;
  standardsCovered: string[];
  teacherName: string;
  createdAt: string;
}

export default function Lessons() {
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const { data: lessons = [], isLoading } = useQuery<LessonWithTeacher[]>({
    queryKey: ['/api/lessons'],
    queryFn: async () => {
      const response = await fetch('/api/lessons', {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.standardsCovered.some(standard => 
                           standard.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesSubject = subjectFilter === 'all' || lesson.subjectArea === subjectFilter;
    const matchesGrade = gradeFilter === 'all' || lesson.gradeLevel === gradeFilter;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Lessons</h1>
            <p className="text-muted-foreground">Manage your lesson plans and track standards coverage</p>
          </div>
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
          <h1 className="text-3xl font-bold">My Lessons</h1>
          <p className="text-muted-foreground">Manage your lesson plans and track standards coverage</p>
        </div>
        <Button onClick={() => setIsAddLessonModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search lessons, descriptions, or standards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Subject Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="PK">Pre-K</SelectItem>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
                <SelectItem value="6">Grade 6</SelectItem>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
            <p className="text-muted-foreground mb-4">
              {lessons.length === 0 
                ? "You haven't added any lessons yet. Create your first lesson to get started!"
                : "No lessons match your current filters. Try adjusting your search criteria."
              }
            </p>
            {lessons.length === 0 && (
              <Button onClick={() => setIsAddLessonModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {lesson.subjectArea} • Grade {lesson.gradeLevel}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {lesson.description}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(lesson.dateTaught), 'MMM d, yyyy')}
                  </div>
                  
                  {lesson.standardsCovered.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Standards Covered:</p>
                      <div className="flex flex-wrap gap-1">
                        {lesson.standardsCovered.slice(0, 3).map((standard) => (
                          <Badge key={standard} variant="secondary" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                        {lesson.standardsCovered.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{lesson.standardsCovered.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddLessonModal 
        open={isAddLessonModalOpen} 
        onOpenChange={setIsAddLessonModalOpen} 
      />
    </div>
  );
}
