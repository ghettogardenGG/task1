<template>
  <div class="container">
    <div class="header">
      <input v-model="search" placeholder="Найти по ФИО..." class="search" />
      <div class="header-slot">
        <slot name="header-end" />
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th v-for="(header, key) in props.headers" :key="key" @click="setSort(key)" style="cursor: pointer">
            {{ header }}
            <span v-if="sortKey === key">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
          <td v-for="key in headerKeys" :key="key">
            {{ item[key] }}
          </td>
          <td><span @click="emit('delete', item.id)" style="cursor: pointer;">X</span></td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">←</button>
      <span style="margin: 5px">Страница {{ page }} из {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">→</button>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, defineEmits, defineProps, watch } from 'vue';

const sortDirection = ref('asc');
const sortKey = ref('');
const search = ref('');
const page = ref(1);
const perPage = 2;

const emit = defineEmits(['delete']);

const props = defineProps({
  headers: Object,
  data: Array[Object],
});

const headerKeys = computed(() => {
  return Object.keys(props.headers);
})

const nextPage = () => {
  if (page.value < totalPages.value) page.value++;
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};

const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage));

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredData.value.slice(start, start + perPage);
});

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
};
const filteredData = computed(() => {
  const lowerSearch = search.value.toLowerCase();
  let res = props.data.filter((item) =>
    item.fio.toLowerCase().includes(lowerSearch)
  );

  if (sortKey.value) {
    res.sort((a, b) => {
      const valueA = a[sortKey.value].toLowerCase();
      const valueB = b[sortKey.value].toLowerCase();
      if (valueA < valueB) {
        return sortDirection.value === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection.value === 'asc' ? 1 : -1;
      }
    })
  }
  return res;
});

watch(
  [filteredData, totalPages],
  () => {
    if (page.value > totalPages.value) {
      page.value = totalPages.value || 1;
    }
  });
</script>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th,
td {
  border: 1px solid black;
  padding: 5px;
  text-align: left;
}

.container {
  background: white;
  padding: 20px;
  height: 200px;
  max-width: 800px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search {
  margin-bottom: 15px;
  padding: 6px;
  width: 200px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.header-slot {
  margin-left: auto;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}
</style>