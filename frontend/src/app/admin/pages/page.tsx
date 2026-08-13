'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Save, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
];

const PAGES = [
  { slug: 'about', label: 'About Us' },
  { slug: 'visa', label: 'Visa Information' },
];

export default function ManagePages() {
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState('about');
  const [activeLang, setActiveLang] = useState('vi');

  // Form state
  const [title, setTitle] = useState<Record<string, string>>({ vi: '', en: '', zh: '', ko: '', ja: '' });
  const [content, setContent] = useState<Record<string, string>>({ vi: '', en: '', zh: '', ko: '', ja: '' });

  // Fetch page data
  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', activePage],
    queryFn: async () => {
      try {
        const res = await api.get(`/pages/${activePage}`);
        return res?.data || res || null;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  // When data changes, populate form
  useEffect(() => {
    if (data) {
      setTitle(data.title || { vi: '', en: '', zh: '', ko: '', ja: '' });
      setContent(data.content || { vi: '', en: '', zh: '', ko: '', ja: '' });
    } else {
      setTitle({ vi: '', en: '', zh: '', ko: '', ja: '' });
      setContent({ vi: '', en: '', zh: '', ko: '', ja: '' });
    }
  }, [data, activePage]);

  // Mutation to save
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.put(`/pages/${payload.slug}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page', activePage] });
      alert('Saved successfully!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error saving data');
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      slug: activePage,
      title,
      content,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Manage Static Pages
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Edit content for your static website pages across multiple languages.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Page Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => setActivePage(page.slug)}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors border-b-2",
                activePage === page.slug 
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              {page.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Language Tabs */}
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLang(lang.code)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      activeLang === lang.code
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Page Title ({LANGUAGES.find(l => l.code === activeLang)?.label})
                  </label>
                  <Input
                    value={title[activeLang] || ''}
                    onChange={(e) => setTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={`Enter page title in ${LANGUAGES.find(l => l.code === activeLang)?.label}...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Page Content ({LANGUAGES.find(l => l.code === activeLang)?.label})
                  </label>
                  <textarea
                    value={content[activeLang] || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={`Enter content in ${LANGUAGES.find(l => l.code === activeLang)?.label}...`}
                    className="w-full h-64 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all resize-y"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    You can use HTML tags to format your content.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  isLoading={saveMutation.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
