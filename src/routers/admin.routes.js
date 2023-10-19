import { Menu } from '@/views/admin';

const meta = { auth: true };

export default {
    path: '/admin',
    component: () => import('@/components/layouts/Default.vue'),
    children: [
        { path: '', redirect: 'intents' },
        { path: 'intents', name: 'Intenciones', component: Menu, meta },
    ]
};