import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight
} from 'lucide-react';
import AIQueryBox from '@/components/AIQueryBox';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'performance', label: 'Performance', icon: BookOpen },
    { id: 'ai-query', label: 'AI Assistant', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const mockStats = [
    { label: 'Total Students', value: '1,247', change: '+12', changeType: 'positive' },
    { label: 'Present Today', value: '1,156', change: '92.7%', changeType: 'positive' },
    { label: 'Classes Scheduled', value: '45', change: '8 active', changeType: 'neutral' },
    { label: 'Average Grade', value: '8.4', change: '+0.3', changeType: 'positive' },
  ];

  const recentActivities = [
    { id: 1, title: 'Math Class - Grade 10A', time: '09:00 AM', status: 'In Progress', type: 'class' },
    { id: 2, title: 'Attendance Report Generated', time: '08:45 AM', status: 'Completed', type: 'report' },
    { id: 3, title: 'Physics Lab - Grade 11B', time: '10:30 AM', status: 'Upcoming', type: 'lab' },
    { id: 4, title: 'Parent-Teacher Meeting', time: '02:00 PM', status: 'Scheduled', type: 'meeting' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'timetable':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Timetable Management</h2>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                    <div>
                      <h4 className="font-semibold">Mathematics - Grade 10A</h4>
                      <p className="text-muted-foreground text-sm">Room 201 • Ms. Johnson</p>
                    </div>
                    <Badge variant="outline">09:00 - 09:45</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                    <div>
                      <h4 className="font-semibold">Physics Lab - Grade 11B</h4>
                      <p className="text-muted-foreground text-sm">Lab 3 • Dr. Smith</p>
                    </div>
                    <Badge variant="outline">10:30 - 12:00</Badge>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Advanced timetable features coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Attendance Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">92.7%</div>
                  <p className="text-muted-foreground text-sm">1,156 out of 1,247 students present</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Late Arrivals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500 mb-2">23</div>
                  <p className="text-muted-foreground text-sm">Students arrived after 8:30 AM</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Absent Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500 mb-2">91</div>
                  <p className="text-muted-foreground text-sm">Includes excused and unexcused</p>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Average GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">8.4</div>
                  <p className="text-muted-foreground text-sm">+0.3 from last semester</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-500 mb-2">127</div>
                  <p className="text-muted-foreground text-sm">Students with GPA &gt; 9.0</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Need Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500 mb-2">34</div>
                  <p className="text-muted-foreground text-sm">Students with GPA &lt; 6.0</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500 mb-2">89</div>
                  <p className="text-muted-foreground text-sm">Students showing progress</p>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Subject Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed performance analytics and charts coming soon...</p>
                </div>
              </CardContent>
            </Card>
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

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
              <div className="text-muted-foreground text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockStats.map((stat, index) => (
                <Card key={index} className="shadow-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-emerald-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activities */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'In Progress' ? 'bg-blue-500' :
                          activity.status === 'Completed' ? 'bg-emerald-500' :
                          activity.status === 'Upcoming' ? 'bg-orange-500' :
                          'bg-muted-foreground'
                        }`} />
                        <div>
                          <h4 className="font-medium text-foreground">{activity.title}</h4>
                          <p className="text-muted-foreground text-sm">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
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
      <header className="bg-card shadow-card border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-hero p-2 rounded-xl shadow-glow">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">EduManager</h1>
                <p className="text-xs text-muted-foreground">Welcome back, Admin</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
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
                    ? "bg-gradient-hero shadow-glow text-white" 
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