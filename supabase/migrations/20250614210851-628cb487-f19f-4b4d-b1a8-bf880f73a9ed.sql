
-- Adicionar a coluna can_edit_own_appointments na tabela employee_permissions
ALTER TABLE public.employee_permissions 
ADD COLUMN can_edit_own_appointments boolean NOT NULL DEFAULT false;
