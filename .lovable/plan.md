
## Fix Resource Downloads

### Problem
The programmatic anchor approach with `a.download = ""` fails for cross-origin URLs (Supabase storage). The browser security model ignores the `download` attribute for URLs on different domains, so clicking does nothing useful.

### Solution
Use `fetch()` to download the file as a blob, then create an object URL that IS same-origin, which allows the `download` attribute to work properly.

### Changes

**`src/components/CardComponents.tsx`** - Update `handleDownload` in ResourceCard:
```typescript
const handleDownload = async () => {
  if (resourceId) trackDownload(resourceId);
  if (fileUrl) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback to opening in new tab
      window.open(fileUrl, "_blank", "noopener");
    }
  }
};
```

**`src/pages/Resources.tsx`** - Same fix for featured resource button (lines 141-149)

This fetches the file as a blob, creates a same-origin object URL, then triggers the download. Falls back to opening in new tab if fetch fails.
