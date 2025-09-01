import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from '@/components/ui/sonner';

const StudentManagement = () => {
  const { userProfile } = useAuthContext();
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents(userProfile?.role, userProfile?.id);
  const { classes } = useClasses();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    student_id: '',
    class_id: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await addStudent(newStudent);
    
    if (error) {
      toast.error('Failed to add student');
    } else {
      toast.success('Student added successfully');
      setShowAddDialog(false);
      setNewStudent({
        full_name: '',
        email: '',
        student_id: '',
        class_id: '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        enrollment_date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const { error } = await updateStudent(editingStudent.id, {
      class_id: editingStudent.class_id,
      parent_name: editingStudent.parent_name,
      parent_email: editingStudent.parent_email,
      parent_phone: editingStudent.parent_phone,
      status: editingStudent.status,
    });

    if (error) {
      toast.error('Failed to update student');
    } else {
      toast.success('Student updated successfully');
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const { error } = await deleteStudent(id);
      
      if (error) {
        toast.error('Failed to delete student');
      } else {
        toast.success('Student deleted successfully');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'transferred': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (userProfile?.role === 'student') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        {students.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student ID</Label>
                  <p className="font-medium">{students[0].student_id}</p>
                </div>
                <div>
                  <Label>Class</Label>
                  <p className="font-medium">{students[0].class?.name || 'Not assigned'}</p>
                </div>
                <div>
                  <Label>Enrollment Date</Label>
                  <p className="font-medium">{new Date(students[0].enrollment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(students[0].status)}>
                    {students[0].status.charAt(0).toUpperCase() + students[0].status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Student Management</h2>
        {userProfile?.role === 'admin' && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero hover:shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newStudent.full_name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      value={newStudent.student_id}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, student_id: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_id">Class</Label>
                    <Select value={newStudent.class_id} onValueChange={(value) => setNewStudent(prev => ({ ...prev, class_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parent_name">Parent Name</Label>
                    <Input
                      id="parent_name"
                      value={newStudent.parent_name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, parent_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_email">Parent Email</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      value={newStudent.parent_email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, parent_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_phone">Parent Phone</Label>
                    <Input
                      id="parent_phone"
                      value={newStudent.parent_phone}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, parent_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="enrollment_date">Enrollment Date</Label>
                    <Input
                      id="enrollment_date"
                      type="date"
                      value={newStudent.enrollment_date}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, enrollment_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-hero">Add Student</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading students...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Contact</TableHead>
                  <TableHead>Status</TableHead>
                  {userProfile?.role === 'admin' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{student.user?.full_name}</TableCell>
                    <TableCell>{student.class?.name || 'Not assigned'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{student.parent_name}</div>
                        {student.parent_email && (
                          <div className="text-muted-foreground">{student.parent_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                    {userProfile?.role === 'admin' && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={editingStudent.user?.full_name} disabled />
                </div>
                <div>
                  <Label>Student ID</Label>
                  <Input value={editingStudent.student_id} disabled />
                </div>
                <div>
                  <Label htmlFor="edit_class_id">Class</Label>
                  <Select 
                    value={editingStudent.class_id || ''} 
                    onValueChange={(value) => setEditingStudent(prev => ({ ...prev, class_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select 
                    value={editingStudent.status} 
                    onValueChange={(value) => setEditingStudent(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_parent_name">Parent Name</Label>
                  <Input
                    id="edit_parent_name"
                    value={editingStudent.parent_name}
                    onChange={(e) => setEditingStudent(prev => ({ ...prev, parent_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_parent_email">Parent Email</Label>
                  <Input
                    id="edit_parent_email"
                    type="email"
                    value={editingStudent.parent_email}
                    onChange={(e) => setEditingStudent(prev => ({ ...prev, parent_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_parent_phone">Parent Phone</Label>
                  <Input
                    id="edit_parent_phone"
                    value={editingStudent.parent_phone}
                    onChange={(e) => setEditingStudent(prev => ({ ...prev, parent_phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-hero">Update Student</Button>
                <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
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

export default StudentManagement;