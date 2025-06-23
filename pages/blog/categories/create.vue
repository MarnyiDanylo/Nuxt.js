<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи'),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  description: ''
})

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/blog/categories', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: event.data
    })

    toast.add({
      title: 'Успішно!',
      description: 'Категорію створено',
      color: 'success'
    })

    await router.push('/blog/categories')
  } catch (error) {
    console.error('Помилка створення:', error)
    toast.add({
      title: 'Помилка!',
      description: 'Не вдалося створити категорію',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Створення категорії</h1>

    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField label="Назва" name="title">
        <UInput v-model="state.title" />
      </UFormField>

      <UFormField label="Опис" name="description">
        <UTextarea v-model="state.description" />
      </UFormField>

      <div class="pt-4">
        <UButton type="submit">
          Створити категорію
        </UButton>
      </div>
    </UForm>
  </div>
</template>