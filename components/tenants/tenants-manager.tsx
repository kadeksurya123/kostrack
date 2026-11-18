'use client';

import React, { useState } from 'react';
import { Room, Tenant } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TenantModal } from './tenant-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate } from '@/lib/utils/format';
import { deleteTenant } from '@/actions/tenants';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TenantsManagerProps {
  initialTenants: Tenant[];
  rooms: Room[];
}

export function TenantsManager({ initialTenants, rooms }: TenantsManagerProps) {
  const router = useRouter();
  const [tenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredTenants = tenants.filter((tenant) => {
    const q = search.toLowerCase();
    const matchesSearch =
      tenant.full_name.toLowerCase().includes(q) ||
      tenant.public_name.toLowerCase().includes(q) ||
      (tenant.phone && tenant.phone.includes(q)) ||
      (tenant.rooms?.room_number && tenant.rooms.room_number.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAktif = tenants.filter((t) => t.status === 'active').length;
  const totalKeluar = tenants.filter((t) => t.status === 'inactive').length;

  const handleOpenAdd = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteTenant(deleteId);
    setIsDeleting(false);

    if (!res.success) {
      setDeleteError(res.error || 'Gagal menghapus penghuni');
    } else {
      setDeleteId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Penghuni</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar penyewa aktif dan histori penghuni kos
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Penghuni Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Terdaftar</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{tenants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase">Penghuni Aktif</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalAktif}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Nonaktif / Keluar</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalKeluar}</p>
        </div>
      </div>

      {deleteError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {deleteError}
        </div>
      )}

      {/* Controls / Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, kamar, atau telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="active">Penghuni Aktif Saja</option>
                <option value="inactive">Nonaktif / Keluar</option>
                <option value="ALL">Semua Penghuni</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTenants.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Users className="w-10 h-10 text-slate-300" />
              <p>Tidak ada data penghuni yang sesuai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Nama Penghuni</th>
                    <th className="px-4 py-3.5">Kamar</th>
                    <th className="px-4 py-3.5">Kontak (Admin)</th>
                    <th className="px-4 py-3.5">Mulai Menempati</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((t) => {
                    const cleanPhone = t.phone?.replace(/[^0-9]/g, '');
                    const waNumber = cleanPhone?.startsWith('0')
                      ? '62' + cleanPhone.substring(1)
                      : cleanPhone;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{t.full_name}</div>
                          <div className="text-[11px] text-emerald-600 font-medium">
                            Publik: {t.public_name}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-700">
                            Kamar {t.rooms?.room_number || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {t.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-mono">{t.phone}</span>
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Kirim Pesan WhatsApp"
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(t.move_in_date)}</span>
                          </div>
                          {t.move_out_date && (
                            <div className="text-[10px] text-slate-400">
                              Keluar: {formatDate(t.move_out_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge status={t.status}>
                            {t.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEdit(t)}
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setDeleteId(t.id)}
                              title="Hapus Penghuni"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantToEdit={selectedTenant}
        rooms={rooms}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Data Penghuni"
        message="Apakah Anda yakin ingin menghapus penghuni ini? Riwayat pembayaran yang berkaitan juga akan terhapus."
      />
    </div>
  );
}
