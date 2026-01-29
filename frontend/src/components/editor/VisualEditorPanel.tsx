/**
 * VisualEditorPanel - Panel for editing selected elements
 */
'use client'

import { useState, useEffect } from 'react'
import { Paintbrush, Type, Hash, ToggleLeft, Image, Layout, X, Check } from 'lucide-react'
import type { EditableField, SelectedElement } from '@/lib/component-annotator'

interface VisualEditorPanelProps {
    selectedElement: SelectedElement | null
    onUpdate: (field: string, value: any) => void
    onApplyChanges: () => void
    onClose: () => void
    className?: string
}

const FieldIcon = ({ type }: { type: EditableField['type'] }) => {
    switch (type) {
        case 'text': return <Type className="w-4 h-4" />
        case 'color': return <Paintbrush className="w-4 h-4" />
        case 'number': return <Hash className="w-4 h-4" />
        case 'boolean': return <ToggleLeft className="w-4 h-4" />
        case 'image': return <Image className="w-4 h-4" />
        default: return <Layout className="w-4 h-4" />
    }
}

export const VisualEditorPanel = ({
    selectedElement,
    onUpdate,
    onApplyChanges,
    onClose,
    className = ''
}: VisualEditorPanelProps) => {
    const [localValues, setLocalValues] = useState<Record<string, any>>({})
    const [hasChanges, setHasChanges] = useState(false)

    // Reset local values when element changes
    useEffect(() => {
        if (selectedElement) {
            const values: Record<string, any> = {}
            selectedElement.editableFields.forEach(field => {
                values[field.name] = field.value
            })
            setLocalValues(values)
            setHasChanges(false)
        }
    }, [selectedElement])

    const handleChange = (fieldName: string, value: any) => {
        setLocalValues(prev => ({ ...prev, [fieldName]: value }))
        setHasChanges(true)
        onUpdate(fieldName, value)
    }

    const handleApply = () => {
        onApplyChanges()
        setHasChanges(false)
    }

    if (!selectedElement) {
        return (
            <div className={`p-6 text-center bg-white ${className}`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Layout className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-700 mb-2">No Element Selected</h3>
                <p className="text-sm text-gray-500">
                    Click on an element in the preview to edit its properties
                </p>
            </div>
        )
    }

    const componentName = selectedElement.componentPath.split('/').pop()?.split(':')[0] || 'Component'

    return (
        <div className={`flex flex-col h-full bg-white ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                    <h3 className="font-semibold text-gray-900">{componentName}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {selectedElement.componentPath}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedElement.editableFields.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No editable fields for this component
                    </p>
                ) : (
                    selectedElement.editableFields.map(field => (
                        <div key={field.name} className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FieldIcon type={field.type} />
                                {field.name}
                            </label>

                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    value={localValues[field.name] ?? ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder={`Enter ${field.name}...`}
                                />
                            )}

                            {field.type === 'color' && (
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={localValues[field.name] ?? '#000000'}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={localValues[field.name] ?? ''}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="#000000"
                                    />
                                </div>
                            )}

                            {field.type === 'number' && (
                                <input
                                    type="number"
                                    value={localValues[field.name] ?? 0}
                                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                                    min={field.min}
                                    max={field.max}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}

                            {field.type === 'boolean' && (
                                <button
                                    onClick={() => handleChange(field.name, !localValues[field.name])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localValues[field.name] ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localValues[field.name] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            )}

                            {field.type === 'select' && field.options && (
                                <select
                                    value={localValues[field.name] ?? ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {field.options.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer - Apply Button */}
            {hasChanges && (
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={handleApply}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
              bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Apply Changes
                    </button>
                </div>
            )}
        </div>
    )
}

export default VisualEditorPanel
