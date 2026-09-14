import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '../components/layout/Header';
import { getCategories } from '../api/catalog.api';
import { getMyBusinesses, type OwnedBusiness } from '../api/business.api';
import { createProduct, getMyProducts, updateInventory, updateProductStatus } from '../api/management.api';
import type { Category, ProductSummary } from '../types/catalog';

const productSchema = z.object({
  businessLocationId: z.string().uuid('Choose a location.'),
  categoryId: z.string().optional(),
  name: z.string().min(1, 'Enter a product name.'),
  description: z.string().optional(),
  sku: z.string().optional(),
  currencyCode: z.string().length(3, 'Use a 3-letter currency code.'),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductForm = z.output<typeof productSchema>;

export default function BusinessProducts() {
  const [businesses, setBusinesses] = useState<OwnedBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormInput, undefined, ProductForm>({ resolver: zodResolver(productSchema), defaultValues: { currencyCode: 'INR', quantity: 0, price: 0 } });

  const refresh = async () => {
    const [ownedBusinesses, activeCategories, ownedProducts] = await Promise.all([getMyBusinesses(), getCategories(), getMyProducts()]);
    setBusinesses(ownedBusinesses); setCategories(activeCategories); setProducts(ownedProducts);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh().catch(() => setError('Unable to load product management data.'));
  }, []);

  const onSubmit = async (values: ProductForm) => {
    setError(''); setMessage('');
    try { await createProduct({ ...values, currencyCode: values.currencyCode.toUpperCase() }); reset({ currencyCode: 'INR', quantity: 0, price: 0 }); await refresh(); setMessage('Product created as a draft.'); } catch { setError('Unable to create product. Check the selected business location and fields.'); }
  };

  const changeInventory = async (product: ProductSummary) => {
    const value = window.prompt(`Quantity for ${product.name}`, String(product.inventory.quantity));
    if (value === null) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) { setError('Quantity must be a non-negative whole number.'); return; }
    try { await updateInventory(product.id, quantity); await refresh(); } catch { setError('Unable to update inventory.'); }
  };

  const toggleStatus = async (product: ProductSummary) => {
    try { await updateProductStatus(product.id, product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'); await refresh(); } catch { setError('Unable to change product status. The business may need admin approval.'); }
  };

  const locations = businesses.flatMap((business) => business.locations.map((location) => ({ ...location, businessName: business.name })));

  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">BUSINESS OWNER</div><h1>Products</h1><p className="dashboard-intro">Create and manage products using your owned business locations.</p>{error && <div className="error-message" role="alert">{error}</div>}{message && <div className="success-message" role="status">{message}</div>}<section className="dashboard-panel"><h2>Add product</h2><form className="management-form" onSubmit={handleSubmit(onSubmit)}><label>Business location<select {...register('businessLocationId')}><option value="">Choose a location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.businessName} · {location.name ?? location.city}</option>)}</select>{errors.businessLocationId && <span className="field-error">{errors.businessLocationId.message}</span>}</label><label>Category<select {...register('categoryId')}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Name<input {...register('name')} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label><label>Description<textarea {...register('description')} /></label><label>SKU<input {...register('sku')} /></label><div className="management-form-grid"><label>Currency<input maxLength={3} {...register('currencyCode')} />{errors.currencyCode && <span className="field-error">{errors.currencyCode.message}</span>}</label><label>Price<input type="number" min="0" step="0.01" {...register('price')} /></label><label>Quantity<input type="number" min="0" step="1" {...register('quantity')} /></label></div><button className="search-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create draft product'}</button></form></section><section className="dashboard-panel"><h2>Your products</h2>{products.length ? products.map((product) => <div className="dashboard-list-item" key={product.id}><div><strong>{product.name}</strong><span>{product.currencyCode} {product.price} · {product.inventory.quantity} in stock · {product.status}</span></div><div className="cart-item-actions"><button type="button" onClick={() => void changeInventory(product)}>Inventory</button><button type="button" onClick={() => void toggleStatus(product)}>{product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div></div>) : <p>No products listed yet.</p>}</section><section className="dashboard-panel muted-panel"><h2>Images, orders, analytics, and subscriptions</h2><p>These tools require backend storage or business workflow APIs and are not simulated here.</p></section></main></div>;
}
