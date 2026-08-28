import * as THREE from 'three'
import Project from './Project'
import gsap from 'gsap'

export default class ProjectsSection {
    constructor(_options) {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y
        this.savedProjects = _options.savedProjects

        // Debug
        if (this.debug) {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.interDistance = 24
        this.positionRandomess = 5
        this.projectHalfWidth = 9

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Add all project from the list
        for (const _options of this.list) {
            this.add(_options)
        }
    }

    setGeometries() {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneGeometry(16, 8)
    }

    setMeshes() {
        this.meshes = {}

        // Area label texture: "OPEN ↗" cleanly centered as one group
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 128
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 58px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('OPEN ↗', canvas.width * 0.5, canvas.height * 0.5)

        const areaOpenTexture = new THREE.CanvasTexture(canvas)
        areaOpenTexture.magFilter = THREE.LinearFilter
        areaOpenTexture.minFilter = THREE.LinearMipmapLinearFilter

        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        this.meshes.areaLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 0.6),
            new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: areaOpenTexture })
        )
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    setList() {
        this.list = [
            {
                name: 'Adcoop Web Design',
                floorData:
                {
                    category: 'Web Design • Community Retail',
                    title: 'ADCOOP',
                    description: 'Designing for Communities, Culture & Convenience',
                    details: [
                        'Designed a scalable digital experience that simplifies complex workflows and makes collaboration more intuitive.',
                        'Focused on creating a clean, efficient interface with strong information hierarchy and seamless user journeys.',
                        'Balanced business goals with user needs to deliver a product that feels simple, purposeful, and easy to use.'
                    ]
                },
                imageSources:
                    [
                        './models/projects/adcoop/slideA.webp',
                        './models/projects/adcoop/slideB.png',
                        './models/projects/adcoop/slideC.png',
                        './models/projects/adcoop/slideD.png'
                    ],
                link:
                {
                    href: 'https://www.behance.net/gallery/246296419/Adcoop-(Food-Retail)',
                    x: - 4.8,
                    y: - 2.6,
                    halfExtents:
                    {
                        x: 2.8,
                        y: 0.95
                    }
                },
                distinctions: []
            },
            {
                name: 'Kalam Game',
                floorData:
                {
                    category: 'Game Design • Interactive Learning',
                    title: 'KALAM GAME',
                    description: 'Playful Arabic Learning Through Meaning & Emotion',
                    details: 'Playful learning mechanics, tactile UI feedback & emotional engagement'
                },
                imageSources:
                    [
                        './models/projects/kalamGame/slideA.png',
                        './models/projects/kalamGame/slideB.png',
                        './models/projects/kalamGame/slideC.png',
                        './models/projects/kalamGame/slideD.png'
                    ],
                link:
                {
                    href: 'https://www.behance.net/gallery/246523763/Kalam-Game',
                    x: - 4.8,
                    y: - 2.6,
                    halfExtents:
                    {
                        x: 2.8,
                        y: 0.95
                    }
                },
                distinctions: []
            },
            {
                name: 'SERH Website',
                floorData:
                {
                    category: 'Web Design • Infrastructure & Enterprise',
                    title: 'SERH GROUP',
                    description: 'Designing for Industry, Infrastructure & Innovation',
                    details: 'Enterprise brand authority, scalable architecture & industrial aesthetics'
                },
                imageSources:
                    [
                        './models/projects/serh/slideA.jpg',
                        './models/projects/serh/slideB.jpg',
                        './models/projects/serh/slideC.jpg'
                    ],
                link:
                {
                    href: 'https://www.behance.net/gallery/246524943/Serh-Group-Website',
                    x: - 4.8,
                    y: - 2.6,
                    halfExtents:
                    {
                        x: 2.8,
                        y: 0.95
                    }
                },
                distinctions: []
            },
            {
                name: 'Coming Soon',
                floorData:
                {
                    category: 'Confidential • In Active Development',
                    title: 'COMING SOON',
                    description: 'One of my largest ongoing confidential design projects',
                    details: 'Full product ecosystem — Case study dropping shortly'
                },
                imageSources:
                    [
                        './models/projects/comingSoon/slideA.jpg'
                    ],
                link:
                {
                    href: 'https://designeranimesh.framer.ai/projects/comming-soon',
                    x: - 4.8,
                    y: - 2.6,
                    halfExtents:
                    {
                        x: 2.8,
                        y: 0.95
                    }
                },
                distinctions: []
            }
        ]
    }

    setZone() {
        const totalWidth = this.list.length * (this.interDistance / 2)

        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 6, y: this.y },
            halfExtents: { x: totalWidth, y: 12 },
            data: { cameraAngle: 'projects' }
        })

        zone.on('in', (_data) => {
            this.camera.angle.set(_data.cameraAngle)
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })
        })

        zone.on('out', () => {
            this.camera.angle.set('default')
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })
        })
    }

    add(_options) {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        const savedProject = this.savedProjects ? this.savedProjects.find(p => p.name === _options.name) : null
        if (savedProject) {
            y = savedProject.y
        }
        else if (this.items.length > 0) {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            section: this,
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if (this.items.length >= 1) {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y)
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)
            const delta = end.clone().sub(start)
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Save
        this.items.push(project)
    }
}
