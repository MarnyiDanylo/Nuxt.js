<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Список статей з пагінацією</h1>

    <UButton
        icon="i-lucide-plus"
        to="/blog/posts/create"
        color="primary"
        class="mb-4"
    >
      Додати статтю
    </UButton>

    <UContainer>
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="posts"
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

interface Post {
  id: number
  title: string
  published_at: string
  user: { name: string }
  category: { title: string }
}

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()
const table = useTemplateRef('table')
const posts = ref<Post[]>([])
const loading = ref(false)

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

function getDropdownActions(post: Post): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Редагувати',
        icon: 'i-lucide-edit',
        onSelect: () => router.push(`/blog/posts/edit/${post.id}`)
      }
    ],
    [
      {
        label: 'Видалити',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: async () => {
          if (!confirm(`Ви впевнені, що хочете видалити статтю "${post.title}"?`)) return

          try {
            await $fetch(`/blog/posts/${post.id}`, {
              baseURL: config.public.apiBase,
              method: 'DELETE'
            })
            toast.add({ title: 'Статтю успішно видалено', color: 'success' })
            getPosts()
          } catch (e) {
            toast.add({ title: 'Не вдалося видалити статтю', color: 'error' })
          }
        }
      }
    ]
  ]
}

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
    cell: ({ row }) =>
        new Date(row.original.published_at).toLocaleDateString()
  },
  {
    id: 'actions',
    header: 'Дії'
  }
]
</script>