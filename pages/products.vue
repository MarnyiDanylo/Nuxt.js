<script setup lang="ts">
import { ref, h } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { useHead } from '#imports'
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

useHead({
  title: 'Список продуктів'
})

const table = useTemplateRef('table')

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  addedAt: string
}

const data = ref<Product[]>([
  { id: '2001', name: 'Apple', category: 'Fruits', price: 1.29, stock: 120, addedAt: '2024-03-25T09:00:00' },
  { id: '2002', name: 'Banana', category: 'Fruits', price: 0.99, stock: 200, addedAt: '2024-03-25T09:30:00' },
  { id: '2003', name: 'Carrot', category: 'Vegetables', price: 0.79, stock: 150, addedAt: '2024-03-25T10:00:00' },
  { id: '2004', name: 'Bread', category: 'Bakery', price: 2.49, stock: 50, addedAt: '2024-03-26T08:15:00' },
  { id: '2005', name: 'Milk', category: 'Dairy', price: 1.19, stock: 75, addedAt: '2024-03-26T09:45:00' },
  { id: '2006', name: 'Eggs', category: 'Dairy', price: 2.99, stock: 90, addedAt: '2024-03-26T10:30:00' },
  { id: '2007', name: 'Orange Juice', category: 'Beverages', price: 3.49, stock: 60, addedAt: '2024-03-26T11:00:00' },
  { id: '2008', name: 'Tomato', category: 'Vegetables', price: 1.09, stock: 130, addedAt: '2024-03-26T11:30:00' },
  { id: '2009', name: 'Chicken Breast', category: 'Meat', price: 5.99, stock: 40, addedAt: '2024-03-26T12:00:00' },
  { id: '2010', name: 'Cheese', category: 'Dairy', price: 3.89, stock: 55, addedAt: '2024-03-26T12:30:00' }
])

const columns: TableColumn<Product>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => getHeader(column, '#')
  },
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Product')
  },
  {
    accessorKey: 'category',
    header: ({ column }) => getHeader(column, 'Category')
  },
  {
    accessorKey: 'price',
    header: ({ column }) => getHeader(column, 'Price'),
    cell: ({ row }) => {
      const price = row.getValue('price')
      return h('div', { class: 'text-right font-medium' },
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
          }).format(price as number)
      )
    },
    sortingFn: 'auto', // використовується вбудована функція сортування для чисел
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => getHeader(column, 'Stock'),
    cell: ({ row }) => h('div', { class: 'text-right' }, row.getValue('stock')),
    sortingFn: 'auto', // використовується вбудована функція сортування для чисел
  },
  {
    accessorKey: 'addedAt',
    header: ({ column }) => getHeader(column, 'Added'),
    cell: ({ row }) => {
      return new Date(row.getValue('addedAt')).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    sortingFn: 'alphanumeric', // сортування для дати
  }
]

function getHeader(column: Column<Product>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
      'div',
      {
        class: 'cursor-pointer flex items-center justify-between',
        onClick: () => column.toggleSorting()
      },
      [
        label,
        h('span', { class: 'ml-2' }, isSorted ? (isSorted === 'asc' ? '↑' : '↓') : '⇅')
      ]
  )
}

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const globalFilter = ref('')
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <UInput v-model="globalFilter" placeholder="Пошук..." class="max-w-md" />

    <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="data"
        :columns="columns"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="flex-1"
    />

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
