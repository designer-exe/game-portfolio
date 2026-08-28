import * as THREE from 'three'
import CANNON from 'cannon'

export default class ServicesSection
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
        this.setServices()
        this.setTiles()
    }

    setBanner()
    {
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 768
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Outer border
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

        // Section badge
        ctx.fillStyle = '#B9825A'
        ctx.font = '800 48px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CORE CAPABILITIES & EXPERTISE', canvas.width * 0.5, 180)

        // Main heading
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 96px Manrope, sans-serif'
        ctx.fillText('MY SUPERPOWERS', canvas.width * 0.5, 300)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 42px Manrope, sans-serif'
        ctx.fillText('Ways I help transform ideas into impactful products', canvas.width * 0.5, 410)

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

    setServices()
    {
        this.servicesList = [
            {
                id: 'web',
                title: 'Web Design',
                desc: 'Designing responsive web interfaces that combine strong visual design with usability, ensuring products feel smooth and engaging across devices.'
            },
            {
                id: 'mobile',
                title: 'Mobile App Design',
                desc: 'Designing intuitive and engaging mobile experiences that feel natural on every screen. From user flows to polished interfaces, every interaction is optimized for usability and performance.'
            },
            {
                id: 'game',
                title: 'Game Design',
                desc: 'Creating immersive gameplay experiences that combine engaging mechanics, intuitive UI, and compelling visual storytelling to keep players motivated and entertained.'
            },
            {
                id: 'brand',
                title: 'Brand Design',
                desc: 'Building strong brand identities that communicate your vision clearly. From logos to visual systems, every element is crafted to create a memorable and consistent brand presence.'
            },
            {
                id: 'graphic',
                title: 'Graphic Design',
                desc: 'Designing impactful visuals that communicate ideas quickly and effectively. From marketing assets to digital creatives, every design balances aesthetics with purpose.'
            },
            {
                id: 'animation',
                title: 'Animation',
                desc: 'Bringing interfaces and visuals to life through smooth and meaningful motion. Thoughtful animations enhance storytelling, guide user attention, and elevate the overall experience.'
            }
        ]

        // Arrange in a 3x2 grid of 3D stations
        const colWidth = 10
        const rowHeight = 7.5
        const startX = this.x - colWidth
        const startY = this.y + 4

        let index = 0
        for(const item of this.servicesList)
        {
            const col = index % 3
            const row = Math.floor(index / 3)
            const posX = startX + col * colWidth
            const posY = startY - row * rowHeight

            this.createServiceStation({
                ...item,
                x: posX,
                y: posY
            })

            index++
        }
    }

    drawSuperpowerIcon(ctx, id, cx, cy)
    {
        ctx.save()
        switch(id)
        {
            case 'web':
            {
                // Browser window outline
                ctx.strokeStyle = '#D6A77A'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 44, cy - 36, 88, 72, 10)
                ctx.stroke()

                // Header bar
                ctx.fillStyle = 'rgba(185, 130, 90, 0.3)'
                ctx.beginPath()
                ctx.roundRect(cx - 44, cy - 36, 88, 18, [10, 10, 0, 0])
                ctx.fill()

                // 3 window dots
                ctx.fillStyle = '#D6A77A'
                ctx.beginPath(); ctx.arc(cx - 30, cy - 27, 3, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(cx - 20, cy - 27, 3, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(cx - 10, cy - 27, 3, 0, Math.PI * 2); ctx.fill()

                // Web layout wireframe lines
                ctx.fillStyle = '#F4E8D8'
                ctx.beginPath(); ctx.roundRect(cx - 34, cy - 6, 40, 10, 2); ctx.fill()
                ctx.fillStyle = 'rgba(214, 167, 122, 0.6)'
                ctx.beginPath(); ctx.roundRect(cx - 34, cy + 8, 68, 6, 2); ctx.fill()
                ctx.beginPath(); ctx.roundRect(cx - 34, cy + 18, 50, 6, 2); ctx.fill()
                break
            }

            case 'mobile':
            {
                // Mobile phone device outline
                ctx.strokeStyle = '#D6A77A'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 26, cy - 40, 52, 80, 12)
                ctx.stroke()

                // Screen notch / speaker
                ctx.fillStyle = '#D6A77A'
                ctx.beginPath()
                ctx.roundRect(cx - 8, cy - 34, 16, 3, 1.5)
                ctx.fill()

                // UI card inside screen
                ctx.fillStyle = 'rgba(185, 130, 90, 0.35)'
                ctx.beginPath()
                ctx.roundRect(cx - 18, cy - 22, 36, 32, 6)
                ctx.fill()

                // Home indicator bar
                ctx.fillStyle = '#F4E8D8'
                ctx.beginPath()
                ctx.roundRect(cx - 12, cy + 28, 24, 3, 1.5)
                ctx.fill()
                break
            }

            case 'game':
            {
                // Game controller gamepad
                ctx.strokeStyle = '#D6A77A'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 22, 84, 50, 20)
                ctx.stroke()

                // D-pad cross
                ctx.fillStyle = '#F4E8D8'
                ctx.beginPath()
                ctx.roundRect(cx - 28, cy - 6, 16, 6, 2)
                ctx.roundRect(cx - 23, cy - 11, 6, 16, 2)
                ctx.fill()

                // Action buttons
                ctx.fillStyle = '#B9825A'
                ctx.beginPath(); ctx.arc(cx + 16, cy - 3, 4, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(cx + 26, cy - 3, 4, 0, Math.PI * 2); ctx.fill()
                break
            }

            case 'brand':
            {
                // Sparkling 4-point star / diamond brand mark
                const drawStar = (x, y, r) => {
                    ctx.beginPath()
                    ctx.moveTo(x, y - r)
                    ctx.quadraticCurveTo(x, y, x + r, y)
                    ctx.quadraticCurveTo(x, y, x, y + r)
                    ctx.quadraticCurveTo(x, y, x - r, y)
                    ctx.quadraticCurveTo(x, y, x, y - r)
                    ctx.closePath()
                    ctx.fill()
                }

                ctx.fillStyle = '#F4E8D8'
                drawStar(cx - 4, cy - 4, 32)

                ctx.fillStyle = '#D6A77A'
                drawStar(cx + 24, cy - 22, 14)
                break
            }

            case 'graphic':
            {
                // Precision vector pen / bezier tool
                ctx.fillStyle = '#F4E8D8'
                ctx.beginPath()
                ctx.moveTo(cx, cy - 36)
                ctx.lineTo(cx + 18, cy - 12)
                ctx.lineTo(cx + 10, cy + 6)
                ctx.lineTo(cx - 10, cy + 6)
                ctx.lineTo(cx - 18, cy - 12)
                ctx.closePath()
                ctx.fill()

                // Nib line & circle
                ctx.strokeStyle = '#24130F'
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.moveTo(cx, cy - 36)
                ctx.lineTo(cx, cy - 6)
                ctx.stroke()
                ctx.beginPath(); ctx.arc(cx, cy - 6, 4, 0, Math.PI * 2); ctx.fillStyle = '#24130F'; ctx.fill()

                // Pen handle
                ctx.fillStyle = '#B9825A'
                ctx.beginPath()
                ctx.roundRect(cx - 8, cy + 10, 16, 26, 3)
                ctx.fill()
                break
            }

            case 'animation':
            {
                // Kinetic motion energy wave
                ctx.strokeStyle = '#F4E8D8'
                ctx.lineWidth = 5
                ctx.beginPath()
                ctx.moveTo(cx - 36, cy + 12)
                ctx.bezierCurveTo(cx - 20, cy - 36, cx - 4, cy + 32, cx + 16, cy - 16)
                ctx.lineTo(cx + 34, cy - 24)
                ctx.stroke()

                // Kinetic particle dots
                ctx.fillStyle = '#D6A77A'
                ctx.beginPath(); ctx.arc(cx + 32, cy - 8, 4, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(cx - 22, cy + 24, 4, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(cx + 2, cy - 28, 5, 0, Math.PI * 2); ctx.fill()
                break
            }
        }
        ctx.restore()
    }

    createServiceStation(_options)
    {
        const posX = _options.x
        const posY = _options.y

        // Canvas billboard texture
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 768
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = '#24130F'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Border
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 14
        ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28)

        // Inner frame
        ctx.strokeStyle = 'rgba(214, 167, 122, 0.35)'
        ctx.lineWidth = 4
        ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64)

        // Official vector icon
        this.drawSuperpowerIcon(ctx, _options.id, canvas.width * 0.5, 140)

        // Title
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 64px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(_options.title.toUpperCase(), canvas.width * 0.5, 260)

        // Divider
        ctx.strokeStyle = '#D6A77A'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(canvas.width * 0.3, 300)
        ctx.lineTo(canvas.width * 0.7, 300)
        ctx.stroke()

        // Description wrapped
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 36px Manrope, sans-serif'
        ctx.textAlign = 'center'
        
        const words = _options.desc.split(' ')
        let line = ''
        let y = 380
        const maxWidth = canvas.width - 140
        const lineHeight = 54

        for(let n = 0; n < words.length; n++)
        {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if(metrics.width > maxWidth && n > 0)
            {
                ctx.fillText(line.trim(), canvas.width * 0.5, y)
                line = words[n] + ' '
                y += lineHeight
            }
            else
            {
                line = testLine
            }
        }
        ctx.fillText(line.trim(), canvas.width * 0.5, y)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        // 3D Physical Board
        const width = 6.2
        const height = 4.6
        const depth = 0.5

        const sideMat = this.materials && this.materials.shades && this.materials.shades.items.brown 
            ? this.materials.shades.items.brown 
            : new THREE.MeshBasicMaterial({ color: 0x3A2118 })
        const faceMat = new THREE.MeshBasicMaterial({ map: texture })

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat]
        )
        mesh.position.set(posX, posY, height * 0.5)
        mesh.rotation.set(0, 0, 0)
        this.container.add(mesh)

        // Cannon body
        if(this.physics)
        {
            const body = new CANNON.Body({
                mass: 0, // Solid station structure
                position: new CANNON.Vec3(posX, posY, height * 0.5),
                shape: new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)),
                material: this.physics.materials.items.dummy
            })
            this.physics.world.addBody(body)
        }

        // Shadow
        if(this.shadows)
        {
            this.shadows.add(mesh, { sizeX: width * 1.2, sizeY: 2.2, offsetZ: - height * 0.5, alpha: 0.35 })
        }

        // Interactive approach area
        if(this.areas)
        {
            const area = this.areas.add({
                position: new THREE.Vector2(posX, posY - 2.5),
                halfExtents: new THREE.Vector2(2.5, 1.8)
            })
            area.on('in', () =>
            {
                if(this.sounds)
                {
                    this.sounds.play('uiArea')
                }
            })
        }
    }

    setTiles()
    {
        // Central corridor road tiles
        this.tiles.add({
            start: new THREE.Vector2(this.x, this.y + 9),
            delta: new THREE.Vector2(0, - 14)
        })

        this.tiles.add({
            start: new THREE.Vector2(this.x - 12, this.y + 2),
            delta: new THREE.Vector2(24, 0)
        })

        this.tiles.add({
            start: new THREE.Vector2(this.x - 12, this.y - 5.5),
            delta: new THREE.Vector2(24, 0)
        })
    }
}
