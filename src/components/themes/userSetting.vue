<script setup>
  import { ref } from 'vue'
  import Avatar from 'primevue/avatar'
  import Menu from 'primevue/menu'
  import logoUser from '@/assets/image/user.svg'

  const menuUser = ref()

  const toggleMenuUser = (event) => {
    menuUser.value.toggle(event);
  }

  const items = ref([
  { separator: true },
  {
    label: 'Opciones',
    items: [
      {
        label: 'Perfil',
        icon: 'pi pi-fw pi-user',
        command: () => {
        }
      },
      {
        label: 'Sistema',
        icon: 'pi pi-fw pi-cog',
        command: () => {
        }
      }
    ]
  },
  { separator: true },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out'
  }
  ])

</script>
<template>
  <Avatar @click="toggleMenuUser" :image="logoUser" class="mr-2 hover:cursor-pointer" size="large" shape="circle" aria-haspopup="true" aria-controls="overlay_menuUser" />  
  <Menu ref="menuUser" id="overlay_menuUser" :model="items" :popup="true">
    <template #start>
      <button class="w-full text-left flex align-items-center p-2 pl-3 text-color hover:surface-200 border-noround">
        <Avatar @click="toggleMenuUser" :image="logoUser" class="mr-2" size="xlarge" shape="circle" aria-haspopup="true" aria-controls="overlay_menuUser" />
        <div class="flex flex-col text-ms">
          <span class="font-bold">Leonardo Illanez</span>
          <span class="text-xs">admin</span>
        </div>
      </button>
    </template>
  </Menu>
</template>