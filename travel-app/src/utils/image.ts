export const getImageUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path; // Already absolute (e.g. Google, Unsplash)
    
    // Backend URL from env or default
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove /api suffix if present to get base root
    const baseUrl = API_URL.replace('/api', '');
    
    return `${baseUrl}${path}`;
};

export const getDefaultAvatar = (name?: string) => {
  const initial = name?.charAt(0).toUpperCase() || 'U';
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=200&bold=true`;
}
