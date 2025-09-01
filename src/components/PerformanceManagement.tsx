import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Award, BookOpen } from 'lucide-react';
import { usePerformance } from '@/hooks/usePerformance';
import { useStudents } from '@/hooks/useStudents';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from '@/components/ui/sonner';
import PerformanceChart from '@/components/charts/PerformanceChart';

const PerformanceManagement = () => {
  const { userProfile } = useAuthContext();
  const { performance, addPerformanceRecord, getPerformanceStats } = usePerformance(userProfile?.id);
  const { students } = useStudents(userProfile?.role, userProfile?.id);
  const { subjects } = useSubjects();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newRecord, setNewRecord] = useState({
    user_id: '',
    subject: '',
    subject_id: '',
    grade: '',
    score: 0,
    max_score: 100,
    remarks: '',
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await addPerformanceRecord({
      ...newRecord,
      recorded_by: userProfile?.id,
    });
    
    if (error) {
      toast.error('Failed to add performance record');
    } else {
      toast.success('Performance record added successfully');
      setShowAddDialog(false);
      setNewRecord({
        user_id: '',
        subject: '',
        subject_id: '',
        grade: '',
        score: 0,
        max_score: 100,
        remarks: '',
      });
    }
  };

  const performanceStats = getPerformanceStats();

  // Generate chart data
  const trendData = [
    { date: 'Week 1', average: 78 },
    { date: 'Week 2', average: 82 },
    { date: 'Week 3', average: 85 },
    { date: 'Week 4', average: 87 },
    { date: 'Week 5', average: 89 },
  ];

  const subjectData = Object.entries(performanceStats.subjectStats).map(([subject, stats]) => ({
    subject: subject.substring(0, 10),
    average: Math.round((stats as any).average || 0),
    count: stats.count,
  }));

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': case 'A+': return 'bg-green-100 text-green-800';
      case 'B': case 'B+': return 'bg-blue-100 text-blue-800';
      case 'C': case 'C+': return 'bg-yellow-100 text-yellow-800';
      case 'D': case 'D+': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Performance Management</h2>
        {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero hover:shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Performance Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={newRecord.user_id} onValueChange={(value) => setNewRecord(prev => ({ ...prev, user_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.user_id} value={student.user_id}>
                          {student.user?.full_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject_id">Subject</Label>
                  <Select 
                    value={newRecord.subject_id} 
                    onValueChange={(value) => {
                      const subject = subjects.find(s => s.id === value);
                      setNewRecord(prev => ({ 
                        ...prev, 
                        subject_id: value,
                        subject: subject?.name || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      value={newRecord.score}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_score">Max Score</Label>
                    <Input
                      id="max_score"
                      type="number"
                      value={newRecord.max_score}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, max_score: parseInt(e.target.value) }))}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={newRecord.grade}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="e.g., A, B+, C"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={newRecord.remarks}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Additional comments..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-hero">Add Record</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Average Score</p>
                <p className="text-2xl font-bold text-primary">{performanceStats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Recent Grade</p>
                <p className="text-2xl font-bold text-primary">{performanceStats.recentGrade}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Records</p>
                <p className="text-2xl font-bold text-secondary-foreground">{performanceStats.totalRecords}</p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Subjects</p>
                <p className="text-2xl font-bold text-primary">{Object.keys(performanceStats.subjectStats).length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <PerformanceChart trendData={trendData} subjectData={subjectData} />

      {/* Recent Performance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Performance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && <TableHead>Student</TableHead>}
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performance.slice(0, 10).map((record) => (
                <TableRow key={record.id}>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
                    <TableCell>
                      {students.find(s => s.user_id === record.user_id)?.user?.full_name || 'Unknown'}
                    </TableCell>
                  )}
                  <TableCell>{record.subject}</TableCell>
                  <TableCell>
                    <Badge className={getGradeColor(record.grade)}>
                      {record.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.score}/{record.max_score}</span>
                      <span className="text-muted-foreground text-sm">
                        ({Math.round((record.score / record.max_score) * 100)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(record.recorded_at).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceManagement;