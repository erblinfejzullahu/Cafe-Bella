"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Plus, Pencil, Trash2, Star, Eye, EyeOff,
  Search, X, Loader2, Upload, Link as LinkIcon, ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Category = { id: string; name: string; slug: string; icon: string | null }
type Product  = {
  id: string; name: string; description: string | null; price: number
  image_url: string | null; is_available: boolean; is_popular: boolean
  category_id: string | null; display_order: number
  categories?: { id: string; name: string; slug: string; icon: string | null } | null
}

const EMPTY: Omit<Product, 'id' | 'display_order'> = {
  name: '', description: '', price: 0, image_url: null,
  is_available: true, is_popular: false, category_id: null, categories: null,
}

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [catFilter,  setCatFilter]  = useState("all")
  const [dialog,     setDialog]     = useState<'add' | 'edit' | null>(null)
  const [editing,    setEditing]    = useState<Product | null>(null)
  const [form,       setForm]       = useState<Omit<Product,'id'|'display_order'>>(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [imageMode,  setImageMode]  = useState<'upload' | 'url'>('upload')
  const [preview,    setPreview]    = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])
      const { products: prods } = await pRes.json()
      const { categories: cats } = await cRes.json()
      setProducts(prods ?? [])
      setCategories(cats ?? [])
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(EMPTY); setEditing(null); setPreview(null)
    setImageMode('upload'); setDialog('add')
  }

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description ?? '',
      price: p.price, image_url: p.image_url,
      is_available: p.is_available, is_popular: p.is_popular,
      category_id: p.category_id, categories: p.categories ?? null,
    })
    setEditing(p)
    setPreview(p.image_url)
    setImageMode(p.image_url ? 'url' : 'upload')
    setDialog('edit')
  }

  const close = () => { setDialog(null); setEditing(null); setPreview(null) }

  // Upload image file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url, error } = await res.json()
      if (!res.ok || error) throw new Error(error ?? 'Upload failed')
      setForm(f => ({ ...f, image_url: url }))
      setPreview(url)
      toast.success('Image uploaded')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Product name is required')
    if (!form.price || form.price <= 0) return toast.error('Please enter a valid price')

    setSaving(true)
    try {
      const body = {
        name:         form.name.trim(),
        description:  form.description || null,
        price:        parseFloat(String(form.price)),
        image_url:    form.image_url || null,
        is_available: form.is_available,
        is_popular:   form.is_popular,
        category_id:  form.category_id || null,
      }

      const res = dialog === 'add'
        ? await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch(`/api/products/${editing!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed') }

      toast.success(dialog === 'add' ? 'Product created' : 'Product updated')
      close(); load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  // Delete
  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete product') }
    finally { setDeleting(null) }
  }

  // Toggle is_popular or is_available inline
  const handleToggle = async (product: Product, field: 'is_popular' | 'is_available') => {
    const updated = { ...product, [field]: !product[field] }
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p))
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !product[field] }),
      })
      if (!res.ok) throw new Error()
      toast.success(field === 'is_popular'
        ? (!product.is_popular ? 'Marked as popular' : 'Removed from popular')
        : (!product.is_available ? 'Product enabled' : 'Product hidden'))
    } catch {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p))
      toast.error('Failed to update')
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.category_id === catFilter ||
      (p.categories && p.categories.id === catFilter)
    return matchSearch && matchCat
  })

  const getCatName = (p: Product) =>
    p.categories?.name ?? categories.find(c => c.id === p.category_id)?.name ?? '—'

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} total items</p>
        </div>
        <Button onClick={openAdd} className="gap-2 self-start">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground min-w-[160px]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="text-lg font-medium text-foreground mb-2">No products found</p>
          <Button variant="outline" onClick={() => { setSearch(''); setCatFilter('all') }}>Clear filters</Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  {["Product", "Category", "Price", "Popular", "Available", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{product.description ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{getCatName(product)}</td>
                    {/* Price */}
                    <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">${product.price.toFixed(2)}</td>
                    {/* Popular toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(product, 'is_popular')}
                        className={cn("p-1.5 rounded-lg transition-colors", product.is_popular ? "text-amber-500 bg-amber-50" : "text-muted-foreground hover:text-amber-500")}
                        title={product.is_popular ? 'Remove from popular' : 'Mark as popular'}
                      >
                        <Star className={cn("h-4 w-4", product.is_popular ? "fill-current" : "")} />
                      </button>
                    </td>
                    {/* Available toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(product, 'is_available')}
                        className={cn("p-1.5 rounded-lg transition-colors", product.is_available ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-green-600")}
                        title={product.is_available ? 'Hide product' : 'Show product'}
                      >
                        {product.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === product.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 sticky top-0 bg-card z-10">
              <h2 className="text-lg font-serif font-bold text-foreground">
                {dialog === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={close} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Combo Skillet" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the dish..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Price *</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.price || ''}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="9.99"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={form.category_id ?? ''}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value || null }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-10"
                  >
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label>Product Image</Label>

                {/* Toggle upload vs URL */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors",
                      imageMode === 'upload' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload file
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors",
                      imageMode === 'url' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> Image URL
                  </button>
                </div>

                {imageMode === 'upload' ? (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                      <span className="text-sm">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                      <span className="text-xs opacity-60">JPG, PNG, WEBP, GIF</span>
                    </button>
                  </div>
                ) : (
                  <Input
                    value={form.image_url ?? ''}
                    onChange={e => { setForm(f => ({ ...f, image_url: e.target.value || null })); setPreview(e.target.value || null) }}
                    placeholder="https://images.unsplash.com/..."
                  />
                )}

                {/* Preview */}
                {(preview || form.image_url) && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-border">
                    <Image src={preview ?? form.image_url!} alt="Preview" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, image_url: null })); setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: 'is_available' as const, label: 'Available',   desc: 'Show on menu',       icon: Eye  },
                  { field: 'is_popular'  as const, label: 'Popular',      desc: 'Show in featured',   icon: Star },
                ].map(({ field, label, desc, icon: Icon }) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      form[field] ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0", form[field] ? "text-primary" : "text-muted-foreground", field === 'is_popular' && form[field] ? "fill-current" : "")} />
                    <div>
                      <p className={cn("text-sm font-medium", form[field] ? "text-primary" : "text-foreground")}>{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <Button variant="outline" onClick={close} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : (dialog === 'add' ? 'Add Product' : 'Save Changes')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
