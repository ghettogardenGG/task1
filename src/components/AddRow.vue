<template>
  <div v-if="props.showModal" class="modal-overlay">
    <div class="modal">
      <h3>Добавить запись</h3>
      <input v-model="newRow.name" placeholder="Название" />
      <input v-model="newRow.fio" placeholder="ФИО директора" />
      <input v-model="newRow.phone" placeholder="Номер телефона" />
      <div class="modal-action">
        <button @click="emit('cancel')">Отмена</button>
        <button @click="emit('add', newRow)" :disabled="stateNewRow">Ок</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, defineEmits, defineProps, watch } from 'vue';

const props = defineProps({
  showModal: { type: Boolean, default: true }
})
const emit = defineEmits(['add', 'cancel']);

const newRow = ref({ name: '', fio: '', phone: '' });

const stateNewRow = computed(() => {
  if (!newRow.value.name || !newRow.value.fio || !newRow.value.phone)
    return true;
  else
    return false;
});

watch(
  () => props.showModal,
  (v) => {
    if (v) {
      newRow.value = { name: '', fio: '', phone: '' };
    }
  }
)

</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  width: 300px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.modal input {
  margin-bottom: 10px;
  padding: 6px;
}

.modal-action {
  display: flex;
  justify-content: space-between;
}
</style>