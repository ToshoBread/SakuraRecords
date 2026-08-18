<script setup lang="ts">
import { computed } from 'vue'
import type { DateRange } from '@/composables/useReports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const modelValue = defineModel<DateRange>({ required: true })

function getCurrentQuarter(): DateRange {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  let startMonth: number
  let startYear: number

  if (month >= 11 || month <= 1) {
    startMonth = month >= 11 ? 11 : 11
    startYear = month >= 11 ? year : year - 1
  } else if (month >= 2 && month <= 4) {
    startMonth = 2
    startYear = year
  } else if (month >= 5 && month <= 7) {
    startMonth = 5
    startYear = year
  } else {
    startMonth = 8
    startYear = year
  }

  const start = new Date(startYear, startMonth, 1)
  const end = new Date(start.getFullYear(), start.getMonth() + 2 + 1, 0)
  return { start, end }
}

function getLastQuarter(): DateRange {
  const current = getCurrentQuarter()
  const start = new Date(current.start)
  start.setMonth(start.getMonth() - 3)
  const end = new Date(current.start)
  end.setDate(end.getDate() - 1)
  return { start, end }
}

function getThisYear(): DateRange {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear(), 11, 31),
  }
}

const presets = [
  { label: 'This Quarter', getRange: getCurrentQuarter },
  { label: 'Last Quarter', getRange: getLastQuarter },
  { label: 'This Year', getRange: getThisYear },
]

function applyPreset(getRange: () => DateRange) {
  modelValue.value = getRange()
}

const startStr = computed({
  get: () => modelValue.value.start.toISOString().slice(0, 10),
  set: (val: string) => {
    modelValue.value = { ...modelValue.value, start: new Date(val) }
  },
})

const endStr = computed({
  get: () => modelValue.value.end.toISOString().slice(0, 10),
  set: (val: string) => {
    modelValue.value = { ...modelValue.value, end: new Date(val) }
  },
})
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="flex gap-2">
      <Button
        v-for="preset in presets"
        :key="preset.label"
        variant="outline"
        size="sm"
        @click="applyPreset(preset.getRange)"
      >
        {{ preset.label }}
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2">
        <Label for="report-start" class="whitespace-nowrap text-sm">From</Label>
        <Input id="report-start" type="date" v-model="startStr" class="w-auto" />
      </div>
      <div class="flex items-center gap-2">
        <Label for="report-end" class="whitespace-nowrap text-sm">To</Label>
        <Input id="report-end" type="date" v-model="endStr" class="w-auto" />
      </div>
    </div>
  </div>
</template>
