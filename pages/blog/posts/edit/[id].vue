<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи'),
  content: z.string().min(10, 'Контент не може бути порожнім'),
  category_id: z.string({ required_error: 'Оберіть категорію' })
})

type Schema = z.output<typeof schema>

const route = useRoute()
const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const state = reactive({
  title: '',
  content: '',
  category_id: ''
})

const categories = ref<{ name: string; id: string }[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)

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

const { data: postData } = await useAsyncData('post', async () => {
  try {
    const response = await $fetch(`/blog/posts/${route.params.id}`, {
      baseURL: config.public.apiBase
    })
    console.log('Отримані дані статті:', response)
    return response.data || response
  } catch (error) {
    console.error('Помилка завантаження:', error)
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити статтю',
      color: 'error'
    })
    throw createError({
      statusCode: 404,
      statusMessage: 'Стаття не знайдена'
    })
  }
})

watch([loadedCategories, postData], ([cats, post]) => {
  if (cats && cats.length) {
    categories.value = cats.map(c => ({
      name: c.title || `Категорія ${c.id}`,
      id: String(c.id)
    }))
  }

  if (post) {
    state.title = post.title || ''
    state.content = post.content_raw || post.content_html || ''
    state.category_id = String(post.category_id || '')

    console.log('Заповнені дані форми:', {
      title: state.title,
      content: state.content,
      category_id: state.category_id
    })
  }

  if (cats || post) {
    isLoading.value = false
  }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true;
  try {
    const response = await $fetch(`/blog/posts/edit/${route.params.id}`, {
      method: 'PUT',
      baseURL: config.public.apiBase,
      body: {
        ...event.data,
        content_raw: event.data.content
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    toast.add({
      title: 'Успішно!',
      description: 'Статтю оновлено',
      color: 'success'
    });

    state.content = response.post.content;
    await router.push('/blog/posts');
  } catch (error) {
    console.error('Помилка оновлення:', error);
    toast.add({
      title: 'Помилка!',
      description: 'Не вдалося оновити статтю: ' + (error.data?.message || error.message),
      color: 'error'
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="max-w-full px-6 mx-auto">
    <h1 class="text-2xl font-bold mb-6">Редагування статті</h1>

    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
      <div class="grid grid-cols-1 gap-6">
        <UFormField label="Заголовок" name="title">
          <UInput v-model="state.title" />
        </UFormField>

        <UFormField label="Контент" name="content">
          <UTextarea
              v-model="state.content"
              :rows="15"
              class="w-full min-h-[400px] text-base"
          :ui="{
          base: 'w-full',
          }"
          :key="state.content"
          />
        </UFormField>

        <UFormField label="Категорія" name="category_id">
          <div v-if="isLoading">
            <USkeleton class="h-10 w-full" />
          </div>
          <select
              v-else
              v-model="state.category_id"
              class="w-full max-w-md border rounded-md px-3 py-2 dark:bg-gray-900 dark:border-gray-700"
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

        <div class="pt-2">
          <UButton type="submit" :disabled="isLoading || isSubmitting">
            <span v-if="!isSubmitting">Оновити статтю</span>
            <span v-else class="flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin" />
              Оновлення...
            </span>
          </UButton>
        </div>
      </div>
    </UForm>
  </div>
</template>