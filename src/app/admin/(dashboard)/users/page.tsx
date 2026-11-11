"use client"

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calendar, RefreshCw, Shield, User as UserIcon, Loader2 } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || `Request failed (${response.status})`)
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load system users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading system users...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">System Users</h1>
          <p className="text-muted-foreground mt-2 text-base">Manage administrative access and track system activity.</p>
        </div>
        <Badge variant="outline" className={`px-4 py-1.5 rounded-full bg-background border-primary/20 font-semibold ${error ? 'border-destructive/30 text-destructive' : 'text-primary'}`}>
          {error ? 'Unavailable' : `${users.length} ${users.length === 1 ? 'User' : 'Users'} Active`}
        </Badge>
      </div>

      {error && (
        <div className="py-16 text-center space-y-4 bg-secondary/20 rounded-[2.5rem] border-2 border-dashed border-destructive/30">
          <AlertTriangle className="h-12 w-12 text-destructive/60 mx-auto" />
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">Couldn&apos;t load users</p>
            <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          </div>
          <Button onClick={fetchUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      )}

      {!error && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length > 0 ? (
          users.map(user => (
            <Card key={user.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-card transition-all hover:shadow-md hover:ring-1 hover:ring-primary/10">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Avatar className="h-14 w-14 border-2 border-primary/10 ring-2 ring-background">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
                    {user.email ? user.email[0].toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold truncate text-foreground">{user.email}</CardTitle>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold mt-1 tracking-wider">
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 gap-3 py-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-2xl">
                    <Calendar className="h-4 w-4 text-primary/60" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground/70">Joined System</span>
                      <span className="font-medium text-foreground">{new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-2xl">
                    <Shield className="h-4 w-4 text-primary/60" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground/70">Last Activity</span>
                      <span className="font-medium text-foreground">
                        {user.last_login ? new Date(user.last_login).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 bg-secondary/20 rounded-[2.5rem] border-2 border-dashed border-muted">
            <UserIcon className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">No users found</p>
              <p className="text-muted-foreground">The system couldn&apos;t retrieve any administrative users.</p>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
