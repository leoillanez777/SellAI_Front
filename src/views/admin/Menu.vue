<script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import RequestService from '@/plugins/request'
  // PrimeVue
  import BlockUI from 'primevue/blockui'
  import Toolbar from 'primevue/toolbar'
  import Button from 'primevue/button'
  import Skeleton from 'primevue/skeleton'
  import Dropdown from 'primevue/dropdown'
  import MultiSelect from 'primevue/multiselect'
  import ToggleButton from 'primevue/togglebutton'
  import InputText from 'primevue/inputtext'
  import InputSwitch from 'primevue/inputswitch'
  import Panel from 'primevue/panel'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import { FilterMatchMode } from 'primevue/api'
  import Editor from 'primevue/editor'

  import ChipsDisplay from '@/components/utils/ChipsDisplay.vue'

  // Use Request Api
  const requestApi = new RequestService()
  const defaultRow = { alias: '',  name: '', roles: [], required: false, message: '', default_value: '' }
  
  const load = reactive({
    loading: false,
    loadingGrid: false,
    loadingCell: false,
    blockedContent: false,
    modalVisible: false
  })

  const systemData = reactive({
    intents: [],
    actions: [
      { name: 'Crear', id: 'create'},
      { name: 'Editar', id: 'update'},
      { name: 'Visualizar', id: 'read'},
      { name: 'Eliminar', id: 'delete'},
    ],
    types: [
      { name: 'Texto', id: 'text'},
      { name: 'Tabla', id: 'table'}
    ],
    entities: [],
    rolesForEntity: {},
    lastName: '',
    roleValues: {},
  })

  const userData = reactive({
    _id: null,
    name: null,
    id_intent: null,
    intent: null,
    display: null,
    pdf: false,
    action: null,
    type: null,
    collection: '',
    message: '',
    entities: []
  })

  // Datatable
  const dt = ref();
  const filterDT = ref({ 'global': { value: null, matchMode: FilterMatchMode.CONTAINS }});
  
  onMounted(async () => {
    load.loading = true
    const intentsApi = await requestApi.getMethod("intent/")
    systemData.intents = intentsApi.intents
    const entitiesApi = await requestApi.getMethod("entity/")
    systemData.entities = entitiesApi.entities
    load.loading = false
  });

  const onChangeIntent = async (ev) => {
    if (userData.intent) {
      load.loading = true
      const sys_menuApi = await requestApi.getMethod(`sys_menu/${userData.intent.id}`)

      const r = sys_menuApi.sys_menu ?? {}
      console.log(sys_menuApi)
      
      userData._id = r._id ?? ''
      userData.id_intent = r.id_intent ?? userData.intent.id
      userData.name = userData.intent.name
      userData.display = r.display ?? ""
      userData.pdf = r.pdf ?? false
      userData.action = r.action ?? null
      userData.type = r.type ?? 'text'
      userData.collection = r.collection ?? ''
      userData.message = r.message ?? null
      userData.entities = r.entities ?? []

      load.loading = false
      load.blocked = false
    }
  };

  const onChangeEntity = async (ev, index) => {
    const entityName = userData.entities[index].name
    if (ev.value !== entityName) {
      systemData.lastName = ev.value
      userData.entities[index].roles = []
      await nextTick()
    }
  }

  const getEntityRoles = async (entityName) => {
    load.loadingCell = true;

    const entity = await requestApi.getMethod(`entity/${entityName}`);  
    const roles = entity.entity.roles ?? null;

    load.loadingCell = false;
    
    return roles;
  }

  const OnCellEditInit = async (ev) => {
    const { field, index, data } = ev
    
    if (field === "roles" && (systemData.lastName || data.name)) {
      const row = userData.entities[index]
      const dataName = systemData.lastName || data.name
      systemData.lastName = ''

      systemData.roleValues[dataName] = []

      if (!systemData.rolesForEntity[dataName]) {
        systemData.rolesForEntity[dataName] = (await getEntityRoles(dataName)) || []
      }
      
      await nextTick()
      systemData.roleValues[dataName] = row.roles
    }
  }

  const OnCellEditComplete = async (ev) => {
    const { data, newData, newValue, field } = ev
    
    if (field === "roles") {
      const dataName = data.name
      data.roles = systemData.roleValues[dataName] || []
    }
    else if (field === "name") {
      data.roles = data.name === newValue ? newData.roles : []
      data[field] = newValue;
    }
    else {
      data[field] = newValue
    }
    await nextTick()
  }

  const newEntity = () => {
    let copy = JSON.parse(JSON.stringify(defaultRow));
    userData.entities.push(copy);
  }

  const saveIntent = async () => {
    load.loading = load.blockedContent = load.loadingGrid = true
    
    const dataSave = JSON.stringify(userData)

    console.log("DATA SAVE /////")
    console.log(dataSave)

    let resultAPI
    if (userData._id === '') {
      resultAPI = await requestApi.postMethod(`sys_menu/`, dataSave)
    }
    else {
      resultAPI = await requestApi.putMethod(`sys_menu/${userData._id}`, dataSave)
    }

    console.log('Se grabo...', resultAPI)

    load.loading = load.blockedContent = load.loadingGrid = false
    
  }
