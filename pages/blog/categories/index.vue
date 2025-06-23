<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Список категорій</h1>

    <UButton
        icon="i-lucide-plus"
        to="/blog/categories/create"
        color="primary"
        class="mb-4"
    >
      Додати категорію
    </UButton>

    <UContainer>
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="categories"
          :columns="columns"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          class="w-full"
      >
        <template #actions-cell="{ row }">
          <UDropdownMenu :items="getDropdownActions(row.original)">
            <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                aria-label="Actions"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <div class="mt-4 flex justify-center">
        <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { h } from 'vue'
import { useRuntimeConfig, useRouter, useToast } from '#imports'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

interface Category {
  id: number
  title: string
  description: string
  posts_count: number
}

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()
const table = useTemplateRef('table')
const categories = ref<Category[]>([])
const loading = ref(false)

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const getCategories = async () => {
  loading.value = true
  try {
    const response = await $fetch('/blog/categories', {
      baseURL: config.public.apiBase,
      params: {
        with_count: true
      }
    })

    categories.value = response.data ?? response
  } catch (err) {
    console.error('Fetch error:', err)
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити категорії',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

watch(() => pagination.value.pageIndex, getCategories, { immediate: true })

function getDropdownActions(category: Category): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Редагувати',
        icon: 'i-lucide-edit',
        onSelect: () => router.push(`/blog/categories/edit/${category.id}`)
      }
    ],
    [
      {
        label: 'Видалити',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: async () => {
          if (!confirm(`Ви впевнені, що хочете видалити категорію "${category.title}"?`)) return

          try {
            await $fetch(`/blog/categories/${category.id}`, {
              baseURL: config.public.apiBase,
              method: 'DELETE'
            })
            toast.add({ title: 'Категорію успішно видалено', color: 'success' })
            getCategories()
          } catch (e) {
            toast.add({ title: 'Не вдалося видалити категорію', color: 'error' })
          }
        }
      }
    ]
  ]
}

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'title',
    header: 'Назва',
    cell: ({ row }) =>
        h(
            'a',
            {
              href: `/blog/categories/${row.original.id}`,
              class: 'text-blue-500 hover:underline'
            },
            row.original.title
        )
  },
  {
    accessorKey: 'description',
    header: 'Опис',
    cell: ({ row }) => row.original.description || '—'
  },
  {
    accessorKey: 'created_at',
    header: 'Створено',
    cell: ({ row }) => {
      return row.original.created_at
          ? format(parseISO(row.original.created_at), 'dd.MM.yyyy', {locale: uk})
          : "невідомо";
    }
  },
  {
    id: 'actions',
    header: 'Дії'
  }
]
</script>