/**
 * Component Annotator - Utilities for Visual Editor
 */

export interface ComponentMetadata {
  path: string      // e.g., "components/dashboard/MetricCard.tsx"
  line: number      // Line where component starts
  props?: string[]  // Editable props
  editableFields?: EditableField[]
}

export interface EditableField {
  name: string
  type: 'text' | 'color' | 'number' | 'select' | 'boolean' | 'image'
  value: unknown
  options?: unknown[]   // For select fields
  min?: number      // For number fields
  max?: number      // For number fields
}

export interface SelectedElement {
  componentPath: string
  editableFields: EditableField[]
}

/**
 * Get data attributes for component annotation
 */
export function getMetadataAttrs(metadata: ComponentMetadata): Record<string, string> {
  return {
    'data-component-path': `${metadata.path}:${metadata.line}`,
    'data-component-props': JSON.stringify(metadata.props || []),
    'data-editable-fields': JSON.stringify(metadata.editableFields || [])
  }
}

/**
 * Parse component path from data attribute
 */
export function parseComponentPath(path: string): { file: string; line: number } | null {
  const parts = path.split(':')
  if (parts.length < 2) return null

  const line = parseInt(parts.pop() || '0', 10)
  const file = parts.join(':')

  return { file, line }
}

/**
 * Extract editable fields from element
 */
export function extractEditableFields(element: HTMLElement): EditableField[] {
  try {
    const fieldsJson = element.dataset?.editableFields
    if (!fieldsJson) return []
    return JSON.parse(fieldsJson)
  } catch {
    return []
  }
}

/**
 * Component Template for agents to generate annotated components
 */
export const COMPONENT_TEMPLATE = `
// Example of an annotated component for Visual Editor
import { getMetadataAttrs } from '@/lib/component-annotator'

interface MetricCardProps {
  title: string
  value: number | string
}

const metadata = {
  path: 'components/dashboard/MetricCard.tsx',
  line: 10,
  props: ['title', 'value'],
  editableFields: [
    { name: 'title', type: 'text', value: '' },
    { name: 'value', type: 'number', value: 0 }
  ]
}

export const MetricCard = ({ title, value }: MetricCardProps) => {
  return (
    <div {...getMetadataAttrs(metadata)} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default MetricCard
`