</script>
<template>
  <div class="relative">
    
    <div class="mb-4">
      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="intentos">Intención:</label>
      <Dropdown inputId="intentos" v-model="userData.intent" :options="systemData.intents" v-on:change="onChangeIntent($event)"
        filter optionLabel="name" :loading="load.loading" placeholder="Seleccione Intención" class="w-full md:w-14rem">
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex align-items-center">
            <div>{{ slotProps.value.name }}</div>
          </div>
          <span v-else>
            {{ slotProps.placeholder }}
          </span>
        </template>
        <template #option="slotProps">
          <div class="flex align-items-center">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Dropdown>
    </div>
    <BlockUI :blocked="load.blocked">
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="tbPdf">Ver PDF:</label>
          <ToggleButton inputId="tbPdf" v-model="userData.pdf" class="w-full" onLabel="Si" offLabel="No" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="dpActions">Acción:</label>
          <Dropdown inputId="dpActions" v-model="userData.action" :options="systemData.actions" showClear optionLabel="name" optionValue="id" placeholder="Seleccione acción" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtNombre">Nombre:</label>
          <InputText type="text" v-model="userData.display" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="dpTypeResponse">Tipo de Respuesta:</label>
          <Dropdown inputId="dpTypeResponse" v-model="userData.type" :options="systemData.types" showClear optionLabel="name" optionValue="id" placeholder="Seleccione tipo de respuesta" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400">Nombre de intención relación:</label>
          <InputText type="text" v-model="userData.collection" class="w-full" />
        </div>
        <div class="col-span-4">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtMessage">Mensaje de respuesta:</label>
          <Editor v-model="userData.message" editorStyle="height: 320px" />
        </div>

        <div class="col-span-4 mt-4">
          <!--          --------          -->
          <!--          ENTITIES          -->
          <!--          --------          -->
          <Panel header="Identificador de datos" :toggleable="true" class="w-full mt-2">
            <DataTable ref="dt" :value="userData.entities" dataKey="id" :filters="filterDT" editMode="cell" showGridlines 
              responsiveLayout="stack" @cell-edit-complete="OnCellEditComplete" @cell-edit-init="OnCellEditInit" >
              <template #header>
                <div class="table-header grid grid-cols-6 gap-1">
                  <div class="col-span-6 sm:col-span-3">
                    <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="newEntity" :loading="load.loadingGrid" />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <span class="p-input-icon-left w-full">
                      <i class="pi pi-search" />
                      <InputText v-model="filterDT['global'].value" placeholder="Buscar..." class="w-full" />
                    </span>
                  </div>
                </div>
              </template>
              <Column header="Nombre" field="alias" :sortable="true" style="min-width:6rem">
                <!--          Alias          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else>{{ slotProps.data.alias }}</span>
                </template>
                <template #editor="{ data, field }">
                  <InputText type="text" v-model="data[field]" class="w-full" />
                </template>
              </Column>
              <Column header="Entidad" field="name" :sortable="true" style="min-width:6rem">
                <!--          Name Entity         -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else>{{ slotProps.data.name }}</span>
                </template>
                <template #editor="{ data, field, index }">
                  <Dropdown v-model="data[field]" v-on:change="onChangeEntity($event, index)" :options="systemData.entities" 
                    optionLabel="name" optionValue="name" placeholder="Seleccione Entidad" class="w-full" />
                </template>
              </Column>
              <Column header="Rol de Entidad" field="roles" :sortable="true" style="min-width:6rem" >
                <!--          Role          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <ChipsDisplay v-else :json="slotProps.data.roles"></ChipsDisplay>
                </template>
                <template #editor="{ data, index }">
                  <MultiSelect v-model="systemData.roleValues[data['name']]" :options="systemData.rolesForEntity[data['name']]" optionLabel="name" placeholder="Seleccione Roles"
                     class="w-full md:w-20rem" :loading="load.loadingCell"  />
                </template>
              </Column>
              <Column header="Obligatorio" field="required" :sortable="true" style="min-width:6rem">
                <!--          Required          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else-if="slotProps.data.required">Es obligatorio</span>
                  <span v-else></span>
                </template>
                <template #editor="{ data, field }">
                  <div class="flex items-center">
                    <InputSwitch v-model="data[field]" />
                  </div>
                </template>
              </Column>
              <Column header="Valor Defecto" field="default_value" style="min-width:6rem">
                <!--          Default Value          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else>{{ slotProps.data.default_value }}</span>
                </template>
                <template #editor="{ data, field }">
                  <InputText v-if="!data.required" type="text" v-model="data[field]" class="w-full" />
                </template>
              </Column>
              <Column header="Mensaje" field="message">
                <!--          Message          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else>{{ slotProps.data.alias }}</span>
                </template>
                <template #editor="{ data, field }">
                  <InputText type="text" v-model="data[field]" class="w-full" />
                </template>
              </Column>
            </DataTable>
          </Panel>
        </div>

      </div>
    </BlockUI>
      

    <div class="sticky bottom-0 mt-4">
      <Toolbar>
        <template #center>          
          <Button label="Grabar" severity="warning" icon="pi pi-save" rounded @click="saveIntent" :disabled="load.blocked" :loading="load.loading" />
        </template>
      </Toolbar>
    </div>

  </div>
  
</template>
