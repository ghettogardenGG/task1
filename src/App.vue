<template>
  <div class="container">
    <table-body :headers="header" :data="data" @delete="deleteRow($event)">
      <template #header-end><button @click="showModal = true">Добавить</button></template>
    </table-body>
    <modal-add-row :showModal="showModal" @add="addRow($event)" @cancel="showModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TableBody from '@/components/TableBody.vue';
import ModalAddRow from './components/AddRow.vue';

const showModal = ref(false);

let nextId = 6;

const header = { name: 'Название', fio: 'ФИО директора', phone: 'Номер телефона' };

const data = ref([
  { id: 1, name: 'ИП Иванов', fio: 'Иванов И.И.', phone: '89993332211' },
  { id: 2, name: 'ООО "Железосталь"', fio: 'Петров С.И.', phone: '+79314442211' },
  { id: 3, name: 'ОАО "Матрешка"', fio: 'Смирнова А.В.', phone: '8989445511' },
  { id: 4, name: 'ИП Кузнецова', fio: 'Кузнецова Ф.Ф.', phone: '89993322114' },
  { id: 5, name: 'ООО "Великий лес"', fio: 'Петров', phone: '8944212781' },
]);

const addRow = (newRow) => {
  data.value.push({
    id: nextId++,
    name: newRow.name,
    fio: newRow.fio,
    phone: newRow.phone,
  });

  showModal.value = false;
};
const deleteRow = (id) => {
  let index = data.value.findIndex((item) => item.id === id);
  if (index !== -1)
    data.value.splice(index, 1);
};
</script>
<style scoped>
body {
  padding: 30px;
  background: #f8f8f8;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

button {
  padding: 6px 12px;
}
</style>