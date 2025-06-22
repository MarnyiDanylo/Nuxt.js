<script setup lang="ts">
import { ref, h, resolveComponent, computed } from 'vue'
import { useFetch } from '#app'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

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

const sorting = ref([])
const globalFilter = ref('')

function getHeader(column: Column<Product>, label: string) {
  const isSorted = column.getIsSorted()
  return h(
      UDropdownMenu,
      {
        content: { align: 'start' },
        items: [
          {
            label: 'Asc',
            type: 'checkbox',
            icon: 'i-lucide-arrow-up-narrow-wide',
            checked: isSorted === 'asc',
            onSelect: () => (isSorted === 'asc' ? column.clearSorting() : column.toggleSorting(false))
          },
          {
            label: 'Desc',
            icon: 'i-lucide-arrow-down-wide-narrow',
            type: 'checkbox',
            checked: isSorted === 'desc',
            onSelect: () => (isSorted === 'desc' ? column.clearSorting() : column.toggleSorting(true))
          }
        ]
      },
      () =>
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            label,
            icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
            class: '-mx-2.5 data-[state=open]:bg-elevated',
            'aria-label': `Sort by ${label}`
          })
  )
}

const columns: TableColumn<Product>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => getHeader(column, 'Назва')
  },
  {
    accessorKey: 'description',
    header: ({ column }) => getHeader(column, 'Опис'),
    cell: ({ row }) =>
        h('p', { class: 'max-w-[300px] whitespace-normal break-words' }, row.getValue('description'))
  },
  {
    accessorKey: 'price',
    header: ({ column }) => getHeader(column, 'Ціна'),
    cell: ({ row }) => h('span', undefined, `${row.getValue('price')} €`)
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => getHeader(column, 'Оцінка'),
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      const colorClass = rating < 4.5 ? 'text-red-500' : 'text-green-500'
      return h('span', { class: colorClass }, rating.toFixed(1))
    }
  },
  {
    accessorKey: 'brand',
    header: ({ column }) => getHeader(column, 'Бренд')
  },
  {
    accessorKey: 'category',
    header: ({ column }) => getHeader(column, 'Категорія')
  },
  {
    accessorKey: 'thumbnail',
    header: ({ column }) => getHeader(column, 'Фото'),
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
    <div class="px-4 pt-2 pb-1">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Пошук..." />
    </div>

    <div class="overflow-x-auto rounded border border-gray-200">
      <UTable
          ref="table"
          v-model:pagination="pagination"
          v-model:sorting="sorting"
          v-model:global-filter="globalFilter"
          :data="products"
          :columns="columns"
          :loading="status === 'pending'"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
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
