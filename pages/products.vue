<script setup lang="ts">
import { ref, h, resolveComponent } from 'vue'
import { useFetch } from '#app'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

type Product = {
  id: number
  title: string
  description: string
  price: number
  rating: number
  brand: string
  category: string
  thumbnail: string
}

const table = useTemplateRef('table')

const { data, status } = await useFetch<{ products: Product[] }>('https://dummyjson.com/products', {
  key: 'products-data'
})

const products = computed(() => data.value?.products || [])


const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const columns: TableColumn<Product>[] = [
  { accessorKey: 'title', header: 'Назва' },
  {
    accessorKey: 'description',
    header: 'Опис',
    cell: ({ row }) =>
        h('p', { class: 'max-w-[300px] whitespace-normal break-words' }, row.getValue('description'))
  },
  {
    accessorKey: 'price',
    header: 'Ціна',
    cell: ({ row }) => h('span', undefined, `${row.getValue('price')} €`)
  },
  {
    accessorKey: 'rating',
    header: 'Оцінка',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      const colorClass = rating < 4.5 ? 'text-red-500' : 'text-green-500'
      return h('span', { class: colorClass }, rating.toFixed(1))
    }
  },
  { accessorKey: 'brand', header: 'Бренд' },
  { accessorKey: 'category', header: 'Категорія' },
  {
    accessorKey: 'thumbnail',
    header: 'Фото',
    cell: ({ row }) => {
      const url = row.getValue('thumbnail') as string
      return h('img', {
        src: url,
        width: 100,
        height: 100,
        class: 'object-cover rounded'
      })
    }
  }
]
</script>

<template>
  <div class="w-full max-w-6xl mx-auto space-y-4 pb-4">
    <div class="overflow-x-auto rounded border border-gray-200">
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="products"
          :columns="columns"
          :loading="status === 'pending'"
          :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
          class="min-w-[900px]"
      />
    </div>

    <div class="flex justify-center border-t border-(--ui-border) pt-4">
      <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
