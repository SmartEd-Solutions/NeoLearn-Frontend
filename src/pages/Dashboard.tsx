import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp,
  ChevronRight,
  School,
  BarChart3,
  UserCheck,
  CreditCard
} from 'lucide-react';
import AIQueryBox from '@/components/AIQueryBox';
import StudentManagement from '@/components/StudentManagement';
import ClassManagement from '@/components/ClassManagement';
import AttendanceManagement from '@/components/AttendanceManagement';
import PerformanceManagement from '@/components/PerformanceManagement';
import PaymentManagement from '@/components/PaymentManagement';
import { useAuthContext } from '@/components/AuthProvider';
import { useTimetable } from '@/hooks/useTimetable';
import { useAttendance } from '@/hooks/useAttendance';
import { usePerformance } from '@/hooks/usePerformance';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useSettings } from '@/hooks/useSettings';
import { ThemeOption } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuthContext();
  const { getTodaysTimetable } = useTimetable(userProfile?.id);
  const { getAttendanceStats, getTodaysAttendance } = useAttendance(userProfile?.id);
  const { getPerformanceStats } = usePerformance(userProfile?.id);
  const { students } = useStudents(userProfile?.role, userProfile?.id);
  const { classes } = useClasses();
  const { settings, updateTheme, toggleNotifications, updateLanguage } = useSettings(userProfile?.id);
  
  const [activeSection, setActiveSection] = useState('overview');

  const getSidebarItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: TrendingUp },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'attendance', label: 'Attendance', icon: Users },
      { id: 'performance', label: 'Performance', icon: BookOpen },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'ai-query', label: 'AI Assistant', icon: Brain },
    ];

    if (userProfile?.role === 'admin') {
      baseItems.splice(2, 0, 
        { id: 'students', label: 'Students', icon: UserCheck },
        { id: 'classes', label: 'Classes', icon: School }
      );
    }

    baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
    return baseItems;
  };

  const sidebarItems = getSidebarItems();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      window.location.href = '/';
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
    { 
      label: 'Total Students', 
      value: `${students.length}`, 
      change: 'enrolled', 
      changeType: 'neutral' 
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'timetable':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Timetable</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysTimetable.length > 0 ? (
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysTimetable.length > 0 ? (
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const dayEntries = todaysTimetable.filter(entry => entry.day === day);
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
                    <p>No schedule available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      case 'attendance':
        return <AttendanceManagement />;

      case 'performance':
        return <PerformanceManagement />;

      case 'students':
        return <StudentManagement />;

      case 'classes':
        return <ClassManagement />;

      case 'payments':
        return <PaymentManagement />;

      case 'ai-query':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
            <AIQueryBox />
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Suggested Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Today's Attendance Summary</div>
                      <div className="text-muted-foreground text-sm">Get attendance insights for all classes</div>
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
                      <div className="text-muted-foreground text-sm">Optimize timetables and resource allocation</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto p-4">
                    <div>
                      <div className="font-medium">Class Performance Analysis</div>
                      <div className="text-muted-foreground text-sm">Compare performance across different classes</div>
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
            <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme Preference</Label>
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
                  <Label htmlFor="language">Display Language</Label>
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
                <CardTitle>Notification Preferences</CardTitle>
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
                <CardTitle>Profile Information</CardTitle>
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
                <div>
                  <Label>Member Since</Label>
                  <p className="text-foreground font-medium">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {userProfile?.role === 'admin' && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      As an administrator, you have full access to manage students, classes, attendance, and performance records.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
              <div className="text-muted-foreground text-sm">
                Welcome back, {userProfile?.full_name}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

            {/* Quick Actions for Admins and Teachers */}
            {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('attendance')}>
                      <Users className="h-6 w-6 mb-2" />
                      Mark Attendance
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('performance')}>
                      <BookOpen className="h-6 w-6 mb-2" />
                      Add Grades
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveSection('ai-query')}>
                      <Brain className="h-6 w-6 mb-2" />
                      AI Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
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

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Attendance marked for today</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New performance record added</span>
                    <span className="text-xs text-muted-foreground ml-auto">5 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Timetable updated</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-hero p-2 rounded-xl shadow-glow">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">EduManager</h1>
                <p className="text-xs text-muted-foreground capitalize">{userProfile?.role} Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card shadow-card h-[calc(100vh-80px)] overflow-y-auto sticky top-20">
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
        <main className="flex-1 p-6 overflow-y-auto min-h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;