import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useAuthContext } from '@/components/AuthProvider';
import { flutterwaveService } from '@/lib/flutterwave';
import { toast } from '@/components/ui/sonner';

interface PaymentRecord {
  id: string;
  student_id: string;
  student_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  tx_ref: string;
  payment_date: string;
  description: string;
}

const PaymentManagement = () => {
  const { userProfile } = useAuthContext();
  const { students } = useStudents(userProfile?.role, userProfile?.id);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: 0,
    currency: 'NGN',
    description: 'School Fees Payment',
    payment_type: 'school_fees',
  });

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flutterwaveService.isConfigured()) {
      toast.error('Flutterwave is not configured. Please contact your administrator.');
      return;
    }
    
    setIsProcessing(true);

    try {
      const selectedStudent = students.find(s => s.id === paymentForm.student_id);
      if (!selectedStudent) {
        toast.error('Please select a student');
        return;
      }

      const paymentData = flutterwaveService.createSchoolFeePayment(
        selectedStudent.student_id,
        selectedStudent.user?.full_name || '',
        selectedStudent.user?.email || '',
        paymentForm.amount,
        paymentForm.currency,
        paymentForm.description
      );

      const response = await flutterwaveService.initializePayment(paymentData);

      if (response.status === 'success' && response.data?.link) {
        // Create payment record
        const newPayment: PaymentRecord = {
          id: Date.now().toString(),
          student_id: selectedStudent.student_id,
          student_name: selectedStudent.user?.full_name || '',
          amount: paymentForm.amount,
          currency: paymentForm.currency,
          status: 'pending',
          tx_ref: paymentData.tx_ref,
          payment_date: new Date().toISOString(),
          description: paymentForm.description,
        };

        setPayments(prev => [newPayment, ...prev]);
        
        // Open Flutterwave payment page
        window.open(response.data.link, '_blank');
        
        toast.success('Payment link generated successfully');
        setShowPaymentDialog(false);
        setPaymentForm({
          student_id: '',
          amount: 0,
          currency: 'NGN',
          description: 'School Fees Payment',
          payment_type: 'school_fees',
        });
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ];

  if (userProfile?.role === 'student') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Payments</h2>
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment records found</p>
              <p className="text-sm">Contact your school administrator for payment information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Payment Management</h2>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              <div>
                <Label htmlFor="student">Student</Label>
                <Select 
                  value={paymentForm.student_id} 
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, student_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user?.full_name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={paymentForm.currency} 
                    onValueChange={(value) => setPaymentForm(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select 
                  value={paymentForm.payment_type} 
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_fees">School Fees</SelectItem>
                    <SelectItem value="exam_fees">Exam Fees</SelectItem>
                    <SelectItem value="transport">Transport Fees</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="books">Books & Materials</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment description"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-hero" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Generate Payment Link'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-primary">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  ₦{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.student_name}</div>
                        <div className="text-sm text-muted-foreground">{payment.student_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {payment.currency === 'NGN' ? '₦' : payment.currency} {payment.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Verify payment status
                            toast.info('Checking payment status...');
                          }}
                        >
                          Verify
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment records found</p>
              <p className="text-sm">Create your first payment link to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Supported Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-medium">Credit/Debit Cards</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-medium">Bank Transfer</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-medium">Mobile Money</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-medium">USSD</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Secure Payments:</strong> All payments are processed securely through Flutterwave, 
              supporting multiple African currencies and payment methods. Parents receive email confirmations 
              and payment receipts automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;