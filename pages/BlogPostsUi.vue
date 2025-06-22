<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Список постів з пагінацією</h1>
    <UContainer>
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="posts"
          :columns="columns"
          :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
          class="w-full"
      />

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
import { useRuntimeConfig } from '#imports'
import { h } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

interface Post {
  id: number
  title: string
  published_at: string
  user: { name: string }
  category: { title: string }
}

const table = useTemplateRef('table')
const posts = ref<Post[]>([])
const loading = ref(false)
const config = useRuntimeConfig()

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const getPosts = async () => {
  loading.value = true
  try {
    const response = await $fetch('/blog/posts', {
      baseURL: config.public.apiBase,
      params: {
        page: pagination.value.pageIndex + 1,
        perPage: pagination.value.pageSize
      }
    })

    posts.value = response.data ?? response
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

watch(() => pagination.value.pageIndex, getPosts, { immediate: true })

const columns: TableColumn<Post>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'user',
    header: 'Автор',
    cell: ({ row }) => row.original.user?.name ?? '—'
  },
  {
    accessorKey: 'category',
    header: 'Категорія',
    cell: ({ row }) => row.original.category?.title ?? '—'
  },
  {
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }) =>
        h(
            'a',
            {
              href: `/blog/posts/${row.original.id}`,
              class: 'text-blue-500 hover:underline'
            },
            row.original.title
        )
  },
  {
    accessorKey: 'published_at',
    header: 'Дата публікації',
    cell: ({ row }) => new Date(row.original.published_at).toLocaleDateString()
  }
]
</script>