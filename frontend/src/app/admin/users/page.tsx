'use client';

import { useState } from 'react';
import { Shield, Search, Trash2, UserCog, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

const fetchAdminUsers = async () => {
  const res: any = await api.get('/auth/users');
  return res || [];
};

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    placeholderData: keepPreviousData,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => api.patch(`/auth/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      alert('Lỗi cập nhật quyền: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      alert('Lỗi xóa người dùng: ' + (err.response?.data?.message || err.message));
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

  const filteredUsers = users.filter((u: any) => {
    return (
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) return <AdminTableSkeleton cols={6} rows={7} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng (Users)</h1>
        <p className="text-xs text-slate-500 mt-1">Danh sách tài khoản khách hàng và quản trị viên hệ thống</p>
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400">Đang tải danh sách tài khoản...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400">Chưa có người dùng nào.</td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
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
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={roleMutation.isPending && roleMutation.variables?.id === u._id}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs"
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
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs"
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
      </div>
    </div>
  );
}
