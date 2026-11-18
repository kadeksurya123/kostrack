'use client';

import React, { useState } from 'react';
import { Room } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoomModal } from './room-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/utils/format';
import { deleteRoom } from '@/actions/rooms';
import {
  DoorClosed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoomsManagerProps {
  initialRooms: Room[];
}

export function RoomsManager({ initialRooms }: RoomsManagerProps) {
  const router = useRouter();
  const [rooms] = useState<Room[]>(initialRooms);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(search.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalKamar = rooms.length;
  const kamarTerisi = rooms.filter((r) => r.status === 'occupied').length;
  const kamarKosong = rooms.filter((r) => r.status === 'available').length;
  const kamarPerawatan = rooms.filter((r) => r.status === 'maintenance').length;

  const handleOpenAdd = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteRoom(deleteId);
    setIsDeleting(false);

    if (!res.success) {
      setDeleteError(res.error || 'Gagal menghapus kamar');
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Kamar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola ketersediaan kamar, tarif sewa, dan spesifikasi fasilitas
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kamar Baru
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kamar</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalKamar}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase">Terisi</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{kamarTerisi}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase">Kosong / Tersedia</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{kamarKosong}</span>
            <DoorClosed className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase">Perawatan</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{kamarPerawatan}</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
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
                placeholder="Cari nomor / fasilitas kamar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="available">Kosong / Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="maintenance">Perawatan</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kamar List (Grid of Cards) */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <DoorClosed className="w-10 h-10 text-slate-300" />
            <p>Tidak ada kamar yang sesuai dengan kriteria pencarian.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            return (
              <Card key={room.id} className="overflow-hidden hover:border-slate-300 transition-all">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {room.room_number}
                    </div>
                    <div>
                      <CardTitle className="text-sm">Kamar {room.room_number}</CardTitle>
                      <p className="text-[11px] font-semibold text-emerald-600">
                        {formatCurrency(room.monthly_price)} / bulan
                      </p>
                    </div>
                  </div>
                  <Badge status={room.status}>
                    {room.status === 'available'
                      ? 'Kosong'
                      : room.status === 'occupied'
                      ? 'Terisi'
                      : 'Perawatan'}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <p className="text-xs text-slate-500 min-h-[36px] line-clamp-2">
                    {room.description || 'Tidak ada catatan fasilitas.'}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleOpenEdit(room)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setDeleteId(room.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomToEdit={selectedRoom}
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
        title="Hapus Data Kamar"
        message="Apakah Anda yakin ingin menghapus kamar ini? Tindakan ini tidak dapat dibatalkan jika kamar tidak memiliki penghuni aktif."
      />
    </div>
  );
}
