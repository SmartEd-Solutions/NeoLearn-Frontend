import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useAuthContext } from '@/components/AuthProvider';
import { AttendanceStatus } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import AttendanceChart from '@/components/charts/AttendanceChart';

const AttendanceManagement = () => {
  const { userProfile } = useAuthContext();
  const { attendance, markAttendance, getAttendanceStats } = useAttendance(userProfile?.id);
  const { students } = useStudents(userProfile?.role, userProfile?.id);
  const { classes } = useClasses();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    const { error } = await markAttendance(studentId, selectedDate, status);
    
    if (error) {
      toast.error('Failed to mark attendance');
    } else {
      toast.success(`Attendance marked as ${status}`);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'excused': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate chart data
  const attendanceStats = getAttendanceStats();
  const chartData = [
    { date: 'Mon', present: 28, absent: 2, late: 1, excused: 0 },
    { date: 'Tue', present: 29, absent: 1, late: 1, excused: 0 },
    { date: 'Wed', present: 27, absent: 3, late: 1, excused: 0 },
    { date: 'Thu', present: 30, absent: 1, late: 0, excused: 0 },
    { date: 'Fri', present: 26, absent: 2, late: 2, excused: 1 },
  ];

  const pieData = [
    { name: 'Present', value: attendanceStats.presentDays, color: '#10b981' },
    { name: 'Late', value: attendanceStats.lateDays, color: '#f59e0b' },
    { name: 'Absent', value: attendanceStats.absentDays, color: '#ef4444' },
    { name: 'Excused', value: attendanceStats.excusedDays, color: '#3b82f6' },
  ];

  const filteredStudents = selectedClass 
    ? students.filter(student => student.class_id === selectedClass)
    : students;

  const todaysAttendance = attendance.filter(record => record.date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Attendance Management</h2>
        <div className="flex gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Attendance Rate</p>
                <p className="text-2xl font-bold text-primary">{attendanceStats.attendanceRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Present Days</p>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.presentDays}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Late Days</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.lateDays}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Absent Days</p>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absentDays}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AttendanceChart data={chartData} pieData={pieData} />

      {/* Attendance Marking */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const attendanceRecord = todaysAttendance.find(record => record.user_id === student.user_id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.user?.full_name}</TableCell>
                      <TableCell>{student.class?.name}</TableCell>
                      <TableCell>
                        {attendanceRecord ? (
                          <Badge className={getStatusColor(attendanceRecord.status)}>
                            {getStatusIcon(attendanceRecord.status)}
                            {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not marked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(student.user_id, 'present')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            P
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(student.user_id, 'late')}
                            className="text-yellow-600 hover:bg-yellow-50"
                          >
                            L
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(student.user_id, 'absent')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(student.user_id, 'excused')}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            E
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceManagement;