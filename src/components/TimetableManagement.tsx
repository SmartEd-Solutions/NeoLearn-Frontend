import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useTimetable } from '@/hooks/useTimetable';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuthContext } from '@/components/AuthProvider';
import { DayOfWeek, TimetableEntry } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const TimetableManagement = () => {
  const { userProfile } = useAuthContext();
  const { timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getTodaysTimetable } = useTimetable(userProfile?.id);
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    day: '' as DayOfWeek,
    start_time: '',
    end_time: '',
    subject: '',
    subject_id: '',
    class_id: '',
    location: '',
  });

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day || !formData.start_time || !formData.end_time || !formData.subject || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const entryData = {
      ...formData,
      user_id: userProfile!.id,
    };

    if (editingEntry) {
      const { error } = await updateTimetableEntry(editingEntry.id, entryData);
      if (error) {
        toast.error('Failed to update timetable entry');
      } else {
        toast.success('Timetable entry updated successfully');
        handleCloseDialog();
      }
    } else {
      const { error } = await addTimetableEntry(entryData);
      if (error) {
        toast.error('Failed to add timetable entry');
      } else {
        toast.success('Timetable entry added successfully');
        handleCloseDialog();
      }
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      day: entry.day,
      start_time: entry.start_time,
      end_time: entry.end_time,
      subject: entry.subject,
      subject_id: entry.subject_id || '',
      class_id: entry.class_id || '',
      location: entry.location,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      const { error } = await deleteTimetableEntry(id);
      if (error) {
        toast.error('Failed to delete timetable entry');
      } else {
        toast.success('Timetable entry deleted successfully');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setFormData({
      day: '' as DayOfWeek,
      start_time: '',
      end_time: '',
      subject: '',
      subject_id: '',
      class_id: '',
      location: '',
    });
  };

  const todaysTimetable = getTodaysTimetable();
  const canManage = userProfile?.role === 'admin' || userProfile?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Timetable Management</h2>
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero hover:shadow-glow transition-smooth">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select 
                    value={formData.day} 
                    onValueChange={(value: DayOfWeek) => setFormData(prev => ({ ...prev, day: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject name"
                  />
                </div>

                <div>
                  <Label htmlFor="class_id">Class (Optional)</Label>
                  <Select 
                    value={formData.class_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific class</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location/room"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEntry ? 'Update' : 'Add'} Entry
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysTimetable.length > 0 ? (
            <div className="space-y-4">
              {todaysTimetable.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground">{entry.subject}</h4>
                    <p className="text-muted-foreground text-sm">{entry.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.start_time} - {entry.end_time}
                    </Badge>
                    {canManage && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes scheduled for today</p>
              {canManage && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Add First Schedule Entry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {timetable.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Location</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(day => {
                  const dayEntries = timetable.filter(entry => entry.day === day);
                  return dayEntries.length > 0 ? (
                    dayEntries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        {index === 0 && (
                          <TableCell rowSpan={dayEntries.length} className="font-medium">
                            {day}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline">
                            {entry.start_time} - {entry.end_time}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{entry.subject}</TableCell>
                        <TableCell>{entry.location}</TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key={day}>
                      <TableCell className="font-medium">{day}</TableCell>
                      <TableCell colSpan={canManage ? 4 : 3} className="text-muted-foreground text-center">
                        No classes scheduled
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timetable entries found</p>
              {canManage && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create Your First Schedule
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableManagement;