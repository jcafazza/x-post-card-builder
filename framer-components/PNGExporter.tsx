/**
 * PNG Exporter Component for Framer
 *
 * This component captures a Framer frame/element and exports it as a PNG image
 *
 * HOW TO USE IN FRAMER:
 * 1. Install the html-to-image package in your Framer project:
 *    - Go to Assets panel → click "+" → search "html-to-image"
 * 2. Create a new Code Component in Framer
 * 3. Copy this code
 * 4. Add the component to your canvas as an Export Button
 * 5. Connect it to your card preview frame using the targetId prop
 */

import { useState } from "react"
import { toPng } from "html-to-image"

interface PNGExporterProps {
    // The ID or data-framer-name of the element to export
    targetId?: string
    // Button text
    label?: string
    // Button styling
    style?: React.CSSProperties
    // Filename for the exported PNG
    filename?: string
    // Callback after successful export
    onExportComplete?: () => void
    // Callback if export fails
    onExportError?: (error: Error) => void
}

export default function PNGExporter(props: PNGExporterProps) {
    const {
        targetId = "card-preview",
        label = "Download PNG",
        filename = "x-post-card.png",
        onExportComplete,
        onExportError,
    } = props

    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleExport = async () => {
        setIsExporting(true)
        setError(null)

        try {
            // Find the target element
            let targetElement = document.getElementById(targetId)

            // If not found by ID, try finding by data-framer-name
            if (!targetElement) {
                targetElement = document.querySelector(
                    `[data-framer-name="${targetId}"]`
                )
            }

            if (!targetElement) {
                throw new Error(
                    `Could not find element with ID or name "${targetId}"`
                )
            }

            // Convert to PNG with high quality
            const dataUrl = await toPng(targetElement, {
                quality: 1.0,
                pixelRatio: 2, // 2x for retina displays
                backgroundColor: "#ffffff",
            })

            // Create download link
            const link = document.createElement("a")
            link.download = filename
            link.href = dataUrl
            link.click()

            // Success callback
            if (onExportComplete) {
                onExportComplete()
            }
        } catch (err) {
            const errorMessage = err.message || "Failed to export PNG"
            setError(errorMessage)
            console.error("PNG Export Error:", err)

            if (onExportError) {
                onExportError(err)
            }
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div style={{ display: "inline-block" }}>
            <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: 600,
                    backgroundColor: isExporting ? "#cccccc" : "#1DA1F2",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isExporting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    ...props.style,
                }}
            >
                {isExporting ? "Exporting..." : label}
            </button>
            {error && (
                <div
                    style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#fee",
                        color: "#c00",
                        borderRadius: "4px",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    )
}

/**
 * ALTERNATIVE: Export function for use in overrides
 *
 * If you prefer to trigger export from a Framer override instead of a component:
 */

export async function exportElementToPNG(
    elementIdOrName: string,
    filename: string = "x-post-card.png"
): Promise<void> {
    try {
        // Find the target element
        let targetElement = document.getElementById(elementIdOrName)

        if (!targetElement) {
            targetElement = document.querySelector(
                `[data-framer-name="${elementIdOrName}"]`
            )
        }

        if (!targetElement) {
            throw new Error(
                `Could not find element with ID or name "${elementIdOrName}"`
            )
        }

        // Convert to PNG
        const dataUrl = await toPng(targetElement, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
        })

        // Download
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        link.click()
    } catch (error) {
        console.error("PNG Export Error:", error)
        throw error
    }
}

/**
 * USAGE IN FRAMER:
 *
 * OPTION 1: Use as a Component
 * - Drag the PNGExporter component onto your canvas
 * - Set props:
 *   - targetId: "card-preview" (the ID of your card frame)
 *   - label: "Download PNG"
 *   - filename: "my-x-card.png"
 *
 * OPTION 2: Use as an Override
 * ```tsx
 * import { exportElementToPNG } from "./PNGExporter"
 *
 * export function ExportButton(Component): ComponentType {
 *     return (props) => {
 *         const handleClick = async () => {
 *             try {
 *                 await exportElementToPNG("card-preview", "x-post-card.png")
 *                 alert("Exported successfully!")
 *             } catch (error) {
 *                 alert("Export failed: " + error.message)
 *             }
 *         }
 *
 *         return <Component {...props} onClick={handleClick} />
 *     }
 * }
 * ```
 *
 * IMPORTANT: Make sure your card preview frame has:
 * - An ID set in the frame properties, OR
 * - A data-framer-name attribute
 *
 * In Framer, you can set this by:
 * 1. Select your card frame
 * 2. In the properties panel, set the frame name (e.g., "card-preview")
 * 3. The exporter will find it automatically
 */

/**
 * ADVANCED: Custom export options
 */

export interface ExportOptions {
    elementIdOrName: string
    filename?: string
    quality?: number
    pixelRatio?: number
    backgroundColor?: string
    width?: number
    height?: number
}

export async function exportWithOptions(
    options: ExportOptions
): Promise<void> {
    const {
        elementIdOrName,
        filename = "export.png",
        quality = 1.0,
        pixelRatio = 2,
        backgroundColor = "#ffffff",
        width,
        height,
    } = options

    try {
        let targetElement = document.getElementById(elementIdOrName)

        if (!targetElement) {
            targetElement = document.querySelector(
                `[data-framer-name="${elementIdOrName}"]`
            )
        }

        if (!targetElement) {
            throw new Error(
                `Could not find element with ID or name "${elementIdOrName}"`
            )
        }

        const dataUrl = await toPng(targetElement, {
            quality,
            pixelRatio,
            backgroundColor,
            width,
            height,
        })

        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        link.click()
    } catch (error) {
        console.error("PNG Export Error:", error)
        throw error
    }
}
