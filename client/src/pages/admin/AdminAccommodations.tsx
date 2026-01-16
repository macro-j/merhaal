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
import { Plus, Pencil, Trash2, Hotel } from "lucide-react";
import { useState } from "react";

interface AccommodationForm {
  destinationId: number | null;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  class: 'economy' | 'mid' | 'luxury';
  priceRange: string;
  googlePlaceId: string;
  googleMapsUrl: string;
  isActive: boolean;
}

const emptyForm: AccommodationForm = {
  destinationId: null,
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  class: 'mid',
  priceRange: '',
  googlePlaceId: '',
  googleMapsUrl: '',
  isActive: true,
};

const classLabels = {
  economy: 'اقتصادي',
  mid: 'متوسط',
  luxury: 'فاخر',
};

export default function AdminAccommodations() {
  const utils = trpc.useUtils();
  const { data: accommodations, isLoading } = trpc.admin.accommodations.list.useQuery();
  const { data: cities } = trpc.admin.destinations.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AccommodationForm>(emptyForm);
  const [filterCity, setFilterCity] = useState<string>('all');

  const createMutation = trpc.admin.accommodations.create.useMutation({
    onSuccess: () => {
      utils.admin.accommodations.list.invalidate();
      toast.success('تم إضافة الإقامة');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.accommodations.update.useMutation({
    onSuccess: () => {
      utils.admin.accommodations.list.invalidate();
      toast.success('تم تحديث الإقامة');
      setIsOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.accommodations.delete.useMutation({
    onSuccess: () => {
      utils.admin.accommodations.list.invalidate();
      toast.success('تم حذف الإقامة');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destinationId) {
      toast.error('يرجى اختيار المدينة');
      return;
    }
    const data = {
      ...form,
      destinationId: form.destinationId,
      nameEn: form.nameEn || undefined,
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      priceRange: form.priceRange || undefined,
      googlePlaceId: form.googlePlaceId || undefined,
      googleMapsUrl: form.googleMapsUrl || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (accommodation: any) => {
    setEditId(accommodation.id);
    setForm({
      destinationId: accommodation.destinationId,
      nameAr: accommodation.nameAr,
      nameEn: accommodation.nameEn || '',
      descriptionAr: accommodation.descriptionAr || '',
      descriptionEn: accommodation.descriptionEn || '',
      class: accommodation.class || 'mid',
      priceRange: accommodation.priceRange || '',
      googlePlaceId: accommodation.googlePlaceId || '',
      googleMapsUrl: accommodation.googleMapsUrl || '',
      isActive: accommodation.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الإقامة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const getCityName = (destinationId: number) => {
    return cities?.find(c => c.id === destinationId)?.nameAr || '-';
  };

  const filteredAccommodations = filterCity === 'all' 
    ? accommodations 
    : accommodations?.filter(a => a.destinationId === parseInt(filterCity));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Hotel className="w-8 h-8" />
              إدارة الإقامات
            </h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل الفنادق والإقامات</p>
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
                إضافة إقامة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? 'تعديل الإقامة' : 'إضافة إقامة جديدة'}</DialogTitle>
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
                      value={form.nameAr}
                      onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                      placeholder="فندق الريتز كارلتون"
                      required
                    />
                  </div>
                  <div>
                    <Label>الاسم (إنجليزي)</Label>
                    <Input
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      placeholder="Ritz Carlton Hotel"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التصنيف</Label>
                    <Select
                      value={form.class}
                      onValueChange={(value: 'economy' | 'mid' | 'luxury') => setForm({ ...form, class: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">اقتصادي</SelectItem>
                        <SelectItem value="mid">متوسط</SelectItem>
                        <SelectItem value="luxury">فاخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نطاق السعر</Label>
                    <Input
                      value={form.priceRange}
                      onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                      placeholder="500-1000 ريال/ليلة"
                    />
                  </div>
                </div>
                <div>
                  <Label>الوصف (عربي)</Label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    className="w-full min-h-[60px] p-2 rounded-md border border-input bg-background"
                    placeholder="وصف الفندق بالعربية..."
                  />
                </div>
                <div>
                  <Label>الوصف (إنجليزي)</Label>
                  <textarea
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="w-full min-h-[60px] p-2 rounded-md border border-input bg-background"
                    placeholder="Hotel description in English..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>رابط خرائط جوجل (اختياري)</Label>
                  <Input
                    value={form.googleMapsUrl}
                    onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>Google Place ID (اختياري)</Label>
                  <Input
                    value={form.googlePlaceId}
                    onChange={(e) => setForm({ ...form, googlePlaceId: e.target.value })}
                    placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>الإقامات ({filteredAccommodations?.length || 0})</CardTitle>
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
            ) : filteredAccommodations?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا توجد إقامات. أضف إقامة جديدة للبدء.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-3 font-medium">الاسم</th>
                      <th className="text-start p-3 font-medium">المدينة</th>
                      <th className="text-start p-3 font-medium">التصنيف</th>
                      <th className="text-start p-3 font-medium">نطاق السعر</th>
                      <th className="text-start p-3 font-medium">الحالة</th>
                      <th className="text-start p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccommodations?.map((accommodation) => (
                      <tr key={accommodation.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{accommodation.nameAr}</td>
                        <td className="p-3 text-muted-foreground">{getCityName(accommodation.destinationId)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            accommodation.class === 'luxury' ? 'bg-amber-100 text-amber-700' : 
                            accommodation.class === 'mid' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {classLabels[accommodation.class as keyof typeof classLabels]}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{accommodation.priceRange || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${accommodation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {accommodation.isActive ? 'مفعل' : 'معطل'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(accommodation)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(accommodation.id)}>
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
