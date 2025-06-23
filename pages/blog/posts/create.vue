<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи'),
  content: z.string().min(10, 'Контент не може бути порожнім'),
  category_id: z.string({ required_error: 'Оберіть категорію' })
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  content: '',
  category_id: ''
})

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const categories = ref<{ name: string; id: string }[]>([])
const isLoading = ref(true)

const { data: loadedCategories } = await useAsyncData('categories', async () => {
  try {
    const response = await $fetch('/blog/categories', {
      baseURL: config.public.apiBase
    })
    return Array.isArray(response) ? response : response?.data || []
  } catch (error) {
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити категорії',
      color: 'error'
    })
    return []
  }
})

watch(loadedCategories, (newVal) => {
  if (newVal && newVal.length) {
    categories.value = newVal.map(c => ({
      name: c.title || `Категорія ${c.id}`,
      id: String(c.id)
    }))
    isLoading.value = false
  }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/blog/posts', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: event.data
    })

    toast.add({
      title: 'Успішно!',
      description: 'Стаття створена',
      color: 'success'
    })

    await router.push('/blog/posts')
  } catch (error) {
    console.error('Помилка створення:', error)
    toast.add({
      title: 'Помилка!',
      description: 'Не вдалося створити статтю',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Створення статті</h1>

    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField label="Заголовок" name="title">
        <UInput v-model="state.title" />
      </UFormField>

      <UFormField label="Контент" name="content">
        <UTextarea v-model="state.content" :rows="10" />
      </UFormField>

      <UFormField label="Категорія" name="category_id">
        <div v-if="isLoading">
          <USkeleton class="h-10 w-full" />
        </div>
        <select
            v-else
            v-model="state.category_id"
            class="w-full border rounded-md px-3 py-2 dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="" disabled>Оберіть категорію</option>
          <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </UFormField>

      <div class="pt-4">
        <UButton type="submit" :disabled="isLoading">
          Створити статтю
        </UButton>
      </div>
    </UForm>
  </div>
</template>