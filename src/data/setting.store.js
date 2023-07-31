import { defineStore } from 'pinia';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    showAside: true,
    menuSetting: [
      {
        label: 'Opciones',
        icon: 'pi pi-wrench',
        items: [
          {
            label: 'Configurar',
            icon: 'pi pi-book',
            command: () => {
            }
          },
        ]
      },
      {
        label: 'Cuenta',
        icon: 'pi pi-user-edit',
        items: [
          { 
            label: 'Opciones', 
            icon: 'pi pi-fw pi-cog',
            to: '/home'
          },
          {
            separator: true
          },
          {
            label: 'Cerrar sesión', 
            icon: 'pi pi-fw pi-power-off', 
            command: () => {
              //const authStore = useAuthStore();
              //authStore.logout();
            }
          }
        ]
      }
    ],
    isMobileView: false
  })
})