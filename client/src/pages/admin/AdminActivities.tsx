import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface ActivityForm {
  destinationId: number | null;
  name: string;
  nameEn: string;
  type: string;
  duration: string;
  cost: string;
  minTier: 'free' | 'smart' | 'professional';
  details: string;
  isActive: boolean;
}

const emptyForm: ActivityForm = {
  destinationId: null,
  name: '',
  nameEn: '',
  type: '',
  duration: '',
  cost: '0',
  minTier: 'free',
  details: '',
  isActive: true,
};

const activityTypes = [
  'ثقافة وتراث',
  'طبيعة ومناظر',
  'تسوق وترفيه',
  'مطاعم ومقاهي',
  'أنشطة ومغامرات',
  'متاحف ومعارض',
];

export default function AdminActivities() {
  const utils = trpc.useUtils();
  const { data: activities, isLoading } = trpc.admin.activities.list.useQuery();
  const { data: cities } = trpc.admin.destinations.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [filterCity, setFilterCity] = useState<string>('all');

  const createMutation = trpc.admin.activities.create.useMutation({
    onSuccess: () => {
      utils.admin.activities.list.invalidate();
      toast.success('تم إضافة النشاط');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.activities.update.useMutation({
    onSuccess: () => {
      utils.admin.activities.list.invalidate();
      toast.success('تم تحديث النشاط');
      setIsOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.activities.delete.useMutation({
    onSuccess: () => {
      utils.admin.activities.list.invalidate();
      toast.success('تم حذف النشاط');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destinationId) {
      toast.error('يرجى اختيار المدينة');
      return;
    }
    if (editId) {
      updateMutation.mutate({ id: editId, ...form, destinationId: form.destinationId });
    } else {
      createMutation.mutate({ ...form, destinationId: form.destinationId });
    }
  };

  const handleEdit = (activity: any) => {
    setEditId(activity.id);
    setForm({
      destinationId: activity.destinationId,
      name: activity.name,
      nameEn: activity.nameEn || '',
      type: activity.type,
      duration: activity.duration || '',
      cost: activity.cost || '0',
      minTier: activity.minTier || 'free',
      details: activity.details || '',
      isActive: activity.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const getCityName = (destinationId: number) => {
    return cities?.find(c => c.id === destinationId)?.nameAr || '-';
  };

  const filteredActivities = filterCity === 'all' 
    ? activities 
    : activities?.filter(a => a.destinationId === parseInt(filterCity));

  const tierLabels = {
    free: 'مجاني',
    smart: 'ذكي',
    professional: 'احترافي',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الأماكن والأنشطة</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل الأماكن السياحية</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setForm(emptyForm);
              setEditId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 me-2" />
                إضافة نشاط
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? 'تعديل النشاط' : 'إضافة نشاط جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المدينة</Label>
                    <Select
                      value={form.destinationId?.toString() || ''}
                      onValueChange={(value) => setForm({ ...form, destinationId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                    <Label>مفعل</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم (عربي)</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="حي البلد التاريخي"
                      required
                    />
                  </div>
                  <div>
                    <Label>الاسم (إنجليزي)</Label>
                    <Input
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      placeholder="Al-Balad Historic District"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>النوع</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value) => setForm({ ...form, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المدة</Label>
                    <Input
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="2-3 ساعات"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التكلفة (ريال)</Label>
                    <Input
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                      placeholder="0"
                      type="number"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>الحد الأدنى للباقة</Label>
                    <Select
                      value={form.minTier}
                      onValueChange={(value: 'free' | 'smart' | 'professional') => setForm({ ...form, minTier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">مجاني</SelectItem>
                        <SelectItem value="smart">ذكي</SelectItem>
                        <SelectItem value="professional">احترافي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>تفاصيل</Label>
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background"
                    placeholder="تفاصيل إضافية عن النشاط..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editId ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>الأنشطة ({filteredActivities?.length || 0})</CardTitle>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب المدينة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities?.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">جارٍ التحميل...</p>
            ) : filteredActivities?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا توجد أنشطة. أضف نشاط جديد للبدء.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-3 font-medium">الاسم</th>
                      <th className="text-start p-3 font-medium">المدينة</th>
                      <th className="text-start p-3 font-medium">النوع</th>
                      <th className="text-start p-3 font-medium">التكلفة</th>
                      <th className="text-start p-3 font-medium">الباقة</th>
                      <th className="text-start p-3 font-medium">الحالة</th>
                      <th className="text-start p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities?.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{activity.name}</td>
                        <td className="p-3 text-muted-foreground">{getCityName(activity.destinationId)}</td>
                        <td className="p-3 text-sm">{activity.type}</td>
                        <td className="p-3">{activity.cost || '0'} ريال</td>
                        <td className="p-3 text-sm">{tierLabels[activity.minTier as keyof typeof tierLabels]}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${activity.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {activity.isActive ? 'مفعل' : 'معطل'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(activity)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(activity.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
