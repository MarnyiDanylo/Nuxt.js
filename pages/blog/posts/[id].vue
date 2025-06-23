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
      <div v-if="post?.data" class="bg-rose-400 rounded-xl shadow-md overflow-hidden">
        <div class="p-8 pb-4">
          <h1 class="text-3xl font-bold text-black mb-4 leading-tight">{{ post.data.title }}</h1>

          <div class="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
            <div class="flex items-center">
              <UIcon name="i-heroicons-user" class="mr-2 text-primary-500" />
              <span>{{ post.data.user?.name || 'Невідомо' }}</span>
            </div>

            <div class="flex items-center">
              <UIcon name="i-heroicons-tag" class="mr-2 text-primary-500" />
              <span>{{ post.data.category?.title || 'Без категорії' }}</span>
            </div>

            <div class="flex items-center">
              <UIcon name="i-heroicons-calendar" class="mr-2 text-primary-500" />
              <span>{{ formatDate(post.data.published_at) }}</span>
            </div>
          </div>
        </div>

        <div class="px-8 pb-8 prose max-w-none
                  prose-headings:text-gray-800
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary-500 prose-blockquote:text-gray-600
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-img:rounded-lg prose-img:shadow-md">
          <div v-html="post.data.content_raw"></div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p class="text-xl font-medium text-gray-800">Статтю не знайдено</p>
        <p class="text-gray-600 mt-2">На жаль, ми не змогли знайти запрошену статтю</p>
      </div>
    </template>

    <UButton
        to="/blog/posts"
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
const post = ref(null)
const loading = ref(true)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const fetchPost = async () => {
  try {
    loading.value = true
    const { data, error } = await useFetch(`/blog/posts/${route.params.id}`, {
      baseURL: config.public.apiBase,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (error.value) {
      throw createError({
        statusCode: 404,
        message: 'Статтю не знайдено'
      })
    }

    post.value = data.value
  } catch (error) {
    console.error('Помилка при завантаженні статті:', error)
  } finally {
    loading.value = false
  }
}

fetchPost()
</script>