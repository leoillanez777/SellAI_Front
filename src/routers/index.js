import { createRouter, createWebHistory } from 'vue-router';
//import { useAuthStore, useSettingStore } from '@/store';

//Call routes
import dashboardRoutes  from './dashboard.routes';
//import articlesRoutes   from './articles.routes';
import adminRoutes      from './admin.routes';
//import usersRoutes      from './users.routes';
//End call routes

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { ...dashboardRoutes },
  //  { ...articlesRoutes },
    { ...adminRoutes },
  //  { ...usersRoutes },
    // catch all redirect to home page
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
});

router.beforeEach(async (to) => {
    //document.title = `${ process.env.VUE_APP_TITLE } - ${ to.name }`;
})

export default router;
