<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <USkeleton class="h-10 w-1/2 mx-auto mb-6" />
      <div class="space-y-4">
        <USkeleton class="h-4 w-3/4 mx-auto" />
        <USkeleton class="h-4 w-1/2 mx-auto" />
        <USkeleton class="h-4 w-2/3 mx-auto" />
      </div>
    </div>

    <template v-else>
      <div v-if="category?.data" class="bg-emerald-400 rounded-xl shadow-md overflow-hidden">
        <div class="p-8 pb-4">
          <h1 class="text-3xl font-bold text-black mb-4 leading-tight">{{ category.data.title }}</h1>

          <p class="text-gray-700 mb-4">Ідентифікатор: {{ category.data.id }}</p>

          <div v-if="category.data.posts?.length">
            <h2 class="text-xl font-semibold mb-2">Пости:</h2>
            <ul class="list-disc list-inside space-y-2">
              <li v-for="post in category.data.posts" :key="post.id">
                <NuxtLink :to="`/blog/posts/${post.id}`" class="text-blue-600 hover:underline">
                  {{ post.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div v-else class="text-gray-600 mt-4">
            Постів у цій категорії поки немає.
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p class="text-xl font-medium text-gray-800">Категорія не знайдена</p>
      </div>
    </template>

    <UButton
        to="/blog/categories"
        class="mt-8"
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
    >
      Назад до списку
    </UButton>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const category = ref(null)
const loading = ref(true)

const fetchCategory = async () => {
  try {
    loading.value = true
    const { data, error } = await useFetch(`/blog/categories/${route.params.id}`, {
      baseURL: config.public.apiBase,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (error.value) {
      throw createError({
        statusCode: 404,
        message: 'Категорія не знайдена'
      })
    }

    category.value = data.value
  } catch (error) {
    console.error('Помилка при завантаженні категорії:', error)
  } finally {
    loading.value = false
  }
}

fetchCategory()
</script>
