'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Trash2,
  Pencil,
  Power,
  PowerOff,
  UserCheck,
  UserX,
  FileSpreadsheet,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { AdminConfirmModal } from '@/components/admin/common/AdminConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

const fetchAdminUsers = async () => {
  const res: any = await api.get('/auth/users');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'info';
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    placeholderData: keepPreviousData,
  });

  // Edit user mutation
  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.put(`/auth/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Cập nhật thông tin người dùng thành công!');
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật người dùng: ' + (err.response?.data?.message || err.message));
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/auth/users/${id}/status`),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res?.message || 'Đã cập nhật trạng thái người dùng!');
    },
    onError: (err: any) => {
      toast.error('Lỗi đổi trạng thái: ' + (err.response?.data?.message || err.message));
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã xóa người dùng thành công!');
    },
    onError: (err: any) => {
      toast.error('Lỗi xóa người dùng: ' + (err.response?.data?.message || err.message));
    },
  });

  const isUserSelf = useCallback((user: any) => {
    if (!currentUser) return false;
    const userId = user._id || user.id;
    return Boolean(
      userId === currentUser.id ||
      userId === (currentUser as any)._id ||
      (user.email && currentUser.email && user.email.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [currentUser]);

  const openEditModal = (user: any) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền chỉnh sửa thông tin người dùng!');
      return;
    }
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền chỉnh sửa thông tin người dùng!');
      return;
    }
    if (!editingUser) return;
    const userId = editingUser._id || editingUser.id;
    editMutation.mutate({ id: userId, payload: editForm });
  };

  const handleToggleStatus = (user: any) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền thay đổi trạng thái tài khoản!');
      return;
    }
    const userId = user._id || user.id;
    const isSelf = isUserSelf(user);
    if (isSelf) {
      toast.warning('Bạn không thể tự vô hiệu hóa tài khoản quản trị của chính mình!');
      return;
    }

    const nextActive = user.isActive === false;
    setConfirmModal({
      isOpen: true,
      title: nextActive ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản',
      message: nextActive
        ? `Bạn có chắc chắn muốn kích hoạt lại tài khoản ${user.email}? Người dùng sẽ có thể đăng nhập bình thường.`
        : `Bạn có chắc chắn muốn tạm khóa (vô hiệu hóa) tài khoản ${user.email}? Người dùng này sẽ không thể đăng nhập vào hệ thống.`,
      confirmText: nextActive ? 'Kích hoạt' : 'Khóa tài khoản',
      variant: nextActive ? 'primary' : 'warning',
      onConfirm: async () => {
        await toggleStatusMutation.mutateAsync(userId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteUser = (user: any) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền xóa tài khoản người dùng!');
      return;
    }
    const userId = user._id || user.id;
    const isSelf = isUserSelf(user);
    if (isSelf) {
      toast.error('Bạn không thể xóa tài khoản Quản Trị Viên đang đăng nhập!');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa tài khoản người dùng',
      message: `Xóa vĩnh viễn tài khoản ${user.email} (${user.name || 'Người dùng'})? Toàn bộ dữ liệu của người dùng này sẽ không thể khôi phục.`,
      confirmText: 'Xác nhận xóa',
      variant: 'danger',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(userId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
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

      let statusMatch = true;
      if (statusFilter === 'active') {
        statusMatch = u.isActive !== false;
      } else if (statusFilter === 'inactive') {
        statusMatch = u.isActive === false;
      }

      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleExportCsv = () => {
    if (filteredUsers.length === 0) {
      toast.warning('Không có dữ liệu người dùng để xuất!');
      return;
    }
    exportToCsv(
      `Danh_Sach_Nguoi_Dung_${new Date().toISOString().slice(0, 10)}`,
      filteredUsers,
      [
        { key: 'name', label: 'Tên Người Dùng', formatter: (u: any) => u.name || '' },
        { key: 'email', label: 'Email', formatter: (u: any) => u.email || '' },
        { key: 'phone', label: 'Số Điện Thoại', formatter: (u: any) => u.phone || '' },
        { key: 'role', label: 'Vai Trò', formatter: (u: any) => u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng' },
        { key: 'isActive', label: 'Trạng Thái', formatter: (u: any) => u.isActive !== false ? 'Đang hoạt động' : 'Tạm khóa (Inactive)' },
        { key: 'createdAt', label: 'Ngày Tạo', formatter: (u: any) => u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '' },
      ]
    );
    toast.success(`Đã xuất ${filteredUsers.length} người dùng ra file CSV!`);
  };

  if (isLoading) {
    return <AdminTableSkeleton rows={8} cols={7} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng & Phân Quyền</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tài khoản, chỉnh sửa thông tin, khóa tài khoản và phân quyền quản trị</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="user">Khách hàng (User)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa (Inactive)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tổng số: <span className="font-bold text-slate-900">{filteredUsers.length}</span> tài khoản
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tên Người Dùng</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Số Điện Thoại</th>
                <th className="px-6 py-3.5">Vai Trò (Role)</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5">Ngày Tạo</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap min-w-[190px]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Chưa có người dùng nào phù hợp.</td>
                </tr>
              ) : (
                paginatedUsers.map((u: any) => {
                  const userId = u._id || u.id;
                  const isSelf = isUserSelf(u);
                  const isActive = u.isActive !== false;

                  return (
                    <tr key={userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-slate-900 truncate">{u.name || 'Người dùng'}</span>
                          {isSelf && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              Bạn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
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
                      <td className="px-6 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Đã khóa (Inactive)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-[11px] text-slate-400">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap min-w-[190px]">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap shrink-0">
                          {/* Edit user button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            disabled={!isAdmin}
                            className={`px-2.5 py-1.5 font-semibold rounded-md transition-colors text-xs inline-flex items-center gap-1 ${
                              !isAdmin
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                            }`}
                            title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền sửa' : 'Chỉnh sửa thông tin người dùng'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          {/* Inactive / Active Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={!isAdmin || isSelf || toggleStatusMutation.isPending}
                            className={`px-2.5 py-1.5 font-semibold rounded-md transition-colors text-xs inline-flex items-center gap-1 ${
                              !isAdmin || isSelf
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                : isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer'
                            }`}
                            title={
                              !isAdmin
                                ? 'Chỉ Quản trị viên mới có quyền thay đổi trạng thái'
                                : isSelf
                                ? 'Không thể tự khóa tài khoản của bạn'
                                : isActive
                                ? 'Khóa tài khoản (Inactive)'
                                : 'Kích hoạt lại tài khoản'
                            }
                          >
                            {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                            <span>{isActive ? 'Khóa' : 'Mở'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={!isAdmin || isSelf || deleteMutation.isPending}
                            className={`p-1.5 font-semibold rounded-md transition-colors text-xs inline-flex items-center ${
                              !isAdmin || isSelf
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer'
                            }`}
                            title={
                              !isAdmin
                                ? 'Chỉ Quản trị viên mới có quyền xóa'
                                : isSelf
                                ? 'Không thể xóa tài khoản của chính mình'
                                : 'Xóa tài khoản vĩnh viễn'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Edit User Modal */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                Chỉnh Sửa Người Dùng
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân quyền (Role)</label>
                  <select
                    value={editForm.role}
                    disabled={isUserSelf(editingUser)}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white font-medium cursor-pointer"
                  >
                    <option value="user">Khách hàng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                  {isUserSelf(editingUser) && (
                    <p className="text-[10px] text-amber-600 mt-1">Không thể đổi quyền tài khoản của chính mình</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái tài khoản</label>
                  <select
                    value={editForm.isActive ? 'true' : 'false'}
                    disabled={isUserSelf(editingUser)}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white font-medium cursor-pointer"
                  >
                    <option value="true">Đang hoạt động (Active)</option>
                    <option value="false">Tạm khóa (Inactive)</option>
                  </select>
                  {isUserSelf(editingUser) && (
                    <p className="text-[10px] text-amber-600 mt-1">Không thể khóa tài khoản của chính mình</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Xác nhận'}
        variant={confirmModal.variant || 'danger'}
        isLoading={deleteMutation.isPending || toggleStatusMutation.isPending}
      />
    </div>
  );
}
