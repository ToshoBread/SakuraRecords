<script setup lang="ts">
import { watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { toast } from 'vue-sonner'

const { needRefresh, updateSW } = useRegisterSW()

watch(needRefresh, (value) => {
  if (value) {
    toast.info('New version available', {
      description: 'Reload to get the latest updates.',
      closeButton: false,
      action: {
        label: 'Update',
        onClick: () => updateSW(),
      },
      duration: Infinity,
    })
  }
})
</script>

<template></template>
