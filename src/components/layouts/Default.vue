<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { default as router } from '@/routers'
  import { useSettingStore, useAlertStore } from '@/data'
  import PanelMenu from 'primevue/panelmenu';
  import Toast from 'primevue/toast'
  import { useToast } from "primevue/usetoast"
  import switchTheme from '@/components/themes/switcher.vue'
  import userTheme from '@/components/themes/userSetting.vue'
  import Button from 'primevue/button'
  import logoText from 'svgfilepath/vector.svg'

  // //--------------------------------------------------- // //
  // // VARIABLE SECTOR
  // //--------------------------------------------------- // //
  const toast = useToast()
  const storeSetting = useSettingStore()
  const storeAlert = useAlertStore()
  const items = ref([
  {
    label: "File",
    icon: "pi pi-fw pi-file",
    items: [
      {
        label: "Nuevo",
        icon: "pi pi-fw pi-plus",
        items: [
          {
            label: "Bookmark",
            icon: "pi pi-fw pi-bookmark",
            command: () => {
              storeAlert.toastAlert("Bookmark - Panel Menu", "success")
            }
          },
          {
            label: "Video",
            icon: "pi pi-fw pi-video",
            command: () => {
              storeAlert.toastAlert("No video - Panel Menu", "error")
            }
          },
        ],
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-trash",
        command: () => {
          storeAlert.toastAlert("Borrar - Panel Menu", "info")
        }
      },
      {
        label: "Export",
        icon: "pi pi-fw pi-external-link",
        command: () => {
          storeAlert.toastAlert("Exportar - Panel Menu", "warn")
        }
      },
    ],
  },
  {
    label: "Edit",
    icon: "pi pi-fw pi-pencil",
    items: [
      {
        label: "Left",
        icon: "pi pi-fw pi-align-left",
      },
      {
        label: "Right",
        icon: "pi pi-fw pi-align-right",
      },
      {
        label: "Center",
        icon: "pi pi-fw pi-align-center",
      },
      {
        label: "Justify",
        icon: "pi pi-fw pi-align-justify",
      },
    ],
  },
  {
    label: "Users",
    icon: "pi pi-fw pi-user",
    items: [
      {
        label: "New",
        icon: "pi pi-fw pi-user-plus",
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-user-minus",
      },
      {
        label: "Search",
        icon: "pi pi-fw pi-users",
        items: [
          {
            label: "Filter",
            icon: "pi pi-fw pi-filter",
            items: [
              {
                label: "Print",
                icon: "pi pi-fw pi-print",
              },
            ],
          },
          {
            icon: "pi pi-fw pi-bars",
            label: "List",
          },
        ],
      },
    ],
  },
  {
    label: "Opciones",
    icon: "pi pi-fw pi-calendar",
    items: [
      {
        label: "Editar",
        icon: "pi pi-fw pi-pencil",
        items: [
          {
            label: "Intenciones",
            icon: "pi pi-fw pi-calendar-plus",
            to: "admin/intents"
          },
          {
            label: "Delete",
            icon: "pi pi-fw pi-calendar-minus",
          },
        ],
      },
      {
        label: "Archieve",
        icon: "pi pi-fw pi-calendar-times",
        items: [
          {
            label: "Remove",
            icon: "pi pi-fw pi-calendar-minus",
          },
        ],
      },
    ],
  },
  ])
  // --------------------------------------------------- //
  // functions sectors
  // --------------------------------------------------- //
  const toggleAside = () => {
    storeSetting.showAside = !storeSetting.showAside
    //element.offsetHeight
  }

  const redirectToUrl = (url) => {
    router.push(url || '/home')
  }

  watch(
    storeAlert.alert, 
    (newAlerts, oldAlerts) => {
      for (const alert of newAlerts){
        if (!alert.read) {
          const { severity, summary, msg, id } = alert
          toast.add({ severity, summary, detail: msg, life: 3000 })
          storeAlert.markAsRead(id)
        }
      }
    },
    { deep: true }
  )

  onMounted(() => {
    if (window.innerWidth < 768) {
      storeSetting.isMobileView = true
      storeSetting.showAside = false
    }
  })

</script>
<template>
  <Toast />
  <div class="flex flex-col min-h-screen w-screen max-w-full min-w-full bg-sky-50 dark:bg-sky-950">

    <Transition name="slide-fade">
      <aside v-if="storeSetting.showAside" class="fixed h-full w-64 top-0 left-0 flex flex-col border-r border-transparent border-solid shadow-2xl shadow-blue-500/50 bg-white dark:bg-slate-700">
        <div class="flex pt-8 pb-6 justify-center items-center">
          <icon :data="logoText" class="inline" width="16rem" height="4rem" original />
        </div>
        <div class="overflow-auto flex-1 pb-8 ml-0">  
          <PanelMenu :model="items"
              :pt="{
                root: { class: 'w-full md:w-96' },
                panel: { class: 'border-none' },
                icon: { class: 'text-indigo-300' },
                headerIcon: { class: 'text-indigo-300' },
                submenuIcon: { class: 'text-indigo-300' },
              }"
            />
        </div>
      </aside>
    </Transition>

    <!-- Section WRAPPER -->
    <div class="p-2 md:p-4 z-20" :class="{ 'showSideBar': storeSetting.showAside, 'hideSideBar': !storeSetting.showAside}">
      
      <div class="pb-8 flex items-center justify-between">
        <!-- SECTION TOPBAR -->
        <div class="flex-none">
          <Button icon="pi pi-bars" @click="toggleAside" text raised size="small" />
        </div>
        <div class="ml-2 flex gap-4">
          <switchTheme />
          <userTheme />
        </div>
      </div>
      <main class="w-full flex-auto m-4 justify-center">
        <!-- Section MAIN -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

      </main>

    </div>

    <div @click="toggleAside" class="z-10 fixed top-0 left-0 block ml-64 w-screen h-full bg-black/25 md:hidden" :class="{ 'hidden': !storeSetting.showAside }"></div>
    <footer>
      <!-- Section FOOTER -->
    </footer>
  </div>
</template>

<style scoped>
  /* Fade animation */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from,.fade-leave-to {
    opacity: 0;
  }

  /*
  Slide fade enter/leave transitions for aside
  */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out 0.1s;
  }

  .slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1) 0.1s;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-100%);
    opacity: 0;
  }
</style>