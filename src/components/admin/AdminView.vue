<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-vue-next'

interface User {
  id: string
  email: string
  role: string
  created_at: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')

const showResetSheet = ref(false)
const selectedUser = ref<User | null>(null)
const newPassword = ref('')
const resetting = ref(false)

const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const res = await fetch(fnUrl, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    users.value = data.users
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openResetSheet(user: User) {
  selectedUser.value = user
  newPassword.value = ''
  showResetSheet.value = true
}

async function handleResetPassword() {
  if (!selectedUser.value || !newPassword.value) return
  resetting.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: selectedUser.value.id,
        new_password: newPassword.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    toast.success(`Password changed for ${selectedUser.value.email}`)
    showResetSheet.value = false
    selectedUser.value = null
    newPassword.value = ''
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    resetting.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(fetchUsers)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Admin</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div v-if="loading" class="p-4">
          <Skeleton v-for="i in 3" :key="i" class="h-12 w-full mb-2" />
        </div>

        <div v-else-if="error" class="p-4 text-sm text-destructive">{{ error }}</div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead class="text-right">Created</TableHead>
              <TableHead class="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell class="font-medium">{{ user.email }}</TableCell>
              <TableCell>
                <Badge variant="secondary" class="text-xs">
                  <Shield class="mr-1 size-3" />
                  {{ user.role === 'admin' ? 'Admin' : 'Operator' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatDate(user.created_at) }}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="openResetSheet(user)"
                >
                  Change Password
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Sheet v-model:open="showResetSheet">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Change Password</SheetTitle>
          <SheetDescription>
            Set a new password for {{ selectedUser?.email }}.
          </SheetDescription>
        </SheetHeader>

        <form @submit.prevent="handleResetPassword" class="flex flex-col gap-4 px-6 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel for="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                v-model="newPassword"
                required
                minlength="6"
                placeholder="At least 6 characters"
                :disabled="resetting"
              />
            </Field>
          </FieldGroup>

          <SheetFooter>
            <Button type="button" variant="outline" @click="showResetSheet = false" :disabled="resetting">
              Cancel
            </Button>
            <Button type="submit" :disabled="resetting || newPassword.length < 6">
              {{ resetting ? 'Saving...' : 'Change Password' }}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  </div>
</template>
