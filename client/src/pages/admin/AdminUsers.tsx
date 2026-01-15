import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.list.useQuery();
  
  const updateTierMutation = trpc.admin.users.updateTier.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success('تم تحديث الباقة');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success('تم تحديث الصلاحيات');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const tierLabels = {
    free: 'مجاني',
    smart: 'ذكي',
    professional: 'احترافي',
  };

  const roleLabels = {
    user: 'مستخدم',
    admin: 'مدير',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">تعديل باقات وصلاحيات المستخدمين</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">جارٍ التحميل...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-3 font-medium">الاسم</th>
                      <th className="text-start p-3 font-medium">البريد الإلكتروني</th>
                      <th className="text-start p-3 font-medium">الباقة</th>
                      <th className="text-start p-3 font-medium">الصلاحيات</th>
                      <th className="text-start p-3 font-medium">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{user.name}</td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <Select
                            value={user.tier}
                            onValueChange={(value: 'free' | 'smart' | 'professional') => {
                              updateTierMutation.mutate({ userId: user.id, tier: value });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">{tierLabels.free}</SelectItem>
                              <SelectItem value="smart">{tierLabels.smart}</SelectItem>
                              <SelectItem value="professional">{tierLabels.professional}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select
                            value={user.role}
                            onValueChange={(value: 'user' | 'admin') => {
                              updateRoleMutation.mutate({ userId: user.id, role: value });
                            }}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">{roleLabels.user}</SelectItem>
                              <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
