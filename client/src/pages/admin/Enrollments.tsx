import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminEnrollments() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: !!user && user.role === 'admin',
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest('PUT', `/api/enrollments/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Status Updated",
        description: `Enrollment has been ${variables.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update enrollment status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredEnrollments = enrollments.filter((enrollment: any) => 
    statusFilter === "all" || enrollment.status === statusFilter
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const statsData = {
    total: enrollments.length,
    pending: enrollments.filter((e: any) => e.status === 'pending').length,
    approved: enrollments.filter((e: any) => e.status === 'approved').length,
    rejected: enrollments.filter((e: any) => e.status === 'rejected').length,
  };

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-enrollments">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Enrollment Management</h1>
          <p className="text-textSecondary">Review and manage student enrollment requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-textPrimary">{statsData.total}</div>
                  <div className="text-textSecondary">Total Requests</div>
                </div>
                <UserPlus className="h-8 w-8 text-textSecondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{statsData.pending}</div>
                  <div className="text-textSecondary">Pending</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{statsData.approved}</div>
                  <div className="text-textSecondary">Approved</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{statsData.rejected}</div>
                  <div className="text-textSecondary">Rejected</div>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-textPrimary">Filter by status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="filter-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-textSecondary">
                Showing {filteredEnrollments.length} of {enrollments.length} enrollments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Enrollment Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">
                  {statusFilter === "all" 
                    ? "No enrollment requests found" 
                    : `No ${statusFilter} enrollments found`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child Information</TableHead>
                      <TableHead>Parent Information</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment: any) => (
                      <TableRow key={enrollment.id} data-testid={`enrollment-row-${enrollment.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-textPrimary">
                              {enrollment.childName}
                            </div>
                            <div className="text-sm text-textSecondary">
                              Age: {enrollment.childAge} years old
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-textPrimary">
                              {enrollment.parentName}
                            </div>
                            <div className="text-sm text-textSecondary">
                              {enrollment.parentEmail}
                            </div>
                            <div className="text-sm text-textSecondary">
                              {enrollment.parentPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(enrollment.status)}
                            <Badge 
                              variant={getStatusBadgeVariant(enrollment.status)}
                              data-testid={`status-badge-${enrollment.id}`}
                            >
                              {enrollment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {enrollment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(enrollment.id, 'approved')}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`approve-${enrollment.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`reject-${enrollment.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {enrollment.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(enrollment.id, 'pending')}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`reset-${enrollment.id}`}
                              >
                                Reset to Pending
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
