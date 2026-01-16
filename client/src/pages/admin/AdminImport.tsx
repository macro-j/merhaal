import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2, Building2, MapPin, Hotel, ArrowRight, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ValidationError {
  row: number;
  column: string;
  reason: string;
}

interface DatasetState {
  file: File | null;
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  data: any[];
  headers: string[];
  errors: ValidationError[];
  isValid: boolean;
  isProcessing: boolean;
}

const initialDatasetState: DatasetState = {
  file: null,
  fileName: '',
  sheetNames: [],
  selectedSheet: '',
  data: [],
  headers: [],
  errors: [],
  isValid: false,
  isProcessing: false,
};

const CITIES_REQUIRED_HEADERS = ['city_id', 'name_ar', 'name_en'];
const CITIES_OPTIONAL_HEADERS = ['description_ar', 'description_en', 'image_url', 'is_active'];

const ACTIVITIES_REQUIRED_HEADERS = ['activity_id', 'city_id', 'name_ar', 'category'];
const ACTIVITIES_OPTIONAL_HEADERS = ['name_en', 'description_ar', 'tags', 'budget_level', 'best_time', 'duration_min', 'is_indoor', 'is_unique', 'google_maps_url', 'tier_required', 'is_active'];

const ACCOMMODATIONS_REQUIRED_HEADERS = ['accommodation_id', 'city_id', 'name_ar', 'class'];
const ACCOMMODATIONS_OPTIONAL_HEADERS = ['name_en', 'price_range', 'description_ar', 'google_maps_url', 'tier_required', 'is_active'];

const SHEET_NAMES = {
  cities: 'Cities',
  activities: 'Activities',
  accommodations: 'Accommodations',
};

const VALID_TIERS = ['free', 'smart', 'professional'];
const VALID_BUDGET_LEVELS = ['low', 'medium', 'high'];
const VALID_BEST_TIMES = ['morning', 'afternoon', 'evening', 'anytime'];
const VALID_ACC_CLASSES = ['economy', 'mid', 'luxury'];

