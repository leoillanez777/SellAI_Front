<script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import RequestService                         from '@/plugins/request'
  import { useAlertStore }                      from '@/data'
  // PrimeVue
  import BlockUI                                from 'primevue/blockui'
  import Toolbar                                from 'primevue/toolbar'
  import Button                                 from 'primevue/button'
  import Skeleton                               from 'primevue/skeleton'
  import Dropdown                               from 'primevue/dropdown'
  import MultiSelect                            from 'primevue/multiselect'
  import ToggleButton                           from 'primevue/togglebutton'
  import InputText                              from 'primevue/inputtext'
  import InputSwitch                            from 'primevue/inputswitch'
  import Panel                                  from 'primevue/panel'
  import Fieldset                               from 'primevue/fieldset'
  import DataTable                              from 'primevue/datatable'
  import Column                                 from 'primevue/column'
  import { FilterMatchMode }                    from 'primevue/api'

  import ChipsDisplay                           from '@/components/utils/ChipsDisplay.vue'

  const alertStore  = useAlertStore()
  // Use Request Api
  const requestApi  = new RequestService()
  const defaultRow  = { alias: '',  name: '', roles: [], required: false, message: '', default_value: '' }
  
  const load = reactive({
    loading: false,
    loadingGrid: false,
    loadingCell: false,
    blockedContent: true,
    modalVisible: false
  })

  const systemData = reactive({
    intents: [],
    actions: [
      { name: 'Crear', id: 'create'},
      { name: 'Editar', id: 'update'},
      { name: 'Visualizar', id: 'read'},
      { name: 'Eliminar', id: 'delete'},
      { name: 'Saludo', id: 'greeting'},
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
    intent_id: null,
    intent: null,
    display: null,
    pdf: false,
    action: null,
    type: null,
    collection: '',
    systemMsg: null,
    systemMsgOk: null,
    systemMsgBad: null,
    promptOk: null,
    promptBad: null,
    message: '',
    entities: null
  })

  // Datatable
  const dt = ref()
  const filterDT = ref({ 'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  
  onMounted(async () => {
    load.loading = true
    const intentsApi = await requestApi.getMethod("intent/")
    if (intentsApi.success) {
      systemData.intents = intentsApi.result;
      const entitiesApi = await requestApi.getMethod("entity/")
      if (entitiesApi.success) {
        systemData.entities = entitiesApi.result
      }
    }
    else {
      alertStore.toastAlert('Error al cargar los datos de la API', 'warn', 3)
    }
    load.loading = false
  })

  const onChangeIntent = async (ev) => {
    if (userData.intent) {
      load.loading = true
      const sys_menuApi = await requestApi.getMethod(`sys_menu/${userData.intent.id}`)

      const r = sys_menuApi.result ?? {}
      userData._id = r._id ?? ''
      userData.intent_id = r.intent_id ?? userData.intent.id
      userData.name = userData.intent.name
      userData.display = r.display ?? ""
      userData.pdf = r.pdf ?? false
      userData.action = r.action ?? null
      userData.type = r.type ?? 'text'
      userData.collection = r.collection ?? ''
      userData.systemMsg = r.systemMsg ?? null
      userData.systemMsgOk = r.systemMsgOk ?? null
      userData.systemMsgBad = r.systemMsgBad ?? null
      userData.promptOk = r.promptOk ?? null
      userData.promptBad = r.promptBad ?? null
      userData.entities = r.entities ?? []
      
      load.blockedContent = false
      load.loading = false
    }
  }

  const onChangeEntity = async (ev, index) => {
    const entityName = userData.entities[index].name
    if (ev.value !== entityName) {
      systemData.lastName = ev.value
      userData.entities[index].roles = []
      await nextTick()
    }
  }

  const getEntityRoles = async (entityName) => {
    load.loadingCell = true
    const entity = await requestApi.getMethod(`entity/${entityName}`)
    const roles = entity.success ? entity.result.roles : null
    load.loadingCell = false
    return roles
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
    if (!userData.entities) {
      userData.entities = []
    }
    let copy = JSON.parse(JSON.stringify(defaultRow))
    userData.entities.push(copy)
  }

  const saveIntent = async () => {
    load.loading = load.blockedContent = load.loadingGrid = true

    if (userData.entities) {
      userData.entities = userData.entities.filter(element => {
        return element.name && element.roles && element.roles.length > 0
      })
    }

    if (userData.action === null) {
      alertStore.toastAlert('Debe completar la acción.', 'error', 5, 'Faltan datos')
      load.loading = load.blockedContent = load.loadingGrid = false
      return
    }
    
    const dataSave = JSON.stringify(userData)

    let resultAPI
    try {
      if (userData._id === '') {
        resultAPI = await requestApi.postMethod(`sys_menu/`, dataSave)
      }
      else {
        resultAPI = await requestApi.putMethod(`sys_menu/${userData._id}`, dataSave)
      }
      if (resultAPI.success) {
        alertStore.toastAlert('¡Se grabó correctamente!', 'success', 3, '👍🏻 OK!')
        userData._id = resultAPI.result._id
      }
      else {
        resultAPI.messages.forEach(element => {
          alertStore.toastAlert(element, 'warn', 5, 'Error al grabar')
        })
      }
    } catch (error) {
      alertStore.exception(error, 5)
    }
    finally {
      load.loading = load.blockedContent = load.loadingGrid = false
    }
  }
</script>
<template>
  <div class="relative">
    <div class="mb-4 sm:mr-10">
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
    <BlockUI :blocked="load.blockedContent" :pt="{ root: { class: 'sm:mr-8 sm:pl-8 rounded-lg' } }">
      <div class="grid grid-cols-4 gap-4 sm:mr-10">
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="tbPdf">Ver PDF:</label>
          <ToggleButton inputId="tbPdf" v-model="userData.pdf" class="w-full" onLabel="Si" offLabel="No" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="dpActions"><span class="text-red-600">*</span> Acción:</label>
          <Dropdown inputId="dpActions" v-model="userData.action" :options="systemData.actions" showClear optionLabel="name" optionValue="id" placeholder="Seleccione acción" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtNombre">Nombre:</label>
          <InputText id="txtNombre" type="text" v-model="userData.display" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="dpTypeResponse">Tipo de Respuesta:</label>
          <Dropdown inputId="dpTypeResponse" v-model="userData.type" :options="systemData.types" showClear optionLabel="name" optionValue="id" placeholder="Seleccione tipo de respuesta" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400">Nombre de intención relación:</label>
          <InputText type="text" v-model="userData.collection" class="w-full" />
        </div>
        <div class="col-span-4 sm:col-span-2">
          <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400">Prompt General:</label>
          <InputText type="text" v-model="userData.systemMsg" class="w-full" />
          <small id="txtMessageOK-help">Siempre envía instrucciones para agregar al asistente .</small>
        </div>
        
        <div class="col-span-4">
          <Fieldset legend="Prompt para sistema" :toggleable="true">
            <p class="m-0">
              <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtMessageOK">Respuesta correcta:</label>
              <InputText id="txtMessageOK" type="text" v-model="userData.systemMsgOk" class="w-full border-green-600" />
              <small id="txtMessageOK-help">Instrucciones para agregar al asistente si esta todo correcto.</small>
            </p>
            <p class="m-0">
              <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtMessageBAD">Repuesta incorrecta:</label>
              <InputText id="txtMessageBAD" type="text" v-model="userData.systemMsgBad" class="w-full border-yellow-600" />
              <small id="txtMessageBAD-help">Instrucciones para agregar al asistente si faltan datos.</small>
            </p>
          </Fieldset>
        </div>
        <div class="col-span-4">
          <Fieldset legend="Prompt para usuario" :toggleable="true">
            <p class="m-0">
              <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtPromptOK">Respuesta correcta:</label>
              <InputText id="txtPromptOK" type="text" v-model="userData.promptOk" class="w-full border-green-600" />
              <small id="txtPromptOK-help">Tipo de respuesta del asistente si esta todo correcto.</small>
            </p>
            <p class="m-0">
              <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400" for="txtPromptBAD">Repuesta incorrecta:</label>
              <InputText id="txtPromptBAD" type="text" v-model="userData.promptBad" class="w-full border-yellow-600" />
              <small id="txtPromptBAD-help">Tipo de respuesta del asistente si faltan datos.</small>
            </p>
          </Fieldset>
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
                  <Dropdown v-model="data[field]" v-on:change="onChangeEntity($event, index)" :options="systemData.entities" filter
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
              <Column header="Promp si falta" field="message">
                <!--          Message          -->
                <template #body="slotProps">
                  <Skeleton v-if="load.loadingGrid"></Skeleton>
                  <span v-else>{{ slotProps.data.message }}</span>
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
      

    <div class="sticky bottom-0 mt-4 sm:mr-10">
      <Toolbar :pt="{root: 'bg-neutral-100 rounded-lg ring-offset-2 ring-2 dark:bg-stone-900' }">
        <template #center>          
          <Button label="Grabar" severity="warning" icon="pi pi-save" rounded @click="saveIntent" :disabled="load.blocked" :loading="load.loading"
            class="sm:px-12 sm:py-4" />
        </template>
      </Toolbar>
    </div>

  </div>
  
</template>
