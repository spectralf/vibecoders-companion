# Tailwind CSS Guide for Vibe Coder's Companion

This document provides an overview of the Tailwind CSS setup and conventions used in the Vibe Coder's Companion application.

## Setup

The project uses Tailwind CSS for styling, integrated with Vite and React. The setup includes:

- **Tailwind CSS**: A utility-first CSS framework
- **PostCSS**: A tool for transforming CSS with JavaScript plugins
- **Autoprefixer**: A PostCSS plugin to add vendor prefixes to CSS rules

## Configuration Files

### tailwind.config.js

The main Tailwind configuration file defines:

- Content paths for purging unused styles in production
- Custom theme extensions (colors, fonts, shadows, etc.)
- Any plugins used

### postcss.config.js

Configures PostCSS to use Tailwind CSS and Autoprefixer.

## Usage Patterns

### 1. Direct Utility Classes

The primary way to use Tailwind is by applying utility classes directly in your JSX:

```jsx
<div className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
  <h2 className="text-xl font-semibold text-gray-800">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>
```

### 2. Component Abstractions with @layer

For repeated patterns, we define component styles in `index.css` using `@layer components`:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark;
  }
}
```

Then use them in your JSX:

```jsx
<button className="btn-primary">Click Me</button>
```

### 3. Custom Base Styles

Global base styles are defined in `index.css` using `@layer base`:

```css
@layer base {
  h1 {
    @apply text-2xl font-bold mb-4;
  }
}
```

## Color System

We've defined a custom color palette in `tailwind.config.js`:

- **Primary**: Blue colors (#3498db) - Used for primary actions, links, and highlights
- **Secondary**: Dark blue/slate colors (#2c3e50) - Used for headers, footers, and secondary elements
- **Success**: Green colors (#2ecc71) - Used for success states and confirmations
- **Warning**: Orange colors (#f39c12) - Used for warnings and caution states
- **Danger**: Red colors (#e74c3c) - Used for errors and destructive actions
- **Neutral**: Grayscale colors - Used for text, backgrounds, and borders

Each color has three variants:
- `DEFAULT`: The main color
- `dark`: A darker shade for hover states
- `light`: A lighter shade for backgrounds

## Responsive Design

Tailwind's responsive prefixes should be used for responsive design:

```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Content */}
</div>
```

Common breakpoints:
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

## Best Practices

1. **Prefer utility classes** over custom CSS when possible
2. **Extract components** for repeated patterns
3. **Use the color system** consistently
4. **Build responsively** from mobile up
5. **Combine with existing CSS** during the transition period

## Transition Strategy

As we integrate Tailwind CSS:

1. New components should use Tailwind exclusively
2. Existing components can use a mix of Tailwind and existing CSS
3. Eventually, we'll migrate all styling to Tailwind

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/guides/vite)