export default function AdminImport() {
  const [cities, setCities] = useState<DatasetState>({ ...initialDatasetState });
  const [activities, setActivities] = useState<DatasetState>({ ...initialDatasetState });
  const [accommodations, setAccommodations] = useState<DatasetState>({ ...initialDatasetState });
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const citiesInputRef = useRef<HTMLInputElement | null>(null);
  const activitiesInputRef = useRef<HTMLInputElement | null>(null);
  const accommodationsInputRef = useRef<HTMLInputElement | null>(null);

  const { data: existingCities } = trpc.destinations.list.useQuery();

  const importMutation = trpc.admin.bulkImport.useMutation({
    onSuccess: (result: any) => {
      setImportResults(result);
      toast.success('تم الاستيراد بنجاح');
      setCities({ ...initialDatasetState });
      setActivities({ ...initialDatasetState });
      setAccommodations({ ...initialDatasetState });
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء الاستيراد');
    },
    onSettled: () => {
      setImporting(false);
    },
  });

  const normalizeBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'نعم';
    }
    if (typeof value === 'number') return value === 1;
    return true;
  };

  const parseFile = async (file: File, datasetType: 'cities' | 'activities' | 'accommodations') => {
    const setter = datasetType === 'cities' ? setCities : datasetType === 'activities' ? setActivities : setAccommodations;
    
    setter(prev => ({ ...prev, isProcessing: true, file, fileName: file.name }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
      const sheetNames = workbook.SheetNames;
      
      const expectedSheet = SHEET_NAMES[datasetType];
      const defaultSheet = sheetNames.find(s => s === expectedSheet) ||
                          sheetNames.find(s => s.toLowerCase() === expectedSheet.toLowerCase()) ||
                          sheetNames[0];

      setter(prev => ({
        ...prev,
        sheetNames,
        selectedSheet: defaultSheet,
        isProcessing: false,
      }));

      processSheet(workbook, defaultSheet, datasetType);
    } catch (error) {
      setter(prev => ({
        ...prev,
        isProcessing: false,
        errors: [{ row: 0, column: '', reason: 'فشل في قراءة الملف' }],
        isValid: false,
      }));
    }
  };

  const processSheet = (workbook: XLSX.WorkBook, sheetName: string, datasetType: 'cities' | 'activities' | 'accommodations') => {
    const setter = datasetType === 'cities' ? setCities : datasetType === 'activities' ? setActivities : setAccommodations;
    const requiredHeaders = datasetType === 'cities' ? CITIES_REQUIRED_HEADERS : 
                           datasetType === 'activities' ? ACTIVITIES_REQUIRED_HEADERS : ACCOMMODATIONS_REQUIRED_HEADERS;

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    
    if (jsonData.length === 0) {
      setter(prev => ({
        ...prev,
        data: [],
        headers: [],
        errors: [{ row: 0, column: '', reason: 'الملف فارغ' }],
        isValid: false,
      }));
      return;
    }

    const headers = Object.keys(jsonData[0] as object);
    const errors: ValidationError[] = [];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        column: missingHeaders.join(', '),
        reason: `أعمدة مطلوبة مفقودة: ${missingHeaders.join(', ')}`,
      });
    }

    const seenIds = new Set<string>();

    jsonData.forEach((row: any, index: number) => {
      const rowNum = index + 2;

      if (datasetType === 'cities') {
        if (!row.city_id || String(row.city_id).trim() === '') {
          errors.push({ row: rowNum, column: 'city_id', reason: 'معرف المدينة مطلوب' });
        } else if (seenIds.has(String(row.city_id))) {
          errors.push({ row: rowNum, column: 'city_id', reason: 'معرف مكرر' });
        } else {
          seenIds.add(String(row.city_id));
        }
        if (!row.name_ar || String(row.name_ar).trim() === '') {
          errors.push({ row: rowNum, column: 'name_ar', reason: 'اسم المدينة بالعربية مطلوب' });
        }
      }

      if (datasetType === 'activities') {
        if (!row.activity_id || String(row.activity_id).trim() === '') {
          errors.push({ row: rowNum, column: 'activity_id', reason: 'معرف النشاط مطلوب' });
        } else if (seenIds.has(String(row.activity_id))) {
          errors.push({ row: rowNum, column: 'activity_id', reason: 'معرف مكرر' });
        } else {
          seenIds.add(String(row.activity_id));
        }
        if (!row.name_ar || String(row.name_ar).trim() === '') {
          errors.push({ row: rowNum, column: 'name_ar', reason: 'اسم النشاط بالعربية مطلوب' });
        }
        if (!row.city_id) {
          errors.push({ row: rowNum, column: 'city_id', reason: 'معرف المدينة مطلوب' });
        }
        if (!row.category || String(row.category).trim() === '') {
          errors.push({ row: rowNum, column: 'category', reason: 'فئة النشاط مطلوبة' });
        }
        if (row.tier_required && !VALID_TIERS.includes(String(row.tier_required).toLowerCase())) {
          errors.push({ row: rowNum, column: 'tier_required', reason: `قيمة غير صالحة: ${row.tier_required}` });
        }
        if (row.budget_level && !VALID_BUDGET_LEVELS.includes(String(row.budget_level).toLowerCase())) {
          errors.push({ row: rowNum, column: 'budget_level', reason: `قيمة غير صالحة: ${row.budget_level}` });
        }
        if (row.best_time && !VALID_BEST_TIMES.includes(String(row.best_time).toLowerCase())) {
          errors.push({ row: rowNum, column: 'best_time', reason: `قيمة غير صالحة: ${row.best_time}` });
        }
      }

      if (datasetType === 'accommodations') {
        if (!row.accommodation_id || String(row.accommodation_id).trim() === '') {
          errors.push({ row: rowNum, column: 'accommodation_id', reason: 'معرف الإقامة مطلوب' });
        } else if (seenIds.has(String(row.accommodation_id))) {
          errors.push({ row: rowNum, column: 'accommodation_id', reason: 'معرف مكرر' });
        } else {
          seenIds.add(String(row.accommodation_id));
        }
        if (!row.name_ar || String(row.name_ar).trim() === '') {
          errors.push({ row: rowNum, column: 'name_ar', reason: 'اسم الإقامة بالعربية مطلوب' });
        }
        if (!row.city_id) {
          errors.push({ row: rowNum, column: 'city_id', reason: 'معرف المدينة مطلوب' });
        }
        if (row.class && !VALID_ACC_CLASSES.includes(String(row.class).toLowerCase())) {
          errors.push({ row: rowNum, column: 'class', reason: `قيمة غير صالحة: ${row.class}` });
        }
        if (row.tier_required && !VALID_TIERS.includes(String(row.tier_required).toLowerCase())) {
          errors.push({ row: rowNum, column: 'tier_required', reason: `قيمة غير صالحة: ${row.tier_required}` });
        }
      }
    });

    const normalizedData = jsonData.map((row: any) => {
      const normalized: any = { ...row };
      if ('is_active' in normalized) {
        normalized.is_active = normalizeBoolean(normalized.is_active);
      }
      if ('is_indoor' in normalized) {
        normalized.is_indoor = normalizeBoolean(normalized.is_indoor);
      }
      if ('is_unique' in normalized) {
        normalized.is_unique = normalizeBoolean(normalized.is_unique);
      }
      if ('tier_required' in normalized && normalized.tier_required) {
        normalized.tier_required = String(normalized.tier_required).toLowerCase();
      }
      if ('budget_level' in normalized && normalized.budget_level) {
        normalized.budget_level = String(normalized.budget_level).toLowerCase();
      }
      if ('best_time' in normalized && normalized.best_time) {
        normalized.best_time = String(normalized.best_time).toLowerCase();
      }
      if ('class' in normalized && normalized.class) {
        normalized.class = String(normalized.class).toLowerCase();
      }
      if ('tags' in normalized && typeof normalized.tags === 'string') {
        normalized.tags = normalized.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      if ('city_id' in normalized) {
        normalized.city_id = parseInt(String(normalized.city_id), 10);
      }
      if ('activity_id' in normalized) {
        normalized.activity_id = parseInt(String(normalized.activity_id), 10);
      }
      if ('accommodation_id' in normalized) {
        normalized.accommodation_id = parseInt(String(normalized.accommodation_id), 10);
      }
      if ('duration_min' in normalized && normalized.duration_min) {
        normalized.duration_min = parseInt(String(normalized.duration_min), 10);
      }
      return normalized;
    });

    setter(prev => ({
      ...prev,
      data: normalizedData,
      headers,
      errors,
      isValid: errors.length === 0,
      selectedSheet: sheetName,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, datasetType: 'cities' | 'activities' | 'accommodations') => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file, datasetType);
    }
  };

  const handleSheetChange = (sheetName: string, datasetType: 'cities' | 'activities' | 'accommodations') => {
    const state = datasetType === 'cities' ? cities : datasetType === 'activities' ? activities : accommodations;
    if (state.file) {
      state.file.arrayBuffer().then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        processSheet(workbook, sheetName, datasetType);
      });
    }
  };

  const handleImport = () => {
    setImporting(true);
    const payload: any = {};
    
    if (cities.isValid && cities.data.length > 0) {
      payload.cities = cities.data;
    }
    if (activities.isValid && activities.data.length > 0) {
      payload.activities = activities.data;
    }
    if (accommodations.isValid && accommodations.data.length > 0) {
      payload.accommodations = accommodations.data;
    }

    if (Object.keys(payload).length === 0) {
      toast.error('لا توجد بيانات صالحة للاستيراد');
      setImporting(false);
      return;
    }

    importMutation.mutate(payload);
  };

  const canImport = (cities.isValid && cities.data.length > 0) || 
                    (activities.isValid && activities.data.length > 0) || 
                    (accommodations.isValid && accommodations.data.length > 0);

  const renderDatasetUpload = (
    title: string,
    icon: React.ReactNode,
    state: DatasetState,
    inputRef: React.RefObject<HTMLInputElement | null>,
    datasetType: 'cities' | 'activities' | 'accommodations',
    requiredHeaders: string[],
    optionalHeaders: string[]
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          الأعمدة المطلوبة: {requiredHeaders.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            ref={inputRef as any}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileChange(e, datasetType)}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={state.isProcessing}
          >
            {state.isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {state.fileName || 'اختر ملف CSV أو Excel'}
          </Button>
        </div>

        {state.sheetNames.length > 1 && (
          <div>
            <Label>اختر الورقة</Label>
            <Select value={state.selectedSheet} onValueChange={(v) => handleSheetChange(v, datasetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.sheetNames.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {state.data.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">
              {state.data.length} صف
            </Badge>
            {state.isValid ? (
              <Badge className="bg-green-100 text-green-800 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                صالح للاستيراد
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" />
                {state.errors.length} خطأ
              </Badge>
            )}
          </div>
        )}

        {state.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <ScrollArea className="h-32">
                <ul className="space-y-1 text-sm">
                  {state.errors.slice(0, 20).map((error, idx) => (
                    <li key={idx}>
                      {error.row > 0 && <strong>صف {error.row}: </strong>}
                      {error.column && <span>[{error.column}] </span>}
                      {error.reason}
                    </li>
                  ))}
                  {state.errors.length > 20 && (
                    <li className="text-muted-foreground">...و {state.errors.length - 20} أخطاء أخرى</li>
                  )}
                </ul>
              </ScrollArea>
            </AlertDescription>
          </Alert>
        )}

        {state.isValid && state.data.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">معاينة (أول 5 صفوف)</Label>
            <ScrollArea className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {state.headers.slice(0, 6).map(h => (
                        <th key={h} className="px-2 py-1 text-start font-medium">{h}</th>
                      ))}
                      {state.headers.length > 6 && <th className="px-2 py-1">...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {state.headers.slice(0, 6).map(h => (
                          <td key={h} className="px-2 py-1 max-w-[150px] truncate">
                            {typeof row[h] === 'boolean' ? (row[h] ? 'نعم' : 'لا') :
                             Array.isArray(row[h]) ? row[h].join(', ') :
                             String(row[h] || '-')}
                          </td>
                        ))}
                        {state.headers.length > 6 && <td className="px-2 py-1">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">استيراد البيانات</h1>
          <p className="text-muted-foreground">
            استيراد المدن والأنشطة والإقامات من ملفات CSV أو Excel
          </p>
        </div>

        {importResults && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-800">تم الاستيراد بنجاح!</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {importResults.cities && (
                    <div>
                      <span className="text-muted-foreground">المدن: </span>
                      <span className="text-green-700">{importResults.cities.inserted} جديد, {importResults.cities.updated} محدث</span>
                    </div>
                  )}
                  {importResults.activities && (
                    <div>
                      <span className="text-muted-foreground">الأنشطة: </span>
                      <span className="text-green-700">{importResults.activities.inserted} جديد, {importResults.activities.updated} محدث</span>
                    </div>
                  )}
                  {importResults.accommodations && (
                    <div>
                      <span className="text-muted-foreground">الإقامات: </span>
                      <span className="text-green-700">{importResults.accommodations.inserted} جديد, {importResults.accommodations.updated} محدث</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/cities'}>
                    <Building2 className="w-4 h-4 me-1" /> عرض المدن
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/activities'}>
                    <MapPin className="w-4 h-4 me-1" /> عرض الأنشطة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/accommodations'}>
                    <Hotel className="w-4 h-4 me-1" /> عرض الإقامات
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {renderDatasetUpload(
            'المدن',
            <Building2 className="w-5 h-5" />,
            cities,
            citiesInputRef,
            'cities',
            CITIES_REQUIRED_HEADERS,
            CITIES_OPTIONAL_HEADERS
          )}
          {renderDatasetUpload(
            'الأنشطة',
            <MapPin className="w-5 h-5" />,
            activities,
            activitiesInputRef,
            'activities',
            ACTIVITIES_REQUIRED_HEADERS,
            ACTIVITIES_OPTIONAL_HEADERS
          )}
          {renderDatasetUpload(
            'الإقامات',
            <Hotel className="w-5 h-5" />,
            accommodations,
            accommodationsInputRef,
            'accommodations',
            ACCOMMODATIONS_REQUIRED_HEADERS,
            ACCOMMODATIONS_OPTIONAL_HEADERS
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {canImport ? (
                  <span className="text-green-600">جاهز للاستيراد</span>
                ) : (
                  <span>اختر ملفات صالحة للاستيراد</span>
                )}
              </div>
              <Button
                onClick={handleImport}
                disabled={!canImport || importing}
                className="gap-2"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                تأكيد الاستيراد
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">دليل الأعمدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <h4 className="font-medium mb-2">المدن (Cities)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>nameAr*</strong>: اسم المدينة بالعربية</li>
                  <li>nameEn: اسم المدينة بالإنجليزية</li>
                  <li>descriptionAr: وصف بالعربية</li>
                  <li>descriptionEn: وصف بالإنجليزية</li>
                  <li>image: رابط الصورة</li>
                  <li>region: المنطقة</li>
                  <li>isActive: مفعل (true/false)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">الأنشطة (Activities)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>destinationId*</strong>: معرف المدينة</li>
                  <li><strong>name*</strong>: اسم النشاط</li>
                  <li><strong>type*</strong>: نوع النشاط</li>
                  <li>category: التصنيف</li>
                  <li>tags: كلمات مفتاحية (مفصولة بفاصلة)</li>
                  <li>budgetLevel: low/medium/high</li>
                  <li>bestTimeOfDay: morning/afternoon/evening/anytime</li>
                  <li>minTier: free/smart/professional</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">الإقامات (Accommodations)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>destinationId*</strong>: معرف المدينة</li>
                  <li><strong>nameAr*</strong>: اسم الإقامة بالعربية</li>
                  <li><strong>class*</strong>: economy/mid/luxury</li>
                  <li>nameEn: اسم بالإنجليزية</li>
                  <li>descriptionAr: وصف بالعربية</li>
                  <li>priceRange: نطاق السعر</li>
                  <li>googleMapsUrl: رابط خرائط Google</li>
                  <li>rating: التقييم (0-5)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
