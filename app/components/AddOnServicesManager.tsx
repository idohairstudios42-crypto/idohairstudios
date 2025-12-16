'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddOnService {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isActive: boolean;
}

export default function AddOnServicesManager() {
    const [services, setServices] = useState<AddOnService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: 0,
        category: 'general',
        isActive: true
    });

    const [editingService, setEditingService] = useState<AddOnService | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/addon-services');
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (error) {
            setError('Failed to load add-on services');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newService.name || newService.price < 0) {
            setError('Name and valid price are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/addon-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newService),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add service');
            }

            await fetchServices();
            setSuccess('Add-on service created successfully');
            setNewService({ name: '', description: '', price: 0, category: 'general', isActive: true });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add service');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingService) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/addon-services', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingService),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update service');
            }

            await fetchServices();
            setSuccess('Add-on service updated successfully');
            setEditingService(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('Are you sure you want to delete this add-on service?')) return;

        try {
            setError(null);
            setDeletingId(id);

            await new Promise(resolve => setTimeout(resolve, 400));

            const response = await fetch(`/api/addon-services?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete service');
            }

            await fetchServices();
            setSuccess('Add-on service deleted successfully');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete service');
        } finally {
            setDeletingId(null);
        }
    };

    const formatPrice = (price: number) => {
        return `GH₵${price.toFixed(2)}`;
    };

    if (loading && services.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Messages */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Add New Service Form */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-['Noto_Serif_Display'] text-pink-300 mb-4">
                    {editingService ? 'Edit Add-On Service' : 'Add New Add-On Service'}
                </h3>

                <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Service Name</label>
                            <input
                                type="text"
                                value={editingService ? editingService.name : newService.name}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, name: e.target.value })
                                    : setNewService({ ...newService, name: e.target.value })
                                }
                                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                placeholder="e.g. Classic Wash"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Price (GH₵)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingService ? editingService.price : newService.price}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })
                                    : setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <textarea
                            value={editingService ? editingService.description : newService.description}
                            onChange={(e) => editingService
                                ? setEditingService({ ...editingService, description: e.target.value })
                                : setNewService({ ...newService, description: e.target.value })
                            }
                            className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none"
                            rows={2}
                            placeholder="Product details and what's included..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Category</label>
                            <select
                                value={editingService ? editingService.category : newService.category}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, category: e.target.value })
                                    : setNewService({ ...newService, category: e.target.value })
                                }
                                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                            >
                                <option value="general">General</option>
                                <option value="wash">Wash</option>
                                <option value="prep">Prep</option>
                                <option value="treatment">Treatment</option>
                                <option value="styling">Styling</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingService ? editingService.isActive : newService.isActive}
                                    onChange={(e) => editingService
                                        ? setEditingService({ ...editingService, isActive: e.target.checked })
                                        : setNewService({ ...newService, isActive: e.target.checked })
                                    }
                                    className="h-5 w-5 text-pink-600 bg-black/60 border-gray-700 rounded focus:ring-pink-500/30"
                                />
                                <span className="text-gray-300 text-sm">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        {editingService && (
                            <button
                                type="button"
                                onClick={() => setEditingService(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            {editingService ? <Check size={16} /> : <Plus size={16} />}
                            {editingService ? 'Update Service' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Services List */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                    <h3 className="text-sm font-['Noto_Serif_Display'] text-pink-300">
                        Add-On Services ({services.length})
                    </h3>
                </div>

                {services.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No add-on services yet. Add your first one above!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {services.map((service) => (
                            <motion.div
                                key={service._id}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: deletingId === service._id ? 0.3 : 1,
                                    x: deletingId === service._id ? 50 : 0,
                                }}
                                className="p-4 hover:bg-pink-500/5 transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white truncate">{service.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${service.isActive
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {service.description && (
                                            <p className="text-sm text-gray-400 truncate">{service.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-pink-400 font-medium">{formatPrice(service.price)}</span>
                                            <span className="text-xs text-gray-500 capitalize">{service.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEditingService(service)}
                                            className="p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-900/30 rounded transition"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service._id)}
                                            className="p-2 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
