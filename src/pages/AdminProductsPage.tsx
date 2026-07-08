import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Plus, Save, Search, Trash2, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useProductAdminMutations, useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';

type ProductCategory = Product['category'];

type ProductFormState = {
  name: string;
  description: string;
  longDescription: string;
  price: string;
  category: ProductCategory;
  sizes: string;
  colors: string;
  images: string;
  tags: string;
  collection: string;
  materials: string;
  care: string;
  isLimited: boolean;
};

const categories: ProductCategory[] = ['outerwear', 'knitwear', 'footwear', 'accessories', 'trousers'];

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  longDescription: '',
  price: '',
  category: 'outerwear',
  sizes: 'S, M, L',
  colors: 'Void Black:#000000',
  images: '',
  tags: '',
  collection: 'Permanent Collection',
  materials: '',
  care: '',
  isLimited: false,
};

function listToText(items: string[]) {
  return items.join(', ');
}

function colorsToText(colors: Product['colors']) {
  return colors.map(color => `${color.name}:${color.hex}`).join('\n');
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    longDescription: product.longDescription,
    price: String(product.price),
    category: product.category,
    sizes: listToText(product.sizes),
    colors: colorsToText(product.colors),
    images: product.images.join('\n'),
    tags: listToText(product.tags),
    collection: product.collection,
    materials: product.materials,
    care: product.care,
    isLimited: product.isLimited,
  };
}

