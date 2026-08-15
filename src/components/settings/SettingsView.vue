<script setup lang="ts">
import { useSettings, type Theme, type Density, type LandingPage } from '@/composables/useSettings'
import { useTheme } from '@/composables/useTheme'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const { settings, setTheme, setDensity, setLandingPage } = useSettings()
const { applyTheme } = useTheme()

function handleThemeChange(value: string) {
  setTheme(value as Theme)
  applyTheme()
}

function handleDensityChange(value: string) {
  setDensity(value as Density)
  document.documentElement.setAttribute('data-density', value)
}

function handleLandingPageChange(value: string) {
  setLandingPage(value as LandingPage)
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how SakuraRecords looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            :model-value="settings.theme"
            @update:model-value="handleThemeChange"
            class="flex flex-col gap-3"
          >
            <div class="flex items-center gap-3">
              <RadioGroupItem value="light" id="theme-light" />
              <Label for="theme-light" class="cursor-pointer">Light</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label for="theme-dark" class="cursor-pointer">Dark</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="system" id="theme-system" />
              <Label for="theme-system" class="cursor-pointer">System</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout Density</CardTitle>
          <CardDescription>Adjust spacing and padding throughout the interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            :model-value="settings.density"
            @update:model-value="handleDensityChange"
            class="flex flex-col gap-3"
          >
            <div class="flex items-center gap-3">
              <RadioGroupItem value="compact" id="density-compact" />
              <Label for="density-compact" class="cursor-pointer">Compact</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="regular" id="density-regular" />
              <Label for="density-regular" class="cursor-pointer">Regular</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="comfy" id="density-comfy" />
              <Label for="density-comfy" class="cursor-pointer">Comfy</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Choose where to go after logging in.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            :model-value="settings.landingPage"
            @update:model-value="handleLandingPageChange"
            class="flex flex-col gap-3"
          >
            <div class="flex items-center gap-3">
              <RadioGroupItem value="dashboard" id="landing-dashboard" />
              <Label for="landing-dashboard" class="cursor-pointer">Dashboard</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="purchase-order-list" id="landing-pos" />
              <Label for="landing-pos" class="cursor-pointer">Purchase Orders</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="client-list" id="landing-clients" />
              <Label for="landing-clients" class="cursor-pointer">Clients</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem value="product-list" id="landing-products" />
              <Label for="landing-products" class="cursor-pointer">Products</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
