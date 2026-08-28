import * as THREE from 'three'
import CANNON from 'cannon'

export default class InformationSection
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

        this.setStatic()
        this.setBanner()
        this.setTestimonial()
        this.setLinks()
        this.setTiles()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,
            collision: this.resources.items.informationStaticCollision.scene,
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
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
        ctx.fillText('STUDIO DESTINATION • GET IN TOUCH', canvas.width * 0.5, 180)

        // Heading
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 96px Manrope, sans-serif'
        ctx.fillText("LET'S WORK TOGETHER", canvas.width * 0.5, 300)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 42px Manrope, sans-serif'
        ctx.fillText("Have a project in mind? Reach out directly — I'll respond within 24 hours.", canvas.width * 0.5, 410)

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

    setTestimonial()
    {
        const posX = this.x - 7.5
        const posY = this.y + 1.5

        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 768
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
        ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64)

        // Quote icon
        ctx.fillStyle = '#B9825A'
        ctx.font = '900 90px serif'
        ctx.textAlign = 'left'
        ctx.fillText('“', 60, 130)

        // Testimonial quote text
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '600 38px Manrope, sans-serif'
        
        const quote = "I was amazed by how intuitive and user-friendly everything felt. It's clear their designers obsess over every pixel, every transition, to create experiences that delight."
        const words = quote.split(' ')
        let line = ''
        let y = 200
        const maxWidth = canvas.width - 120
        const lineHeight = 54

        for(let n = 0; n < words.length; n++)
        {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if(metrics.width > maxWidth && n > 0)
            {
                ctx.fillText(line.trim(), 60, y)
                line = words[n] + ' '
                y += lineHeight
            }
            else
            {
                line = testLine
            }
        }
        ctx.fillText(line.trim(), 60, y)

        // Divider
        ctx.strokeStyle = '#D6A77A'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(60, y + 50)
        ctx.lineTo(canvas.width - 60, y + 50)
        ctx.stroke()

        // Author Name
        ctx.fillStyle = '#D6A77A'
        ctx.font = '900 48px Manrope, sans-serif'
        ctx.fillText('Aryan Soni', 60, y + 120)

        // Author Title
        ctx.fillStyle = 'rgba(244, 232, 216, 0.75)'
        ctx.font = '600 32px Manrope, sans-serif'
        ctx.fillText('Project Manager', 60, y + 170)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const width = 7.0
        const height = 5.2
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

    setLinks()
    {
        this.contactOptions = [
            {
                title: 'SEND MESSAGE',
                subtitle: 'Open direct contact form',
                action: 'contact',
                icon: '✉️',
                href: 'mailto:officialanimesh28@gmail.com'
            },
            {
                title: 'EMAIL DIRECT',
                subtitle: 'officialanimesh28@gmail.com',
                icon: '📬',
                href: 'mailto:officialanimesh28@gmail.com'
            },
            {
                title: 'LINKEDIN',
                subtitle: 'animesh-kumar-gupta',
                icon: '💼',
                href: 'https://www.linkedin.com/in/animesh-kumar-gupta-a5a5471ba'
            },
            {
                title: 'BEHANCE',
                subtitle: 'animeshkumar14',
                icon: '🎨',
                href: 'https://www.behance.net/animeshkumar14'
            },
            {
                title: 'FRAMER SITE',
                subtitle: 'designeranimesh.framer.ai',
                icon: '🌐',
                href: 'https://designeranimesh.framer.ai/'
            }
        ]

        const startX = this.x + 1.0
        const startY = this.y + 5.6
        const stepY = 2.6

        let i = 0
        for(const item of this.contactOptions)
        {
            const posX = startX + 5.0
            const posY = startY - i * stepY

            this.createContactButton({
                ...item,
                x: posX,
                y: posY
            })

            i++
        }
    }

    createContactButton(_options)
    {
        const posX = _options.x
        const posY = _options.y

        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 320
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#24130F'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 10
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

        // Icon
        ctx.font = '64px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(_options.icon, 50, 140)

        // Title
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 56px Manrope, sans-serif'
        ctx.fillText(_options.title, 150, 135)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 36px Manrope, sans-serif'
        ctx.fillText(_options.subtitle, 150, 210)

        // Arrow
        ctx.fillStyle = '#B9825A'
        ctx.font = '900 64px Manrope, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('↗', canvas.width - 50, 175)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const width = 6.8
        const height = 2.1
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
            this.shadows.add(mesh, { sizeX: width * 1.1, sizeY: 1.5, offsetZ: - height * 0.5, alpha: 0.35 })
        }

        // Interactive drive-over area with Enter key activation
        if(this.areas)
        {
            const area = this.areas.add({
                position: new THREE.Vector2(posX - 3.2, posY),
                halfExtents: new THREE.Vector2(1.8, 1.2),
                hasKey: true
            })

            const activateOption = () =>
            {
                if(_options.action === 'contact')
                {
                    if(window.openContactForm)
                    {
                        window.openContactForm()
                    }
                }
                else if(_options.href)
                {
                    window.open(_options.href, '_blank')
                }
            }

            window.addEventListener('keydown', (_event) =>
            {
                if(_event.key === 'Enter' && area && area.isIn)
                {
                    if(area.interact)
                    {
                        area.interact()
                    }
                    activateOption()
                }
            })

            area.on('interact', () =>
            {
                activateOption()
            })
        }
    }

    setTiles()
    {
        // Central pathway to studio
        this.tiles.add({
            start: new THREE.Vector2(this.x, this.y + 11),
            delta: new THREE.Vector2(0, - 18)
        })
    }
}
