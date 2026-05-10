"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Pencil, Trash2, Search, X, Loader2,
  Check, Package, ToggleLeft, ToggleRight, Star, StarOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Product, Category } from "@/types"

type ProductWithCategory = Product & { categories?: Category | null }

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  is_available: true,
  is_popular: false,
  calories: "",
  allergens: "",
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products")
      const { products: data } = await res.json()
      setProducts(data || [])

      // Extract unique categories
      const catMap = new Map<string, Category>()
      data?.forEach((p: ProductWithCategory) => {
        if (p.categories) catMap.set(p.categories.id, p.categories)
      })
      setCategories(Array.from(catMap.values()).sort((a, b) => a.display_order - b.display_order))
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (product: ProductWithCategory) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      is_available: product.is_available,
      is_popular: product.is_popular,
      calories: product.calories?.toString() || "",
      allergens: product.allergens?.join(", ") || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      toast.error("Name, price, and category are required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        category_id: form.category_id,
        is_available: form.is_available,
        is_popular: form.is_popular,
        calories: form.calories ? parseInt(form.calories) : null,
        allergens: form.allergens
          ? form.allergens.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }

      let res
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error("Failed to save")

      toast.success(editingProduct ? "Product updated" : "Product created")
      setDialogOpen(false)
      fetchProducts()
    } catch {
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Product deleted")
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleAvailability = async (product: ProductWithCategory) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !product.is_available }),
      })
      if (!res.ok) throw new Error()
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
      )
      toast.success(`${product.name} ${!product.is_available ? "enabled" : "disabled"}`)
    } catch {
      toast.error("Failed to update availability")
    }
  }

  const togglePopular = async (product: ProductWithCategory) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_popular: !product.is_popular }),
      })
      if (!res.ok) throw new Error()
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_popular: !p.is_popular } : p)
      )
    } catch {
      toast.error("Failed to update popular status")
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === "all" || p.category_id === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} total items</p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCat("all")}
            className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0", filterCat === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={cn("flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0", filterCat === cat.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground")}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-muted-foreground text-sm">Try a different search or add your first product.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <AnimatePresence>
                  {filtered.map((product) => (
                    <motion.tr
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn("hover:bg-secondary/20 transition-colors", !product.is_available && "opacity-60")}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{product.name}</span>
                            {product.is_popular && (
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {product.categories?.icon} {product.categories?.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAvailability(product)}
                            title={product.is_available ? "Disable item" : "Enable item"}
                            className={cn("transition-colors", product.is_available ? "text-green-600" : "text-muted-foreground")}
                          >
                            {product.is_available
                              ? <ToggleRight className="h-5 w-5" />
                              : <ToggleLeft className="h-5 w-5" />
                            }
                          </button>
                          <span className={cn("text-xs", product.is_available ? "text-green-600" : "text-muted-foreground")}>
                            {product.is_available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => togglePopular(product)}
                            title={product.is_popular ? "Remove from popular" : "Mark as popular"}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition-all"
                          >
                            {product.is_popular
                              ? <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                              : <StarOff className="h-4 w-4" />
                            }
                          </button>
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            {deletingId === product.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Classic Eggs & Bacon"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the dish..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price * ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Calories (optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 450"
                  value={form.calories}
                  onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Allergens (comma-separated)</Label>
              <Input
                placeholder="e.g. gluten, dairy, eggs"
                value={form.allergens}
                onChange={(e) => setForm((f) => ({ ...f, allergens: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, is_available: !f.is_available }))}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    form.is_available ? "bg-primary" : "bg-border"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    form.is_available ? "translate-x-5" : "translate-x-1"
                  )} />
                </div>
                <span className="text-sm font-medium">Available</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, is_popular: !f.is_popular }))}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    form.is_popular ? "bg-amber-500" : "bg-border"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    form.is_popular ? "translate-x-5" : "translate-x-1"
                  )} />
                </div>
                <span className="text-sm font-medium">Popular</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                : <><Check className="h-4 w-4" />{editingProduct ? "Save Changes" : "Create Product"}</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
