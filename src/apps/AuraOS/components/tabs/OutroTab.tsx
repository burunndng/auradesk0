"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { feature } from "topojson-client"
import Button from "../shared/Button"

interface GeoFeature {
  type: string
  geometry: any
  properties: any
}

// Uses gnomonic-like projection with spherical bulging effect
function tetrahedralRaw(lambda: number, phi: number): [number, number] {
  // Convert to radians
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  const cosLambda = Math.cos(lambda)
  const sinLambda = Math.sin(lambda)

  // Gnomonic-style projection with spherical distortion for bulging effect
  const cosc = sinPhi * Math.sin(Math.PI / 6) + cosPhi * Math.cos(Math.PI / 6) * cosLambda

  // Add spherical bulging factor
  const bulge = 1 + 0.3 * (1 - Math.abs(cosc))

  if (cosc <= 0) {
    // Point is on the back side, use orthographic fallback
    const x = cosPhi * sinLambda
    const y = cosPhi * cosLambda * Math.sin(Math.PI / 6) - sinPhi * Math.cos(Math.PI / 6)
    return [x * 0.8, -y * 0.8]
  }

  const k = bulge / cosc
  const x = k * cosPhi * sinLambda
  const y = k * (cosPhi * cosLambda * Math.sin(Math.PI / 6) - sinPhi * Math.cos(Math.PI / 6))

  // Clamp to prevent extreme values
  const maxVal = 3
  return [Math.max(-maxVal, Math.min(maxVal, x)), Math.max(-maxVal, Math.min(maxVal, -y))]
}

tetrahedralRaw.invert = (x: number, y: number): [number, number] => {
  const rho = Math.sqrt(x * x + y * y)
  const c = Math.atan(rho)
  const sinc = Math.sin(c)
  const cosc = Math.cos(c)

  const phi = Math.asin(cosc * Math.sin(Math.PI / 6) + (y * sinc * Math.cos(Math.PI / 6)) / rho)
  const lambda = Math.atan2(x * sinc, rho * Math.cos(Math.PI / 6) * cosc - y * Math.sin(Math.PI / 6) * sinc)

  return [lambda, phi]
}

function interpolateProjection(raw0: any, raw1: any) {
  const mutate: any = d3.geoProjectionMutator((t: number) => (x: number, y: number) => {
    const [x0, y0] = raw0(x, y)
    const [x1, y1] = raw1(x, y)
    return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)]
  })
  let t = 0
  return Object.assign((mutate as any)(t), {
    alpha(_: number) {
      return arguments.length ? (mutate as any)((t = +_)) : t
    },
  })
}

function getTetrahedronGeometry(cx: number, cy: number, radius: number, rotation: number[]) {
  // Regular tetrahedron vertices projected to 2D with rotation
  const vertices3D = [
    [0, 1, 0], // top
    [0.943, -0.333, 0], // front-right
    [-0.471, -0.333, 0.816], // back-left
    [-0.471, -0.333, -0.816], // back-right
  ]

  // Apply rotation
  const rotX = (rotation[1] * Math.PI) / 180
  const rotY = (rotation[0] * Math.PI) / 180

  const rotatedVertices = vertices3D.map(([x, y, z]) => {
    // Rotate around Y axis
    const x1 = x * Math.cos(rotY) + z * Math.sin(rotY)
    const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY)
    // Rotate around X axis
    const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)
    return [x1, y1, z2]
  })

  // Project to 2D with perspective
  const projected = rotatedVertices.map(([x, y, z]) => {
    const perspective = 2 / (2 - z * 0.5)
    return [
      cx + x * radius * perspective,
      cy - y * radius * perspective,
      z, // keep z for depth sorting
    ]
  })

  // Edges of tetrahedron
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3], // from top
    [1, 2],
    [2, 3],
    [3, 1], // base triangle
  ]

  // Faces for curved surface rendering
  const faces = [
    [0, 1, 2], // front-left face
    [0, 2, 3], // back face
    [0, 3, 1], // front-right face
    [1, 3, 2], // bottom face
  ]

  return { vertices: projected, edges, faces }
}

