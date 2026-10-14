'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Plus, Trash2, Eye, EyeOff, X, Search, Upload, Loader2, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { getI18nText } from '@/lib/utils';
import { AdminI18nTabs, createEmptyI18nRecord, toI18nRecord, sanitizeI18nRecord } from '@/components/admin/common/AdminI18nTabs';

const fetchAdminNews = async () => {
  const res: any = await api.get('/news/admin/all');
  return res?.data || [];
};

const CATEGORIES = [
  { value: 'experience', label: 'Kinh nghiệm du lịch' },
  { value: 'food', label: 'Ẩm thực & Văn hóa' },
  { value: 'destination', label: 'Điểm đến nổi bật' },
  { value: 'international', label: 'Du lịch Quốc tế' },
];

const toSlug = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

interface NewsTableRowProps {
  article: any;
  onEdit: (article: any) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, val: boolean) => void;
}

const NewsTableRow = memo(function NewsTableRow({
  article,
  onEdit,
  onDelete,
  onTogglePublish,
}: NewsTableRowProps) {
  const [imgSrc, setImgSrc] = useState(article.thumbnail || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800');

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="px-6 py-3.5 flex items-center gap-3">
        <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgSrc('https://images.unsplash.com/photo-1528127269322-539801943592?w=800')}
            />
          ) : (
            <FileText className="w-4 h-4 text-slate-400 m-auto mt-3" />
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{getI18nText(article.title, 'vi') || 'Untitled'}</p>
          <p className="text-[11px] text-slate-400 font-mono">{article.slug}</p>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
          {CATEGORIES.find((c) => c.value === article.category)?.label || article.category}
        </span>
      </td>
      <td className="px-6 py-3.5 text-slate-600">{article.author}</td>
      <td className="px-6 py-3.5">
        <button
          onClick={() => onTogglePublish(article._id, !article.isPublished)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
            article.isPublished
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {article.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {article.isPublished ? 'Đã đăng' : 'Nháp'}
        </button>
      </td>
      <td className="px-6 py-3.5 text-right space-x-1.5">
        <button
          onClick={() => onEdit(article)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(article._id)}
          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
});

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [activeLang, setActiveLang] = useState<string>('vi');
  const [title, setTitle] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [excerpt, setExcerpt] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [content, setContent] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('experience');
  const [author, setAuthor] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const { data: newsList = [], isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: fetchAdminNews,
    placeholderData: keepPreviousData,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setIsUploading(true);
      const res: any = await api.post('/upload', formData);
      if (res?.url) setThumbnail(res.url);
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingArticle) return api.put(`/news/${editingArticle._id || editingArticle.id}`, payload);
      return api.post('/news', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['latest-news-home'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => alert('Lỗi lưu bài viết: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['latest-news-home'] });
    },
    onError: (err: any) => alert('Lỗi xóa bài viết: ' + err.message),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) =>
      api.put(`/news/${id}`, { isPublished: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['latest-news-home'] });
    },
  });

  const resetForm = () => {
    setEditingArticle(null);
    setActiveLang('vi');
    setTitle(createEmptyI18nRecord());
    setExcerpt(createEmptyI18nRecord());
    setContent(createEmptyI18nRecord());
    setThumbnail(''); setCategory('experience'); setAuthor(''); setIsPublished(true);
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setActiveLang('vi');
    setTitle(toI18nRecord(article.title));
    setExcerpt(toI18nRecord(article.excerpt));
    setContent(toI18nRecord(article.content));
    setThumbnail(article.thumbnail || '');
    setCategory(article.category || 'experience');
    setAuthor(article.author || '');
    setIsPublished(article.isPublished !== false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingArticle?.slug || toSlug(title.vi || 'bai-viet-' + Date.now());
    saveMutation.mutate({
      slug,
      title: sanitizeI18nRecord(title),
      excerpt: sanitizeI18nRecord(excerpt),
      content: sanitizeI18nRecord(content),
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
      category,
      author: author || 'Biên tập viên',
      isPublished,
    });
  };

  const handleDelete = useCallback((id: string) => {
    if (confirm('Xóa bài viết này?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleTogglePublish = useCallback((id: string, val: boolean) => {
    togglePublishMutation.mutate({ id, val });
  }, [togglePublishMutation]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return newsList.filter((n: any) => {
      const t = typeof n.title === 'string' ? n.title : (n.title?.vi || n.title?.en || '');
      return !s || t.toLowerCase().includes(s);
    });
  }, [newsList, search]);

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Tin Tức & Bài Viết</h1>
          <p className="text-xs text-slate-500 mt-1">Tạo và chỉnh sửa nội dung cẩm nang du lịch</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Tạo Bài Viết Mới
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Tìm kiếm bài viết..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Bài viết</th>
                <th className="px-6 py-3.5">Danh mục</th>
                <th className="px-6 py-3.5">Tác giả</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-slate-400">Chưa có bài viết nào.</td></tr>
              ) : (
                filtered.map((article: any) => (
                  <NewsTableRow
                    key={article._id}
                    article={article}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onTogglePublish={handleTogglePublish}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingArticle ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-800">Thông tin bài viết & Đa ngôn ngữ</h3>
                </div>

                <AdminI18nTabs
                  activeLang={activeLang}
                  onChange={setActiveLang}
                  hasContent={{
                    vi: !!title.vi,
                    en: !!title.en,
                    zh: !!title.zh,
                    ko: !!title.ko,
                    ja: !!title.ja,
                  }}
                  label="Chọn ngôn ngữ nhập liệu cho Tiêu đề, Tóm tắt & Nội dung:"
                />

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Tiêu đề ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}
                  </label>
                  <input
                    required={activeLang === 'vi'}
                    value={title[activeLang] || ''}
                    onChange={(e) => setTitle((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={activeLang === 'vi' ? 'VD: Top 10 điểm đến đẹp nhất Việt Nam' : `Tiêu đề bằng tiếng ${activeLang.toUpperCase()}...`}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Tóm tắt Excerpt ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}
                  </label>
                  <textarea
                    rows={2}
                    required={activeLang === 'vi'}
                    value={excerpt[activeLang] || ''}
                    onChange={(e) => setExcerpt((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder="Tóm tắt ngắn gọn nội dung bài viết (hiển thị ở trang listing)..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Nội dung bài viết ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}
                  </label>
                  <textarea
                    rows={8}
                    required={activeLang === 'vi'}
                    value={content[activeLang] || ''}
                    onChange={(e) => setContent((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder="Nội dung đầy đủ bài viết. Hỗ trợ HTML tags (<h2>, <p>, <ul>, <li>, <strong>)..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Danh mục *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tác giả</label>
                  <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nguyễn Văn A"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Ảnh Thumbnail *</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 transition-colors bg-slate-50/50">
                  {thumbnail ? (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-100">
                          Thay ảnh <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button type="button" onClick={() => setThumbnail('')}
                          className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-700">Xóa</button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-3">
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs">Đang tải lên...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-blue-500 mb-1" />
                          <span className="text-xs font-semibold text-slate-700">Tải ảnh từ máy tính</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </>
                      )}
                    </label>
                  )}
                </div>
                <input type="text" value={thumbnail} onChange={e => setThumbnail(e.target.value)}
                  placeholder="Hoặc dán URL ảnh thumbnail..."
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                <label htmlFor="isPublished" className="text-xs font-medium text-slate-700">Xuất bản ngay (Published)</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending || isUploading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50 text-xs">
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
