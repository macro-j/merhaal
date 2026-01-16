import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: users } = trpc.admin.users.list.useQuery();
  const { data: destinations } = trpc.admin.destinations.list.useQuery();
  const { data: activities } = trpc.admin.activities.list.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على النظام</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">مستخدم مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المدن</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{destinations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">مدينة متاحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأماكن</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities?.length || 0}</div>
              <p className="text-xs text-muted-foreground">نشاط/مكان</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>دليل سريع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">إدارة المدن</h3>
              <p className="text-sm text-muted-foreground">أضف أو عدل المدن المتاحة للمستخدمين</p>
            </div>
            <div>
              <h3 className="font-medium">إدارة الأماكن</h3>
              <p className="text-sm text-muted-foreground">أضف الأنشطة والأماكن السياحية لكل مدينة</p>
            </div>
            <div>
              <h3 className="font-medium">إدارة المستخدمين</h3>
              <p className="text-sm text-muted-foreground">ترقية باقات المستخدمين يدويًا</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
