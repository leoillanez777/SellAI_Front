import { Home, About } from '@/views';

const meta = { auth: true };

export default {
    path: '/',
    meta,
    component: () => import('@/components/layouts/Default.vue'),
    children: [
        { path: '', redirect: 'home' },
        { path: 'home', name: 'Home', component: Home, meta: { auth: true, chat: true} },
        { path: 'about', name: 'About', component: About, meta }
    ]
};