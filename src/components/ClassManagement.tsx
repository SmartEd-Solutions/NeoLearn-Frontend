import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, School, Users } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from '@/components/ui/sonner';

const ClassManagement = () => {
  const { userProfile } = useAuthContext();
  const { classes, loading, addClass, updateClass, deleteClass } = useClasses();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: 9,
    academic_year: '2024-2025',
    teacher_id: '',
    max_students: 30,
  });

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await addClass(newClass);
    
    if (error) {
      toast.error('Failed to add class');
    } else {
      toast.success('Class added successfully');
      setShowAddDialog(false);
      setNewClass({
        name: '',
        grade_level: 9,
        academic_year: '2024-2025',
        teacher_id: '',
        max_students: 30,
      });
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const { error } = await updateClass(editingClass.id, {
      name: editingClass.name,
      grade_level: editingClass.grade_level,
      teacher_id: editingClass.teacher_id || null,
      max_students: editingClass.max_students,
    });

    if (error) {
      toast.error('Failed to update class');
    } else {
      toast.success('Class updated successfully');
      setEditingClass(null);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      const { error } = await deleteClass(id);
      
      if (error) {
        toast.error('Failed to delete class');
      } else {
        toast.success('Class deleted successfully');
      }
    }
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-card hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  {cls.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-medium">Grade {cls.grade_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-medium">{cls.student_count}/{cls.max_students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="font-medium">{cls.teacher?.full_name || 'Not assigned'}</span>
                  </div>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Class Management</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Grade 9A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade_level">Grade Level</Label>
                <Select 
                  value={newClass.grade_level.toString()} 
                  onValueChange={(value) => setNewClass(prev => ({ ...prev, grade_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={newClass.max_students}
                  onChange={(e) => setNewClass(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-hero">Add Class</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Classes ({classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading classes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>Grade {cls.grade_level}</TableCell>
                    <TableCell>{cls.teacher?.full_name || 'Not assigned'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cls.student_count}/{cls.max_students}
                      </div>
                    </TableCell>
                    <TableCell>{cls.academic_year}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClass(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Class Dialog */}
      {editingClass && (
        <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Class Name</Label>
                <Input
                  id="edit_name"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_grade_level">Grade Level</Label>
                <Select 
                  value={editingClass.grade_level.toString()} 
                  onValueChange={(value) => setEditingClass(prev => ({ ...prev, grade_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_max_students">Maximum Students</Label>
                <Input
                  id="edit_max_students"
                  type="number"
                  value={editingClass.max_students}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-hero">Update Class</Button>
                <Button type="button" variant="outline" onClick={() => setEditingClass(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassManagement;