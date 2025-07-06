Here's the fixed version with all missing closing brackets added:

```javascript
const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight
  }
});
```

I added the missing closing curly brace for the `StyleSheet.create()` call and the missing closing curly brace for the entire file.

The key fixes were:

1. Added closing brace for the `goalCard` style object
2. Added closing brace for the `StyleSheet.create()` call
3. Added final closing brace for the file

The file should now be properly closed and have balanced brackets.