function parseList(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function parseLines(value: string) {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function parseColors(value: string): Product['colors'] {
  const colors = parseLines(value).map(item => {
    const [name, hex] = item.split(':').map(part => part.trim());
    return {
      name: name || 'Default',
      hex: hex || '#111111',
    };
  });

  return colors.length > 0 ? colors : [{ name: 'Default', hex: '#111111' }];
}

function formToProduct(form: ProductFormState, id?: string): Product | Omit<Product, 'id'> {
  const product = {
    name: form.name.trim(),
    description: form.description.trim(),
    longDescription: form.longDescription.trim(),
    price: Number(form.price),
    category: form.category,
    sizes: parseList(form.sizes),
    colors: parseColors(form.colors),
    images: parseLines(form.images),
    tags: parseList(form.tags),
    collection: form.collection.trim(),
    materials: form.materials.trim(),
    care: form.care.trim(),
    isLimited: form.isLimited,
  };

  return id ? { id, ...product } : product;
}

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { createProduct, updateProduct, deleteProduct } = useProductAdminMutations();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return products;
    }

    return products.filter(product =>
      [product.name, product.description, product.category, product.collection]
        .some(value => value.toLowerCase().includes(normalizedSearch))
    );
  }, [products, search]);

  const isSaving = createProduct.isPending || updateProduct.isPending;

  const updateForm = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm(currentForm => ({ ...currentForm, [key]: value }));
  };

  const startCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError('');
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.description.trim()) return 'Short description is required.';
    if (!form.longDescription.trim()) return 'Long description is required.';
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) return 'Price must be greater than zero.';
    if (parseList(form.sizes).length === 0) return 'Add at least one size.';
    if (parseLines(form.images).length === 0) return 'Add at least one image URL.';
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    if (editingProduct) {
      await updateProduct.mutateAsync(formToProduct(form, editingProduct.id) as Product);
    } else {
      await createProduct.mutateAsync(formToProduct(form) as Omit<Product, 'id'>);
    }

    startCreate();
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) {
      return;
    }

    await deleteProduct.mutateAsync(product.id);

    if (editingProduct?.id === product.id) {
      startCreate();
    }
  };

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-28 px-6 md:px-12 pb-20 max-w-[1920px] mx-auto">
        <header className="flex flex-col gap-6 border-b border-neutral-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Back office</p>
            <h1 className="mt-2 font-headline text-4xl uppercase tracking-tight text-white md:text-5xl">
              Products
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/orders"
              className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white hover:text-white"
            >
              Orders
            </Link>
            <Link
              to="/products"
              className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white hover:text-white"
            >
              View Store
            </Link>
          </div>
        </header>

        <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(320px,460px)_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={startCreate}
                  className="flex h-9 w-9 items-center justify-center border border-neutral-700 text-neutral-400 transition-colors hover:border-white hover:text-white"
                  title="Cancel edit"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {error && (
              <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Name</span>
                <input
                  value={form.name}
                  onChange={event => updateForm('name', event.target.value)}
                  className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Price</span>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={event => updateForm('price', event.target.value)}
                    className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Category</span>
                  <select
                    value={form.category}
                    onChange={event => updateForm('category', event.target.value as ProductCategory)}
                    className="h-11 w-full border border-neutral-800 bg-[#131313] px-3 text-sm text-white outline-none transition-colors focus:border-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Short Description</span>
                <input
                  value={form.description}
                  onChange={event => updateForm('description', event.target.value)}
                  className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Long Description</span>
                <textarea
                  value={form.longDescription}
                  onChange={event => updateForm('longDescription', event.target.value)}
                  rows={4}
                  className="w-full resize-none border border-neutral-800 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Sizes</span>
                  <input
                    value={form.sizes}
                    onChange={event => updateForm('sizes', event.target.value)}
                    className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Tags</span>
                  <input
                    value={form.tags}
                    onChange={event => updateForm('tags', event.target.value)}
                    className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Colors</span>
                <textarea
                  value={form.colors}
                  onChange={event => updateForm('colors', event.target.value)}
                  rows={3}
                  className="w-full resize-none border border-neutral-800 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Image URLs</span>
                <textarea
                  value={form.images}
                  onChange={event => updateForm('images', event.target.value)}
                  rows={4}
                  className="w-full resize-none border border-neutral-800 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Collection</span>
                  <input
                    value={form.collection}
                    onChange={event => updateForm('collection', event.target.value)}
                    className="h-11 w-full border border-neutral-800 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                  />
                </label>

                <label className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    checked={form.isLimited}
                    onChange={event => updateForm('isLimited', event.target.checked)}
                    className="h-4 w-4 accent-white"
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Limited</span>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Materials</span>
                <textarea
                  value={form.materials}
                  onChange={event => updateForm('materials', event.target.value)}
                  rows={2}
                  className="w-full resize-none border border-neutral-800 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Care</span>
                <textarea
                  value={form.care}
                  onChange={event => updateForm('care', event.target.value)}
                  rows={2}
                  className="w-full resize-none border border-neutral-800 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-3 bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingProduct ? <Save size={16} /> : <Plus size={16} />}
              {editingProduct ? 'Save Product' : 'Create Product'}
            </button>
          </form>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-neutral-800 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Inventory</h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {filteredProducts.length} of {products.length}
                </p>
              </div>
              <div className="flex h-11 items-center border border-neutral-800 px-3 md:w-80">
                <Search size={15} className="text-neutral-500" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="SEARCH"
                  className="h-full w-full bg-transparent pl-3 text-xs uppercase tracking-[0.2em] text-white outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-24 animate-pulse bg-neutral-900" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                {filteredProducts.map(product => (
                  <article
                    key={product.id}
                    className="grid gap-4 py-4 md:grid-cols-[88px_1fr_auto] md:items-center"
                  >
                    <Link to={`/products/${product.id}`} className="block h-24 w-24 overflow-hidden bg-neutral-900 md:h-20 md:w-20">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-sm font-bold uppercase tracking-[0.15em] text-white">
                          {product.name}
                        </h3>
                        {product.isLimited && (
                          <span className="border border-neutral-700 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                            Limited
                          </span>
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                        {product.category} / ${product.price.toLocaleString()}
                      </p>
                      <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-neutral-400">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 transition-colors hover:border-white hover:text-white"
                        title="Edit product"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deleteProduct.isPending}
                        className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 transition-colors hover:border-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="py-16 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
