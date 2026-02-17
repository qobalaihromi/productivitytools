import { createClient } from 'app/lib/supabase/client'

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  status: 'active' | 'completed' | 'archived'
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export type CreateProjectInput = {
  name: string
  description?: string
  color?: string
  start_date?: string
  end_date?: string
}

export type UpdateProjectInput = Partial<CreateProjectInput> & {
  status?: 'active' | 'completed' | 'archived'
}

export async function getProjects() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Project
}

export async function createProject(input: CreateProjectInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
