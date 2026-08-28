import * as THREE from 'three'
import CANNON from 'cannon'

export default class ExperienceSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.physics = _options.physics
        this.shadows = _options.shadows
        this.sounds = _options.sounds
        this.materials = _options.materials
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setBanner()
        this.setMilestones()
        this.setTiles()
    }

    setBanner()
    {
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 768
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = 'rgba(185, 130, 90, 0.4)'
        ctx.lineWidth = 6
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

        // Accent corners
        ctx.strokeStyle = '#D6A77A'
        ctx.lineWidth = 14
        const cLen = 70
        ctx.beginPath(); ctx.moveTo(30, 30 + cLen); ctx.lineTo(30, 30); ctx.lineTo(30 + cLen, 30); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(canvas.width - 30 - cLen, 30); ctx.lineTo(canvas.width - 30, 30); ctx.lineTo(canvas.width - 30, 30 + cLen); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(30, canvas.height - 30 - cLen); ctx.lineTo(30, canvas.height - 30); ctx.lineTo(30 + cLen, canvas.height - 30); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(canvas.width - 30 - cLen, canvas.height - 30); ctx.lineTo(canvas.width - 30, canvas.height - 30); ctx.lineTo(canvas.width - 30, canvas.height - 30 - cLen); ctx.stroke()

        // Badge
        ctx.fillStyle = '#B9825A'
        ctx.font = '800 48px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CAREER PATHWAY & HISTORY', canvas.width * 0.5, 180)

        // Heading
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 96px Manrope, sans-serif'
        ctx.fillText('WORK EXPERIENCE', canvas.width * 0.5, 300)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 42px Manrope, sans-serif'
        ctx.fillText('3 years of proven impact designing digital products & games', canvas.width * 0.5, 410)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const geometry = new THREE.PlaneGeometry(16, 6)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            opacity: 0.95
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(this.x, this.y + 11, 0.01)
        mesh.matrixAutoUpdate = false
        mesh.updateMatrix()
        this.container.add(mesh)
    }

    setMilestones()
    {
        this.milestonesList = [
            {
                period: 'MAY 2024 – PRESENT',
                company: 'SDLC Corp',
                role: 'UI/UX Designer',
                desc: 'Leading product UI/UX, scalable design systems, multi-platform interfaces, and cross-functional engineering handoffs.',
                side: -1
            },
            {
                period: 'FEB 2024 – APR 2024',
                company: 'Nicologix Technologies',
                role: 'UI/UX Designer',
                desc: 'Delivered intuitive client portals, responsive design architectures, and interactive high-fidelity prototypes.',
                side: 1
            },
            {
                period: 'DEC 2023 – JAN 2024',
                company: 'Bigwig Digital Solutions',
                role: 'UI/UX Designer',
                desc: 'Designed high-conversion web interfaces, promotional design assets, and optimized UX conversion funnels.',
                side: -1
            },
            {
                period: 'MAY 2023 – NOV 2023',
                company: 'Freelance Designer',
                role: 'Product & Game Designer',
                desc: 'Independent consulting for global startups across SaaS, gaming UI, mobile apps, and interactive web experiences.',
                side: 1
            },
            {
                period: 'MAR 2023 – APR 2023',
                company: 'W3Dev Private Limited',
                role: 'UI/UX Designer',
                desc: 'User research, wireframing, design sprints, interface prototyping, and developer component alignment.',
                side: -1
            }
        ]

        const stepY = 7.5
        let index = 0

        for(const item of this.milestonesList)
        {
            const posY = this.y + 3 - index * stepY
            const posX = this.x + item.side * 7.5

            this.createMilestoneCard({
                ...item,
                x: posX,
                y: posY
            })

            index++
        }
    }

    createMilestoneCard(_options)
    {
        const posX = _options.x
        const posY = _options.y

        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 640
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = '#24130F'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Accent border
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 14
        ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28)

        // Inner frame
        ctx.strokeStyle = 'rgba(214, 167, 122, 0.3)'
        ctx.lineWidth = 4
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

        // Date pill badge
        ctx.fillStyle = 'rgba(185, 130, 90, 0.25)'
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(70, 60, 440, 64, 32)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#D6A77A'
        ctx.font = '800 32px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(_options.period, 290, 104)

        // Company
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 68px Manrope, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(_options.company, 70, 210)

        // Role
        ctx.fillStyle = '#D6A77A'
        ctx.font = '700 40px Manrope, sans-serif'
        ctx.fillText(_options.role, 70, 280)

        // Divider
        ctx.strokeStyle = 'rgba(214, 167, 122, 0.4)'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(70, 320)
        ctx.lineTo(canvas.width - 70, 320)
        ctx.stroke()

        // Description
        ctx.fillStyle = 'rgba(244, 232, 216, 0.85)'
        ctx.font = '500 34px Manrope, sans-serif'
        
        const words = _options.desc.split(' ')
        let line = ''
        let y = 380
        const maxWidth = canvas.width - 140
        const lineHeight = 50

        for(let n = 0; n < words.length; n++)
        {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if(metrics.width > maxWidth && n > 0)
            {
                ctx.fillText(line.trim(), 70, y)
                line = words[n] + ' '
                y += lineHeight
            }
            else
            {
                line = testLine
            }
        }
        ctx.fillText(line.trim(), 70, y)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const width = 6.4
        const height = 4.0
        const depth = 0.6

        const sideMat = this.materials && this.materials.shades && this.materials.shades.items.brown 
            ? this.materials.shades.items.brown 
            : new THREE.MeshBasicMaterial({ color: 0x3A2118 })
        const faceMat = new THREE.MeshBasicMaterial({ map: texture })

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat]
        )
        mesh.position.set(posX, posY, height * 0.5)
        this.container.add(mesh)

        if(this.physics)
        {
            const body = new CANNON.Body({
                mass: 0,
                position: new CANNON.Vec3(posX, posY, height * 0.5),
                shape: new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)),
                material: this.physics.materials.items.dummy
            })
            this.physics.world.addBody(body)
        }

        if(this.shadows)
        {
            this.shadows.add(mesh, { sizeX: width * 1.2, sizeY: 1.8, offsetZ: - height * 0.5, alpha: 0.35 })
        }
    }

    setTiles()
    {
        // Central highway road tiles running down through the timeline
        this.tiles.add({
            start: new THREE.Vector2(this.x, this.y + 10),
            delta: new THREE.Vector2(0, - 42)
        })
    }
}
