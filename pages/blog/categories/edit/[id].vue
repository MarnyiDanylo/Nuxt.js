<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи'),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const route = useRoute()
const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const state = reactive({
  title: '',
  description: ''
})

const isLoading = ref(true)
const isSubmitting = ref(false)

const { data: categoryData } = await useAsyncData('category', async () => {
  try {
    const response = await $fetch(`/blog/categories/${route.params.id}`, {
      baseURL: config.public.apiBase
    })
    return response.data || response
  } catch (error) {
    console.error('Помилка завантаження:', error)
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити категорію',
      color: 'error'
    })
    throw createError({
      statusCode: 404,
      statusMessage: 'Категорія не знайдена'
    })
  }
})

watch(categoryData, (newVal) => {
  if (newVal) {
    state.title = newVal.title || ''
    state.description = newVal.description || ''
    isLoading.value = false
  }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true
  try {
    await $fetch(`/blog/categories/${route.params.id}`, {
      method: 'PUT',
      baseURL: config.public.apiBase,
      body: event.data
    })

    toast.add({
      title: 'Успішно!',
      description: 'Категорію оновлено',
      color: 'success'
    })

    await router.push('/blog/categories')
  } catch (error) {
    console.error('Помилка оновлення:', error)
    toast.add({
      title: 'Помилка!',
      description: 'Не вдалося оновити категорію',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Редагування категорії</h1>

    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField label="Назва" name="title">
        <UInput v-model="state.title" />
      </UFormField>

      <UFormField label="Опис" name="description">
        <UTextarea v-model="state.description" />
      </UFormField>

      <div class="pt-4">
        <UButton type="submit" :disabled="isSubmitting">
          <span v-if="!isSubmitting">Оновити категорію</span>
          <span v-else class="flex items-center gap-1">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin" />
            Оновлення...
          </span>
        </UButton>
      </div>
    </UForm>
  </div>
</template>