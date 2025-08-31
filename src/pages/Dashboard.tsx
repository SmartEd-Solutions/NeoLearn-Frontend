import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Brain, 
  Settings, 
  LogOut, 
  GraduationCap,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import AIQueryBox from '@/components/AIQueryBox';
import { useAuthContext } from '@/components/AuthProvider';
import { useTimetable } from '@/hooks/useTimetable';
import { useAttendance } from '@/hooks/useAttendance';
import { usePerformance } from '@/hooks/usePerformance';
import { useSettings } from '@/hooks/useSettings';
import { DayOfWeek, AttendanceStatus, ThemeOption } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuthContext();
  const { timetable, loading: timetableLoading, addTimetableEntry, getTodaysTimetable } = useTimetable(userProfile?.id);
  const { attendance, loading: attendanceLoading, markAttendance, getAttendanceStats, getTodaysAttendance } = useAttendance(userProfile?.id);
  const { performance, loading: performanceLoading, getPerformanceStats } = usePerformance(userProfile?.id);
  const { settings, updateTheme, toggleNotifications, updateLanguage } = useSettings(userProfile?.id);
  
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [newTimetableEntry, setNewTimetableEntry] = useState({
    subject: '',
    day: 'Monday' as DayOfWeek,
    start_time: '',
    end_time: '',
    location: ''
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'performance', label: 'Performance', icon: BookOpen },
    { id: 'ai-query', label: 'AI Assistant', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      window.location.href = '/';
    }
  };

  const handleAddTimetableEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    const { data, error } = await addTimetableEntry({
      user_id: userProfile.id,
      ...newTimetableEntry
    });

    if (error) {
      toast.error('Failed to add timetable entry');
    } else {
      toast.success('Timetable entry added successfully');
      setShowAddTimetable(false);
      setNewTimetableEntry({
        subject: '',
        day: 'Monday',
        start_time: '',
        end_time: '',
        location: ''
      });
    }
  };

  const handleMarkAttendance = async (status: AttendanceStatus) => {
    if (!userProfile?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const { error } = await markAttendance(userProfile.id, today, status);

    if (error) {
      toast.error('Failed to mark attendance');
    } else {
      toast.success(`Attendance marked as ${status}`);
    }
  };

  // Get real stats
  const attendanceStats = getAttendanceStats();
  const performanceStats = getPerformanceStats();
  const todaysTimetable = getTodaysTimetable();
  const todaysAttendance = getTodaysAttendance();

  const getOverviewStats = () => [
    { 
      label: 'Attendance Rate', 
      value: `${attendanceStats.attendanceRate}%`, 
      change: `${attendanceStats.presentDays}/${attendanceStats.totalDays} days`, 
      changeType: 'positive' 
    },
    { 
      label: 'Average Score', 
      value: `${performanceStats.averageScore}%`, 
      change: `${performanceStats.totalRecords} records`, 
      changeType: 'positive' 
    },
    { 
      label: 'Today\'s Classes', 
      value: `${todaysTimetable.length}`, 
      change: 'scheduled', 
      changeType: 'neutral' 
    },
    { 
      label: 'Recent Grade', 
      value: performanceStats.recentGrade, 
      change: 'latest', 
      changeType: 'positive' 
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'timetable':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Timetable Management</h2>
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Schedule</h3>
              <Button 
                onClick={() => setShowAddTimetable(true)}
                className="bg-gradient-hero hover:shadow-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            {showAddTimetable && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Add Timetable Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTimetableEntry} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newTimetableEntry.subject}
                          onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Mathematics"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="day">Day</Label>
                        <Select 
                          value={newTimetableEntry.day} 
                          onValueChange={(value: DayOfWeek) => setNewTimetableEntry(prev => ({ ...prev, day: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={newTimetableEntry.start_time}
                          onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, start_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={newTimetableEntry.end_time}
                          onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, end_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newTimetableEntry.location}
                          onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., Room 201"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-gradient-hero">Add Entry</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddTimetable(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</CardTitle>
              </CardHeader>
              <CardContent>
                {timetableLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading timetable...</p>
                  </div>
                ) : todaysTimetable.length > 0 ? (
                  <div className="space-y-4">
                    {todaysTimetable.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div>
                          <h4 className="font-semibold">{entry.subject}</h4>
                          <p className="text-muted-foreground text-sm">{entry.location}</p>
                        </div>
                        <Badge variant="outline">{entry.start_time} - {entry.end_time}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes scheduled for today</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowAddTimetable(true)}
                    >
                      Add Your First Class
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {timetable.length > 0 ? (
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const dayEntries = timetable.filter(entry => entry.day === day);
                      return (
                        <div key={day} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{day}</h4>
                          {dayEntries.length > 0 ? (
                            <div className="space-y-2">
                              {dayEntries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between text-sm">
                                  <span>{entry.subject} - {entry.location}</span>
                                  <span className="text-muted-foreground">{entry.start_time} - {entry.end_time}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No classes scheduled</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No timetable entries found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Attendance Management</h2>
            
            {!todaysAttendance && (
              <Card className="shadow-card border-primary/20">
                <CardHeader>
                  <CardTitle>Mark Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleMarkAttendance('present')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Present
                    </Button>
                    <Button 
                      onClick={() => handleMarkAttendance('late')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Late
                    </Button>
                    <Button 
                      onClick={() => handleMarkAttendance('absent')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Absent
                    </Button>
                    <Button 
                      onClick={() => handleMarkAttendance('excused')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Excused
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {todaysAttendance && (
              <Card className="shadow-card border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      todaysAttendance.status === 'present' ? 'bg-green-500' :
                      todaysAttendance.status === 'late' ? 'bg-yellow-500' :
                      todaysAttendance.status === 'absent' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="font-medium">Today's Status: {todaysAttendance.status.charAt(0).toUpperCase() + todaysAttendance.status.slice(1)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{attendanceStats.attendanceRate}%</div>
                  <p className="text-muted-foreground text-sm">{attendanceStats.presentDays + attendanceStats.lateDays} out of {attendanceStats.totalDays} days</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Present Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">{attendanceStats.presentDays}</div>
                  <p className="text-muted-foreground text-sm">Days marked present</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Absent Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">{attendanceStats.absentDays}</div>
                  <p className="text-muted-foreground text-sm">Days marked absent</p>
                </CardContent>
              </Card>
            </div>

            {attendanceLoading ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading attendance data...</p>
                </CardContent>
              </Card>
            ) : attendance.length > 0 ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendance.slice(0, 10).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            record.status === 'present' ? 'bg-green-500' :
                            record.status === 'late' ? 'bg-yellow-500' :
                            record.status === 'absent' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className={
                          record.status === 'present' ? 'border-green-500 text-green-700' :
                          record.status === 'late' ? 'border-yellow-500 text-yellow-700' :
                          record.status === 'absent' ? 'border-red-500 text-red-700' :
                          'border-blue-500 text-blue-700'
                        }>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{performanceStats.averageScore}%</div>
                  <p className="text-muted-foreground text-sm">Based on {performanceStats.totalRecords} records</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{performanceStats.recentGrade}</div>
                  <p className="text-muted-foreground text-sm">Latest assessment</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary-foreground mb-2">{performanceStats.totalRecords}</div>
                  <p className="text-muted-foreground text-sm">Performance entries</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{Object.keys(performanceStats.subjectStats).length}</div>
                  <p className="text-muted-foreground text-sm">Subjects tracked</p>
                </CardContent>
              </Card>
            </div>

            {performanceLoading ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading performance data...</p>
                </CardContent>
              </Card>
            ) : performance.length > 0 ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performance.slice(0, 10).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div>
                          <h4 className="font-semibold">{record.subject}</h4>
                          <p className="text-muted-foreground text-sm">
                            {new Date(record.recorded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{record.grade}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.score}/{record.max_score} ({Math.round((record.score / record.max_score) * 100)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No performance records found</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'ai-query':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
            <AIQueryBox />
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Suggested Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Today's Attendance Summary</div>
                      <div className="text-muted-foreground text-sm">Get a comprehensive overview of today's attendance</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Performance Trends</div>
                      <div className="text-muted-foreground text-sm">Analyze student performance over time</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Schedule Optimization</div>
                      <div className="text-muted-foreground text-sm">Suggestions for improving class schedules</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Student Support Insights</div>
                      <div className="text-muted-foreground text-sm">Identify students who need additional support</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings?.theme || 'system'} 
                    onValueChange={(value: ThemeOption) => updateTheme(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings?.language || 'en'} 
                    onValueChange={(value) => updateLanguage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about attendance, grades, and schedule changes</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={toggleNotifications}
                    className={settings?.notifications_enabled ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {settings?.notifications_enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-foreground font-medium">{userProfile?.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-foreground font-medium">{userProfile?.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge variant="outline" className="capitalize">
                    {userProfile?.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
              <div className="text-muted-foreground text-sm">
                Welcome back, {userProfile?.full_name}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getOverviewStats().map((stat, index) => (
                <Card key={index} className="shadow-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-primary' : 
                        stat.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Schedule */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysTimetable.length > 0 ? (
                  <div className="space-y-4">
                    {todaysTimetable.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{entry.subject}</h4>
                          <p className="text-muted-foreground text-sm">{entry.location}</p>
                        </div>
                        <Badge variant="outline">{entry.start_time} - {entry.end_time}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-hero p-2 rounded-xl shadow-glow">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">EduManager</h1>
                <p className="text-xs text-muted-foreground">Welcome back, {userProfile?.full_name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card shadow-card h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeSection === item.id 
                    ? "bg-gradient-hero shadow-glow text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
                {activeSection === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;