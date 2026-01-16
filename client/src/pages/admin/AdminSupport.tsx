import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, XCircle, Mail, User, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminSupport() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: messages, isLoading, refetch } = trpc.admin.support.list.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });

  const markResolvedMutation = trpc.admin.support.markResolved.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unresolvedCount = messages?.filter(m => !m.isResolved).length || 0;
  const resolvedCount = messages?.filter(m => m.isResolved).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">رسائل الدعم</h1>
            <p className="text-muted-foreground">إدارة طلبات واستفسارات المستخدمين</p>
          </div>
          <div className="flex gap-4 text-sm">
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" />
              {unresolvedCount} غير محلولة
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {resolvedCount} محلولة
            </Badge>
          </div>
        </div>

        {messages?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد رسائل</h3>
              <p className="text-muted-foreground">لم يتم استلام أي رسائل دعم حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {messages?.map((message: any) => (
              <Card key={message.id} className={message.isResolved ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      {message.subject}
                    </CardTitle>
                    <Badge variant={message.isResolved ? 'secondary' : 'destructive'}>
                      {message.isResolved ? 'تم الحل' : 'قيد الانتظار'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {message.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${message.email}`} className="hover:underline text-primary">
                        {message.email}
                      </a>
                    </span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  
                  <p className="text-sm bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
                    {message.message}
                  </p>
                  
                  <div className="flex justify-end">
                    <Button
                      variant={message.isResolved ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => markResolvedMutation.mutate({ 
                        id: message.id, 
                        isResolved: !message.isResolved 
                      })}
                      disabled={markResolvedMutation.isPending}
                    >
                      {message.isResolved ? (
                        <>
                          <XCircle className="w-4 h-4 me-2" />
                          إعادة فتح
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 me-2" />
                          تم الحل
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
