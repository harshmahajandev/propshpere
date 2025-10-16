# UI Components Guide

## Design System

### Color Palette
- **Primary**: #6366f1 (Indigo)
- **Background**: #fafafa (Clean White)
- **Surface**: #ffffff (White)
- **Text**: #374151 (Gray-700)
- **Secondary Text**: #6b7280 (Gray-500)

### Typography
- **Headings**: Material Design 3 typography
- **Body**: 14px, line-height 1.5
- **Labels**: 13px, font-weight 600

## Components

### Cards
- **Material Cards**: Clean white background
- **Subtle shadows**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Rounded corners**: 8px border-radius
- **No hover movement**: Static positioning

### Buttons
- **Primary**: Indigo background, white text
- **Secondary**: White background, indigo text
- **Icon Buttons**: Circular, 40px size
- **Toggle Buttons**: Grouped, clear labels

### Form Fields
- **Material Design**: Outline appearance
- **Hints**: Below fields for guidance
- **Validation**: Real-time feedback
- **Icons**: Prefix and suffix support

### Navigation
- **Sidebar**: Collapsible, role-based
- **Header**: Clean, minimal design
- **Breadcrumbs**: Context navigation
- **User Menu**: Top-right corner

## Layout Patterns

### Page Structure
```
Header
├── Page Title
├── Description
└── Actions

Filters Card
├── Search Field
├── Filter Dropdowns
└── View Toggle

Content Area
├── Statistics Cards (if applicable)
└── Data Grid/List
```

### Responsive Design
- **Desktop**: Full sidebar, multi-column layout
- **Tablet**: Collapsible sidebar, adjusted columns
- **Mobile**: Hidden sidebar, single column

## Interactive Elements

### Drag & Drop
- **Visual Feedback**: Dragging state
- **Drop Zones**: Highlighted areas
- **Animations**: Smooth transitions

### Search & Filter
- **Real-time**: Instant results
- **Clear Filters**: Reset functionality
- **Persistence**: Maintain state

### View Modes
- **Toggle**: Clear visual distinction
- **Icons**: Grid and list representations
- **State**: Active/inactive styling

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical flow
- **Focus States**: Clear indicators
- **Shortcuts**: Common actions

### Screen Readers
- **Labels**: Descriptive text
- **ARIA**: Proper attributes
- **Semantic HTML**: Correct structure

### Color Contrast
- **WCAG AA**: Compliant ratios
- **High Contrast**: Clear distinction
- **Color Blind**: Not color-dependent

## Best Practices

### Consistency
- Use standard component patterns
- Maintain consistent spacing
- Follow Material Design guidelines

### Performance
- Lazy load components
- Optimize images
- Minimize bundle size

### User Experience
- Clear visual hierarchy
- Intuitive interactions
- Helpful error messages
