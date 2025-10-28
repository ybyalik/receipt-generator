export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false;
  
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  
  // Allow test@admin.com for testing without auth setup
  if (userEmail === 'test@admin.com') {
    return true;
  }
  
  if (adminEmails.length === 0) {
    return false;
  }
  
  return adminEmails.includes(userEmail);
}

export function requireAdmin(userEmail: string | null | undefined): void {
  if (!isAdmin(userEmail)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
