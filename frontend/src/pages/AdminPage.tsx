import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Mail,
  ShoppingBag,
  Image as ImageIcon,
  LayoutDashboard,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { AdminUser } from '../types';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Badge } from '../components/common/CommonUi';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  // Editing user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: '' });

  // Add product state
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '' });

  // Upload gallery state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const hash = location.hash.replace('#', '') || 'dashboard';
    setActiveTab(hash);

    const fetchData = async () => {
      try {
        if (hash === 'users') {
          setUsers(await api.getAdminUsers());
        } else if (hash === 'contact') {
          setContacts(await api.getContacts());
        } else if (hash === 'shop') {
          setProducts(await api.getProducts());
        } else if (hash === 'gallery') {
          setGallery(await api.getGallery());
        }
      } catch (err: any) {
        error(err.message || `Failed to load ${hash} data.`);
      }
    };

    fetchData();
  }, [isAdmin, location.hash]);

  // User Handlers
  const handleToggleUser = async (userId: string) => {
    try {
      await api.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      success('User status updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update user.');
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUserId(u.id);
    setEditUserForm({ name: u.name, email: u.email, role: u.role === 2 || u.role === 'Admin' ? 'Admin' : 'User' });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      await api.updateUser(userId, editUserForm);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editUserForm } : u));
      setEditingUserId(null);
      success('User updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update user.');
    }
  };

  // Product Handlers
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await api.addProduct(newProduct);
      setProducts([p, ...products]);
      setNewProduct({ name: '', price: 0, description: '' });
      success('Product added.');
    } catch (err: any) {
      error(err.message || 'Failed to add product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      success('Product deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    }
  };

  // Gallery Handlers
  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const g = await api.uploadGalleryImage(uploadFile, uploadTitle);
      setGallery([g, ...gallery]);
      setUploadFile(null);
      setUploadTitle('');
      success('Image uploaded to Cloudinary.');
    } catch (err: any) {
      error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await api.deleteGalleryImage(id);
      setGallery(gallery.filter(g => g._id !== id));
      success('Image deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete image.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
              </div>
              <div className="p-8 rounded-xl border border-[#202938] bg-[#101620] text-center">
                <p className="text-slate-400 font-mono">Welcome to the Admin Panel. Use the sidebar to navigate sections.</p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-extrabold text-white">Platform Accounts</h1>
                <Badge variant="red" size="sm">Root Authorization</Badge>
              </div>

              <div className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0A0F1A] border-b border-[#202938] text-slate-400">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202938]/60 text-slate-300">
                      {users.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic">No users found.</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="hover:bg-[#131A26]">
                          {editingUserId === u.id ? (
                            <>
                              <td className="py-2 px-4"><input className="bg-[#0A0F1A] border border-[#202938] px-2 py-1 rounded text-white w-full" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} /></td>
                              <td className="py-2 px-4"><input className="bg-[#0A0F1A] border border-[#202938] px-2 py-1 rounded text-white w-full" value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} /></td>
                              <td className="py-2 px-4">
                                <select className="bg-[#0A0F1A] border border-[#202938] px-2 py-1 rounded text-white w-full" value={editUserForm.role} onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}>
                                  <option value="User">User</option>
                                  <option value="Admin">Admin</option>
                                </select>
                              </td>
                              <td className="py-2 px-4">-</td>
                              <td className="py-2 px-4 text-right flex justify-end gap-2">
                                <button onClick={() => handleSaveUser(u.id)} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><Check className="w-4 h-4"/></button>
                                <button onClick={() => setEditingUserId(null)} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"><X className="w-4 h-4"/></button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 font-semibold text-slate-100">{u.name}</td>
                              <td className="py-3 px-4 text-slate-400">{u.email}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 2 || u.role === 'Admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                                  {u.role === 2 || u.role === 'Admin' ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${u.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {u.isActive ? 'Active' : 'Disabled'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right flex justify-end gap-2">
                                <button onClick={() => handleEditUser(u)} className="p-1.5 rounded bg-[#161F2E] hover:bg-[#1E293B] text-slate-300" title="Edit User"><Edit2 className="w-3.5 h-3.5"/></button>
                                <button onClick={() => handleToggleUser(u.id)} className="px-2.5 py-1.5 rounded bg-[#161F2E] hover:bg-[#1E293B] text-[11px] text-slate-300">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-extrabold text-white">Contact Messages</h1>
              </div>
              <div className="grid gap-4">
                {contacts.length === 0 ? <p className="text-slate-400 font-mono text-sm">No messages found.</p> : contacts.map(c => (
                  <div key={c._id} className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white">{c.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-extrabold text-white">Shop Manager</h1>
              </div>
              
              <div className="mb-8 p-4 rounded-xl border border-[#202938] bg-[#101620]">
                <h3 className="text-sm font-bold text-white mb-4">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 rounded bg-[#0A0F1A] border border-[#202938] text-white text-sm" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                    <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded bg-[#0A0F1A] border border-[#202938] text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                    <input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 rounded bg-[#0A0F1A] border border-[#202938] text-white text-sm" />
                  </div>
                  <button type="submit" className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-bold text-sm">Add</button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p._id} className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white">{p.name}</h3>
                      <span className="text-emerald-400 font-mono font-bold">${p.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{p.description}</p>
                    <button onClick={() => handleDeleteProduct(p._id)} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5"/> Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-extrabold text-white">Gallery (Cloudinary)</h1>
              </div>

              <div className="mb-8 p-4 rounded-xl border border-[#202938] bg-[#101620]">
                <h3 className="text-sm font-bold text-white mb-4">Upload New Image</h3>
                <form onSubmit={handleUploadGallery} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Image Title</label>
                    <input required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-[#0A0F1A] border border-[#202938] text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">File</label>
                    <input type="file" accept="image/*" required onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900" />
                  </div>
                  <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-bold text-sm disabled:opacity-50">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map(g => (
                  <div key={g._id} className="relative group rounded-xl border border-[#202938] overflow-hidden bg-[#101620]">
                    <img src={g.url} alt={g.title} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <p className="text-xs font-bold text-white truncate">{g.title}</p>
                      <button onClick={() => handleDeleteGallery(g._id)} className="self-end p-1.5 rounded bg-rose-500/80 hover:bg-rose-500 text-white"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
