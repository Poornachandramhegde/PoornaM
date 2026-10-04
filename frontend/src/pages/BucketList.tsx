import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { bucketApi } from '../services/api.js';
import type { BucketItem, BucketStatus } from '../types/index.js';
import { BucketCard } from '../components/bucket/BucketCard.js';
import { BucketModal } from '../components/bucket/BucketModal.js';

export const BucketList: React.FC = () => {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | BucketStatus>('ALL');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);

  const loadBucketItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bucketApi.getItems();
      setItems(data);
    } catch (err) {
      console.error('[BucketList] Error loading bucket items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBucketItems();

    const handleRefresh = () => loadBucketItems();
    window.addEventListener('poornam:refresh', handleRefresh);
    return () => window.removeEventListener('poornam:refresh', handleRefresh);
  }, [loadBucketItems]);

  const handleStatusChange = async (itemId: string, status: BucketStatus) => {
    try {
      await bucketApi.updateStatus(itemId, status);
      loadBucketItems();
    } catch (err) {
      console.error('Failed to update bucket item status:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Delete this bucket list item?')) {
      try {
        await bucketApi.deleteItem(itemId);
        loadBucketItems();
      } catch (err) {
        console.error('Failed to delete bucket item:', err);
      }
    }
  };

  const handleEditItem = (item: BucketItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems =
    statusFilter === 'ALL'
      ? items
      : items.filter((item) => item.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Bucket List</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Long-term goals, creative explorations, and milestones to accomplish
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('PLANNED')}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === 'PLANNED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Planned ({items.filter((i) => i.status === 'PLANNED').length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({items.filter((i) => i.status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({items.filter((i) => i.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading goals...</div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <Sparkles className="h-8 w-8 text-amber-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No bucket goals found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Dream big. Add skills you want to acquire, places to see, or projects to complete.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <BucketCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <BucketModal
          isOpen={isModalOpen}
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            loadBucketItems();
          }}
        />
      )}
    </div>
  );
};
