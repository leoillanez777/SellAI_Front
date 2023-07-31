<script setup>
  import { ref, onMounted } from 'vue'
  import { default as router } from '@/routers'
  import { useSettingStore } from '@/data'
  import switchTheme from '@/components/themes/switcher.vue'
  import Button from 'primevue/button'
  import logoText from '@/assets/vector.svg'

  // //--------------------------------------------------- // //
  // // VARIABLE SECTOR
  // //--------------------------------------------------- // //
  const storeSetting = useSettingStore();
  // --------------------------------------------------- //
  // functions sectors
  // --------------------------------------------------- //
  const toggleAside = () => {
    storeSetting.showAside = !storeSetting.showAside
  }

  const redirectToUrl = (url) => {
    router.push(url || '/home')
  }

  onMounted(() => {
    if (window.innerWidth < 768) {
      storeSetting.isMobileView = true
      storeSetting.showAside = false
    }
  })

</script>
<template>
  <div class="flex flex-col min-h-screen w-screen max-w-full min-w-full bg-sky-50 dark:bg-sky-950">
    
    <Transition name="slide-fade">
      <aside v-if="storeSetting.showAside" class="fixed h-full w-64 top-0 left-0 flex flex-col border-r border-transparent border-solid shadow-2xl shadow-blue-500/50 bg-white dark:bg-slate-700">
        <div class="flex pt-8 pb-6 justify-center items-center">
          <img alt="SellAI" :src="logoText" class="inline w-64 h-16" />
        </div>
        <div class="overflow-auto flex-1 pb-8">  
          Navegacion
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
        <div class="ml-2 flex">
          <switchTheme />
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
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-100%);
    opacity: 0;
  }
</style>