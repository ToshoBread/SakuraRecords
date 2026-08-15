<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-vue-next'

const router = useRouter()
const { user, role, isAdmin, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}

function initials() {
  return user.value?.email?.charAt(0).toUpperCase() ?? '?'
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="rounded-full">
        <Avatar class="size-8">
          <AvatarFallback>{{ initials() }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel class="flex flex-col gap-1">
        <span class="text-sm">{{ user?.email }}</span>
        <Badge variant="secondary" class="w-fit text-xs">
          {{ role === 'admin' ? 'Admin' : 'Operator' }}
        </Badge>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="isAdmin" as-child>
        <RouterLink :to="{ name: 'settings' }">Settings</RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleLogout" class="text-destructive">
        <LogOut class="mr-2 size-4" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
