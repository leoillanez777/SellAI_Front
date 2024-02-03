import { Brands, Categories } from '@/views/articles';

const meta = { auth: true };

export default {
    path: '/articles',
    component: () => import('@/components/layouts/Default.vue'),
    children: [
        { path: '', redirect: 'category' },
        { path: 'category', name: 'Category', component: Categories, meta },
        { path: 'brand', name: 'Brand', component: Brands, meta },
    ]
};