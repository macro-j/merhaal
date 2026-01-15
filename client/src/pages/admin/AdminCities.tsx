import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface CityForm {
  slug: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  isActive: boolean;
}

const emptyForm: CityForm = {
  slug: '',
  nameAr: '',
  nameEn: '',
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  images: [],
  isActive: true,
};

export default function AdminCities() {
  const utils = trpc.useUtils();
  const { data: cities, isLoading } = trpc.admin.destinations.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CityForm>(emptyForm);

  const createMutation = trpc.admin.destinations.create.useMutation({
    onSuccess: () => {
      utils.admin.destinations.list.invalidate();
      toast.success('تم إضافة المدينة');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.destinations.update.useMutation({
    onSuccess: () => {
      utils.admin.destinations.list.invalidate();
      toast.success('تم تحديث المدينة');
      setIsOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.destinations.delete.useMutation({
    onSuccess: () => {
      utils.admin.destinations.list.invalidate();
      toast.success('تم حذف المدينة');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (city: any) => {
    setEditId(city.id);
    setForm({
      slug: city.slug || '',
      nameAr: city.nameAr,
      nameEn: city.nameEn,
      titleAr: city.titleAr,
      titleEn: city.titleEn,
      descriptionAr: city.descriptionAr,
      descriptionEn: city.descriptionEn,
      images: city.images || [],
      isActive: city.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المدينة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة المدن</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل المدن المتاحة</p>
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
                إضافة مدينة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Slug (معرف URL)</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="riyadh"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                    <Label>مفعلة</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم (عربي)</Label>
                    <Input
                      value={form.nameAr}
                      onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                      placeholder="الرياض"
                      required
                    />
                  </div>
                  <div>
                    <Label>الاسم (إنجليزي)</Label>
                    <Input
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      placeholder="Riyadh"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>العنوان (عربي)</Label>
                    <Input
                      value={form.titleAr}
                      onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                      placeholder="قلب المملكة النابض"
                      required
                    />
                  </div>
                  <div>
                    <Label>العنوان (إنجليزي)</Label>
                    <Input
                      value={form.titleEn}
                      onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                      placeholder="The Beating Heart"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>الوصف (عربي)</Label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background"
                    placeholder="وصف المدينة بالعربية..."
                    required
                  />
                </div>
                <div>
                  <Label>الوصف (إنجليزي)</Label>
                  <textarea
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background"
                    placeholder="City description in English..."
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <Label>مسار الصورة</Label>
                  <Input
                    value={form.images[0] || ''}
                    onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                    placeholder="/images/cities/riyadh-hero.jpg"
                    dir="ltr"
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
          <CardHeader>
            <CardTitle>المدن ({cities?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">جارٍ التحميل...</p>
            ) : cities?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا توجد مدن. أضف مدينة جديدة للبدء.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-3 font-medium">المعرف</th>
                      <th className="text-start p-3 font-medium">الاسم</th>
                      <th className="text-start p-3 font-medium">العنوان</th>
                      <th className="text-start p-3 font-medium">الحالة</th>
                      <th className="text-start p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities?.map((city) => (
                      <tr key={city.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{city.slug || city.id}</td>
                        <td className="p-3">{city.nameAr}</td>
                        <td className="p-3 text-muted-foreground">{city.titleAr}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${city.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {city.isActive ? 'مفعلة' : 'معطلة'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(city)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(city.id)}>
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