function getCurvedEdgePath(p1: number[], p2: number[], cx: number, cy: number, bulgeAmount: number) {
  const midX = (p1[0] + p2[0]) / 2
  const midY = (p1[1] + p2[1]) / 2

  // Direction from center to midpoint
  const dx = midX - cx
  const dy = midY - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Control point pushed outward for bulge
  const bulge = bulgeAmount * 0.4
  const ctrlX = midX + (dx / dist) * bulge
  const ctrlY = midY + (dy / dist) * bulge

  return `M ${p1[0]} ${p1[1]} Q ${ctrlX} ${ctrlY} ${p2[0]} ${p2[1]}`
}

export function GlobeToMapTransform() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState([0])
  const [worldData, setWorldData] = useState<GeoFeature[]>([])
  const [rotation, setRotation] = useState([0, 0])
  const [translation, setTranslation] = useState([0, 0])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState([0, 0])

  const width = 800
  const height = 500

  // Load world data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        const world: any = await response.json()
        const countries = feature(world, world.objects.countries).features
        setWorldData(countries)
      } catch (error) {
        const fallbackData = [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-180, -90],
                  [180, -90],
                  [180, 90],
                  [-180, 90],
                  [-180, -90],
                ],
              ],
            },
            properties: {},
          },
        ]
        setWorldData(fallbackData)
      }
    }

    loadWorldData()
  }, [])

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true)
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      setLastMouse([event.clientX - rect.left, event.clientY - rect.top])
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const currentMouse = [event.clientX - rect.left, event.clientY - rect.top]
    const dx = currentMouse[0] - lastMouse[0]
    const dy = currentMouse[1] - lastMouse[1]

    const t = progress[0] / 100

    if (t < 0.5) {
      const sensitivity = 0.5
      setRotation((prev) => [prev[0] + dx * sensitivity, Math.max(-90, Math.min(90, prev[1] - dy * sensitivity))])
    } else {
      const sensitivityMap = 0.25
      setRotation((prev) => [prev[0] + dx * sensitivityMap, Math.max(-90, Math.min(90, prev[1] - dy * sensitivityMap))])
    }

    setLastMouse(currentMouse)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!svgRef.current || worldData.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const t = progress[0] / 100
    const alpha = Math.pow(t, 0.5)

    const scale = d3.scaleLinear().domain([0, 1]).range([160, 120])
    const baseRotate = d3.scaleLinear().domain([0, 1]).range([0, 0])

    const projection = interpolateProjection(tetrahedralRaw, d3.geoEquirectangularRaw)
      .scale(scale(alpha))
      .translate([width / 2 + translation[0], height / 2 + translation[1]])
      .rotate([baseRotate(alpha) + rotation[0], rotation[1]])
      .precision(0.1)

    projection.alpha(alpha)

    const path = d3.geoPath(projection)

    // Add graticule
    try {
      const graticule = d3.geoGraticule()
      const graticulePath = path(graticule())
      if (graticulePath) {
        svg
          .append("path")
          .datum(graticule())
          .attr("d", graticulePath)
          .attr("fill", "none")
          .attr("stroke", "#cccccc")
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.15)
      }
    } catch (error) { }

    // Add countries
    svg
      .selectAll(".country")
      .data(worldData)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", (d) => {
        try {
          const pathString = path(d as any)
          if (!pathString) return ""
          if (typeof pathString === "string" && (pathString.includes("NaN") || pathString.includes("Infinity"))) {
            return ""
          }
          return pathString
        } catch (error) {
          return ""
        }
      })
      .attr("fill", "none")
      .attr("stroke", "#cccccc")
      .attr("stroke-width", 1.0)
      .attr("opacity", 1.0)
      .style("visibility", function () {
        const pathData = d3.select(this).attr("d")
        return pathData && pathData.length > 0 && !pathData.includes("NaN") ? "visible" : "hidden"
      })

    const tetraOpacity = 1 - alpha // Fade out as we transition to map
    if (tetraOpacity > 0.01) {
      const tetraRadius = scale(0) * 1.1
      const { vertices, edges, faces } = getTetrahedronGeometry(
        width / 2 + translation[0],
        height / 2 + translation[1],
        tetraRadius,
        rotation,
      )

      // Sort faces by z-depth for proper rendering
      const sortedFaceIndices = faces
        .map((face, i) => ({
          face,
          index: i,
          avgZ: (vertices[face[0]][2] + vertices[face[1]][2] + vertices[face[2]][2]) / 3,
        }))
        .sort((a, b) => a.avgZ - b.avgZ)

      // Draw curved edges with bulge
      const bulgeAmount = tetraRadius * (1 - alpha * 0.8)

      edges.forEach(([i, j]) => {
        const p1 = vertices[i]
        const p2 = vertices[j]

        // Calculate edge visibility based on average z of connected vertices
        const avgZ = (p1[2] + p2[2]) / 2
        const edgeOpacity = tetraOpacity * (0.5 + avgZ * 0.3)

        if (edgeOpacity > 0.05) {
          const curvedPath = getCurvedEdgePath(
            p1,
            p2,
            width / 2 + translation[0],
            height / 2 + translation[1],
            bulgeAmount,
          )

          svg
            .append("path")
            .attr("d", curvedPath)
            .attr("fill", "none")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .attr("opacity", Math.max(0, Math.min(1, edgeOpacity)))
        }
      })

      // Draw vertices as small circles
      vertices.forEach((v, i) => {
        const vertexOpacity = tetraOpacity * (0.6 + v[2] * 0.3)
        if (vertexOpacity > 0.1) {
          svg
            .append("circle")
            .attr("cx", v[0])
            .attr("cy", v[1])
            .attr("r", 4)
            .attr("fill", "#ffffff")
            .attr("opacity", Math.max(0, Math.min(1, vertexOpacity)))
        }
      })
    }

    // Draw outline - morphs from tetrahedron silhouette to rectangle
    if (alpha > 0.5) {
      try {
        const sphereOutline = path({ type: "Sphere" })
        if (sphereOutline) {
          svg
            .append("path")
            .datum({ type: "Sphere" })
            .attr("d", sphereOutline)
            .attr("fill", "none")
            .attr("stroke", "#333333")
            .attr("stroke-width", 1)
            .attr("opacity", alpha)
        }
      } catch (error) { }
    }
  }, [worldData, progress, rotation, translation])

  const handleAnimate = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const startProgress = progress[0]
    const endProgress = startProgress === 0 ? 100 : 0
    const duration = 2000

    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const currentProgress = startProgress + (endProgress - startProgress) * eased

      setProgress([currentProgress])

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animate()
  }

  const handleReset = () => {
    setRotation([0, 0])
    setTranslation([0, 0])
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full border rounded-lg bg-transparent border-neutral-800 cursor-grab active:cursor-grabbing"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <Button onClick={handleAnimate} disabled={isAnimating} className="cursor-pointer min-w-[120px] rounded" variant="primary">
          {isAnimating ? "Animating..." : progress[0] === 0 ? "Unroll Shape" : "Roll to Shape"}
        </Button>
        <Button
          onClick={handleReset}
          variant="ghost"
          className="cursor-pointer min-w-[80px] text-white border-white/20 hover:bg-white/10 bg-transparent rounded"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

export default function OutroTab() {
  return (
    <div className="min-h-[100dvh] bg-stone-950">
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-teal-900/5 via-stone-950/0 to-stone-950/0 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-8 lg:py-12 pb-32">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-yellow-300 shadow-lg shadow-yellow-500/50" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Closing Reflection</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 mb-4">
            The Outro
          </h1>

          <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
            An interactive meditation on geometric transformation and the unfolding of consciousness—
            from sphere to surface, from depth to breadth.
          </p>
        </header>

        {/* Visualization Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800">
              <span className="text-teal-400 text-base">⬢</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-200 tracking-wide">Globe to Map Transformation</h2>
              <p className="text-xs text-stone-600">Drag to rotate · Click "Unroll Shape" to transform</p>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800/80 rounded-xl overflow-hidden backdrop-blur-sm hover:border-stone-700/80 transition-colors">
            <GlobeToMapTransform />
          </div>

          <p className="text-sm text-stone-600 mt-4 text-center leading-relaxed max-w-xl mx-auto">
            This represents the journey from three-dimensional depth to two-dimensional comprehension—
            a metaphor for the integral project of making the implicit explicit.
          </p>
        </section>

        {/* Footer ornament */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <div className="flex items-center gap-2 text-stone-700">
            <span className="text-[10px] uppercase tracking-[0.2em]">Form</span>
            <span className="text-stone-800">→</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Surface</span>
            <span className="text-stone-800">→</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Integration</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>
      </div>
    </div>
  );
}
