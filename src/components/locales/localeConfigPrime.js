import { defineComponent, onMounted } from "vue";
import { usePrimeVue } from "primevue/config";
import { translations } from "./translations/localePrimeVue.js"; // Importa las traducciones

export default defineComponent({
  setup() {
    const changeLanguage = (lng) => {
      const primevue = usePrimeVue();

      switch (lng) {
        case "en":
          primevue.config.locale = translations.en;
          break;
        case "es":
        default:
          primevue.config.locale = translations.es;
          break;
      }
    };

    onMounted(() => {
      changeLanguage(); // Cambiar al español cuando el componente se monta inicialmente
    });

    return {
      changeLanguage, // Devuelve la función para que puedas llamarla en el template si es necesario
    };
  },
});