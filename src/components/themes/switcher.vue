<script setup>
  import { ref, onMounted } from 'vue'
  import { usePrimeVue } from 'primevue/config'
  import Button from 'primevue/button'
  import Menu from 'primevue/menu'

  const { changeTheme } = usePrimeVue()
  const iconDefault = ref('pi pi-sun')
  const currentTheme = ref(localStorage.getItem('theme') || 'sistema')
  const menuUser = ref()
  const itemsMenuUser = ref([
    { 
      label: 'Claro', 
      icon: 'pi pi-fw pi-sun',
      command: () => {
        setTheme("light");
      }
    },
    { 
      label: 'Oscuro', 
      icon: 'pi pi-fw pi-moon',
      command: () => {
        setTheme("dark");
      }
    },
    { 
      label: 'Sistema', 
      icon: 'pi pi-fw pi-desktop',
      command: () => {
        setTheme("system");
      }
    }
  ])

  // change to dark or light mode
  const setTheme = (mode) => {
    switch (mode) {
      case "dark":
        changeTheme('viva-light', 'viva-dark', 'theme-link', () => {})
        document.documentElement.classList.add('dark')
        localStorage.theme = 'dark'
        iconDefault.value = 'pi pi-moon'
        break
      case "light":
        changeTheme('viva-dark', 'viva-light', 'theme-link', () => {})
        document.documentElement.classList.remove('dark')
        localStorage.theme = 'light'
        iconDefault.value = 'pi pi-sun'
        break
      default:
        localStorage.removeItem('theme');
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        iconDefault.value = 'pi pi-desktop'
        if (isDarkMode) {
          changeTheme('viva-light', 'viva-dark', 'theme-link', () => {})
          document.documentElement.classList.add('dark')
        }
        else {
          changeTheme('viva-dark', 'viva-light', 'theme-link', () => {})
          document.documentElement.classList.remove('dark')
        }
        break
    }
  }

  const toggleMenuUser = (event) => {
    menuUser.value.toggle(event)
  };

  onMounted(() => {
    setTheme(currentTheme.value)
  })
</script>
<template>
  <Button :icon="iconDefault" @click="toggleMenuUser" size="small" text raised rounded  aria-label="Modo" aria-haspopup="true" aria-controls="overlay_menuUserTheme" />
  <Menu ref="menuUser" id="overlay_menuUserTheme" :model="itemsMenuUser" :popup="true"  />
</template>