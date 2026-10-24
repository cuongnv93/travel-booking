'use client';

import { useState, useMemo } from 'react';
import { Shield, Search, Trash2, UserCog, Loader2, FileSpreadsheet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { exportToCsv } from '@/lib/exportCsv';
import { toast } from '@/stores/toastStore';

const fetchAdminUsers = async () => {
  const res: any = await api.get('/auth/users');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    placeholderData: keepPreviousData,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => api.patch(`/auth/users/${id}/role`, { role }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(vars.role === 'admin' ? 'Đã nâng cấp quyền Quản Trị Viên!' : 'Đã hạ quyền xuống Người Dùng!');
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật quyền: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã xóa người dùng thành công!');
    },
    onError: (err: any) => {
      toast.error('Lỗi xóa người dùng: ' + (err.response?.data?.message || err.message));
    }
  });

  const toggleRole = (user: any) => {
    if (!confirm(`Bạn có chắc muốn đổi quyền của ${user.name}?`)) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    roleMutation.mutate({ id: user._id, role: newRole });
  };

  const deleteUser = (user: any) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản ${user.email}? Hành động này không thể hoàn tác.`)) return;
    deleteMutation.mutate(user._id);
  };

  const filteredUsers = useMemo(() => {
    const s = search.toLowerCase().trim();
    return users.filter((u: any) => {
      const searchMatch = !s ||
        (u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.phone || '').toLowerCase().includes(s);

      let roleMatch = true;
      if (roleFilter !== 'all') {
        roleMatch = u.role === roleFilter;
      }

      return searchMatch && roleMatch;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleExportCsv = () => {
    if (filteredUsers.length === 0) {
      toast.warning('Không có dữ liệu người dùng để xuất!');
      return;
    }
    exportToCsv('danh_sach_nguoi_dung', filteredUsers, [
      { key: 'name', label: 'Tên Người Dùng' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Số Điện Thoại' },
      { key: 'role', label: 'Vai Trò', formatter: (u) => u.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng' },
      { key: 'createdAt', label: 'Ngày Tạo', formatter: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '' },
    ]);
  };

  if (isLoading) return <AdminTableSkeleton cols={6} rows={7} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng (Users)</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tài khoản khách hàng và quản trị viên hệ thống</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-lg flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Xuất Danh Sách CSV
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        {[
          { id: 'all', label: 'Tất Cả Người Dùng' },
          { id: 'admin', label: '🛡️ Quản Trị Viên (Admin)' },
          { id: 'user', label: 'Khách Hàng (User)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setRoleFilter(tab.id as any);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              roleFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc số điện thoại người dùng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tên Người Dùng</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Số Điện Thoại</th>
                <th className="px-6 py-3.5">Vai Trò (Role)</th>
                <th className="px-6 py-3.5">Ngày Tạo</th>
                <th className="px-6 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Chưa có người dùng nào phù hợp.</td>
                </tr>
              ) : (
                paginatedUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200">
                        {u.name ? u.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="font-semibold text-slate-900">{u.name}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-6 py-3.5 text-slate-500">{u.phone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-3.5">
                      {u.role === 'admin' ? (
                        <span className="bg-purple-50 text-purple-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 inline-flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-600" /> Quản Trị Viên
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                          Khách Hàng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-[11px] text-slate-400">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={roleMutation.isPending && roleMutation.variables?.id === u._id}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs cursor-pointer"
                        title="Đổi quyền Admin/User"
                      >
                        {roleMutation.isPending && roleMutation.variables?.id === u._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserCog className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === u._id}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs cursor-pointer"
                        title="Xóa tài khoản"
                      >
                         {deleteMutation.isPending && deleteMutation.variables === u._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
}
