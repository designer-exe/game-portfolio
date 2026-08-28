import * as THREE from 'three'
import CANNON from 'cannon'

export default class ToolkitSection
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
        this.setTools()
        this.setPlayableProps()
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

        // Badge
        ctx.fillStyle = '#B9825A'
        ctx.font = '800 48px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('DESIGN LAB & ARSENAL', canvas.width * 0.5, 180)

        // Heading
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 96px Manrope, sans-serif'
        ctx.fillText('TOOLKIT & SKILLS', canvas.width * 0.5, 300)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 42px Manrope, sans-serif'
        ctx.fillText('Industry-standard product, game, motion & collaboration tools', canvas.width * 0.5, 410)

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

    setTools()
    {
        this.toolsList = [
            { name: 'Figma', score: '90%', type: 'Leading design tool', id: 'figma' },
            { name: 'Photoshop', score: '90%', type: 'Raster graphics editor', id: 'photoshop' },
            { name: 'Illustrator', score: '90%', type: 'Vector graphics design', id: 'illustrator' },
            { name: 'Jira', score: '80%', type: 'Agile project management', id: 'jira' },
            { name: 'Kanban', score: '80%', type: 'Visual workflow management', id: 'kanban' },
            { name: 'After Effects', score: '70%', type: 'Motion graphics creation', id: 'aftereffects' },
            { name: 'Rive', score: '70%', type: 'Interactive animation tool', id: 'rive' },
            { name: 'Trello', score: '70%', type: 'Simple task management', id: 'trello' }
        ]

        // 4x2 grid of 3D tool podiums (restored exact floating position)
        const colWidth = 7.5
        const rowHeight = 7.0
        const startX = this.x - colWidth * 1.5
        const startY = this.y + 4.5

        let index = 0
        for(const tool of this.toolsList)
        {
            const col = index % 4
            const row = Math.floor(index / 4)
            const posX = startX + col * colWidth
            const posY = startY - row * rowHeight

            this.createToolPodium({
                ...tool,
                x: posX,
                y: posY
            })

            index++
        }
    }

    drawToolIcon(ctx, id, cx, cy)
    {
        ctx.save()
        switch(id)
        {
            case 'figma':
            {
                const r = 13
                const topY = cy - 26
                const midY = cy
                const botY = cy + 26
                const leftX = cx - 13
                const rightX = cx + 13

                // Top left (Red)
                ctx.fillStyle = '#F24E1E'
                ctx.beginPath()
                ctx.arc(leftX, topY, r, Math.PI * 0.5, Math.PI * 1.5)
                ctx.lineTo(cx, topY - r)
                ctx.lineTo(cx, topY + r)
                ctx.closePath()
                ctx.fill()

                // Top right (Orange)
                ctx.fillStyle = '#FF7262'
                ctx.beginPath()
                ctx.arc(rightX, topY, r, 0, Math.PI * 2)
                ctx.fill()

                // Mid left (Purple)
                ctx.fillStyle = '#A259FF'
                ctx.beginPath()
                ctx.arc(leftX, midY, r, Math.PI * 0.5, Math.PI * 1.5)
                ctx.lineTo(cx, midY - r)
                ctx.lineTo(cx, midY + r)
                ctx.closePath()
                ctx.fill()

                // Mid right (Blue)
                ctx.fillStyle = '#1ABCFE'
                ctx.beginPath()
                ctx.arc(rightX, midY, r, 0, Math.PI * 2)
                ctx.fill()

                // Bottom left (Green)
                ctx.fillStyle = '#0ACF83'
                ctx.beginPath()
                ctx.arc(leftX, botY, r, 0, Math.PI * 1.5)
                ctx.lineTo(cx, botY)
                ctx.arc(leftX, botY, r, 0, Math.PI * 2)
                ctx.fill()
                break
            }

            case 'photoshop':
            {
                ctx.fillStyle = '#001E36'
                ctx.strokeStyle = '#31A8FF'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 18)
                ctx.fill()
                ctx.stroke()

                ctx.fillStyle = '#31A8FF'
                ctx.font = '900 44px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('Ps', cx, cy + 2)
                break
            }

            case 'illustrator':
            {
                ctx.fillStyle = '#330000'
                ctx.strokeStyle = '#FF9A00'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 18)
                ctx.fill()
                ctx.stroke()

                ctx.fillStyle = '#FF9A00'
                ctx.font = '900 44px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('Ai', cx, cy + 2)
                break
            }

            case 'jira':
            {
                ctx.fillStyle = '#0052CC'
                ctx.beginPath()
                ctx.moveTo(cx, cy - 36)
                ctx.lineTo(cx + 26, cy - 10)
                ctx.lineTo(cx + 2, cy + 14)
                ctx.lineTo(cx - 24, cy - 12)
                ctx.closePath()
                ctx.fill()

                ctx.fillStyle = '#2684FF'
                ctx.beginPath()
                ctx.moveTo(cx - 24, cy - 12)
                ctx.lineTo(cx + 2, cy + 14)
                ctx.lineTo(cx, cy + 36)
                ctx.lineTo(cx - 26, cy + 10)
                ctx.closePath()
                ctx.fill()
                break
            }

            case 'kanban':
            {
                ctx.fillStyle = 'rgba(185, 130, 90, 0.15)'
                ctx.strokeStyle = '#D6A77A'
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 14)
                ctx.fill()
                ctx.stroke()

                ctx.fillStyle = 'rgba(214, 167, 122, 0.8)'
                ctx.beginPath()
                ctx.roundRect(cx - 34, cy - 30, 18, 14, 3)
                ctx.roundRect(cx - 34, cy - 10, 18, 22, 3)
                ctx.roundRect(cx - 34, cy + 18, 18, 14, 3)
                ctx.fill()

                ctx.fillStyle = '#B9825A'
                ctx.beginPath()
                ctx.roundRect(cx - 9, cy - 30, 18, 24, 3)
                ctx.roundRect(cx - 9, cy + 0, 18, 18, 3)
                ctx.fill()

                ctx.fillStyle = '#F4E8D8'
                ctx.beginPath()
                ctx.roundRect(cx + 16, cy - 30, 18, 16, 3)
                ctx.roundRect(cx + 16, cy - 8, 18, 32, 3)
                ctx.fill()
                break
            }

            case 'aftereffects':
            {
                ctx.fillStyle = '#00005B'
                ctx.strokeStyle = '#9999FF'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 18)
                ctx.fill()
                ctx.stroke()

                ctx.fillStyle = '#9999FF'
                ctx.font = '900 44px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('Ae', cx, cy + 2)
                break
            }

            case 'rive':
            {
                ctx.fillStyle = '#0D0D11'
                ctx.strokeStyle = '#F4FF00'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 18)
                ctx.fill()
                ctx.stroke()

                ctx.fillStyle = '#F4FF00'
                ctx.beginPath()
                ctx.moveTo(cx - 20, cy - 24)
                ctx.lineTo(cx + 6, cy - 24)
                ctx.arc(cx + 6, cy - 10, 14, - Math.PI * 0.5, Math.PI * 0.5)
                ctx.lineTo(cx - 8, cy + 4)
                ctx.lineTo(cx + 20, cy + 24)
                ctx.lineTo(cx + 6, cy + 24)
                ctx.lineTo(cx - 10, cy + 6)
                ctx.lineTo(cx - 10, cy + 24)
                ctx.lineTo(cx - 20, cy + 24)
                ctx.closePath()
                ctx.fill()

                ctx.fillStyle = '#0D0D11'
                ctx.beginPath()
                ctx.roundRect(cx - 10, cy - 17, 12, 14, 2)
                ctx.fill()
                break
            }

            case 'trello':
            {
                ctx.fillStyle = '#0079BF'
                ctx.beginPath()
                ctx.roundRect(cx - 42, cy - 42, 84, 84, 18)
                ctx.fill()

                ctx.fillStyle = '#FFFFFF'
                ctx.beginPath()
                ctx.roundRect(cx - 26, cy - 24, 20, 50, 4)
                ctx.roundRect(cx + 6, cy - 24, 20, 32, 4)
                ctx.fill()
                break
            }
        }
        ctx.restore()
    }

    createToolPodium(_options)
    {
        const posX = _options.x
        const posY = _options.y

        // Canvas billboard texture
        const canvas = document.createElement('canvas')
        canvas.width = 768
        canvas.height = 768
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = '#24130F'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Outer accent border
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 14
        ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28)

        // Inner frame accent
        ctx.strokeStyle = 'rgba(214, 167, 122, 0.25)'
        ctx.lineWidth = 4
        ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56)

        // 1. Tool icon (centered horizontally at 384, Y = 130)
        this.drawToolIcon(ctx, _options.id, canvas.width * 0.5, 130)

        // 2. Tool Name (centered horizontally at 384, Y = 230)
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 52px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(_options.name, canvas.width * 0.5, 230)

        // 3. Tool Description (centered horizontally at 384, Y = 300)
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 28px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(_options.type, canvas.width * 0.5, 300)

        // 4. Percentage Progress Circle / Gauge (centered at 384, Y = 485)
        const centerX = canvas.width * 0.5
        const centerY = 485
        const radius = 95
        const lineWidth = 18

        // Track circle
        ctx.strokeStyle = 'rgba(185, 130, 90, 0.25)'
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Value circle arc
        const pct = parseInt(_options.score) / 100
        ctx.strokeStyle = '#D6A77A'
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, - Math.PI * 0.5, - Math.PI * 0.5 + Math.PI * 2 * pct)
        ctx.stroke()

        // Score text inside circle gauge
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 54px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(_options.score, centerX, centerY)

        // 5. Proficiency label (centered horizontally at 384, Y = 635)
        ctx.fillStyle = '#B9825A'
        ctx.font = '800 26px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('PROFICIENCY', canvas.width * 0.5, 635)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const width = 4.8
        const height = 4.8
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

        // Cannon body (restored exact floating elevation)
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

        // Shadow (restored exact position)
        if(this.shadows)
        {
            this.shadows.add(mesh, { sizeX: width * 1.2, sizeY: 1.8, offsetZ: - height * 0.5, alpha: 0.35 })
        }
    }

    setPlayableProps()
    {
        // Add color swatch cubes with real Cannon physics in the lab!
        const swatchColors = [
            { color: '#B9825A', name: 'Caramel', x: this.x - 3, y: this.y - 8 },
            { color: '#F4E8D8', name: 'Cream', x: this.x - 1, y: this.y - 8 },
            { color: '#D6A77A', name: 'Highlight', x: this.x + 1, y: this.y - 8 },
            { color: '#5A3426', name: 'Chocolate', x: this.x + 3, y: this.y - 8 }
        ]

        for(const item of swatchColors)
        {
            const size = 1.0
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size),
                new THREE.MeshBasicMaterial({ color: new THREE.Color(item.color) })
            )
            mesh.position.set(item.x, item.y, size * 0.5)
            this.container.add(mesh)

            if(this.physics)
            {
                const body = new CANNON.Body({
                    mass: 0.8,
                    position: new CANNON.Vec3(item.x, item.y, size * 0.5),
                    shape: new CANNON.Box(new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5)),
                    material: this.physics.materials.items.dummy
                })
                this.physics.world.addBody(body)

                body.addEventListener('collide', (_event) =>
                {
                    if(this.sounds)
                    {
                        const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                        this.sounds.play('brick', relativeVelocity)
                    }
                })

                this.time.on('tick', () =>
                {
                    mesh.position.set(body.position.x, body.position.y, body.position.z)
                    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
                })
            }

            if(this.shadows)
            {
                this.shadows.add(mesh, { sizeX: size * 1.3, sizeY: size * 1.3, offsetZ: - size * 0.5, alpha: 0.35 })
            }
        }
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x, this.y + 9),
            delta: new THREE.Vector2(0, - 14)
        })

        this.tiles.add({
            start: new THREE.Vector2(this.x - 14, this.y + 2),
            delta: new THREE.Vector2(28, 0)
        })

        this.tiles.add({
            start: new THREE.Vector2(this.x - 14, this.y - 5.5),
            delta: new THREE.Vector2(28, 0)
        })
    }
}
