import * as THREE from 'three'
import CANNON from 'cannon'

export default class IntroSection
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
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
        this.container.updateMatrix()

        this.setStatic()
        this.setFloorBanner()
        this.setInstructions()
        this.setOtherInstructions()
        this.setTitles()
        this.setTiles()
        this.setDikes()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.introStaticBase.scene,
            collision: this.resources.items.introStaticCollision.scene,
            floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,
            offset: new THREE.Vector3(0, 0, 0),
            mass: 0
        })
    }

    setInstructions()
    {
        this.instructions = {}

        /**
         * Arrows
         */
        this.instructions.arrows = {}

        // Label
        this.instructions.arrows.label = {}

        this.instructions.arrows.label.texture = this.config.touch ? this.resources.items.introInstructionsControlsTexture : this.resources.items.introInstructionsArrowsTexture
        this.instructions.arrows.label.texture.magFilter = THREE.NearestFilter
        this.instructions.arrows.label.texture.minFilter = THREE.LinearFilter

        this.instructions.arrows.label.material = new THREE.MeshBasicMaterial({ transparent: true, alphaMap: this.instructions.arrows.label.texture, color: 0xffffff, depthWrite: false, opacity: 0 })

        this.instructions.arrows.label.geometry = this.resources.items.introInstructionsLabels.scene.children.find((_mesh) => _mesh.name === 'arrows').geometry

        this.instructions.arrows.label.mesh = new THREE.Mesh(this.instructions.arrows.label.geometry, this.instructions.arrows.label.material)
        this.container.add(this.instructions.arrows.label.mesh)

        if(!this.config.touch)
        {
            // Keys
            this.instructions.arrows.up = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.down = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0, - 0.8, 0),
                rotation: new THREE.Euler(0, 0, Math.PI),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.left = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(- 0.8, - 0.8, 0),
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.right = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0.8, - 0.8, 0),
                rotation: new THREE.Euler(0, 0, - Math.PI * 0.5),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
        }
    }

    setOtherInstructions()
    {
        if(this.config.touch)
        {
            return
        }

        this.otherInstructions = {}
        this.otherInstructions.x = 16
        this.otherInstructions.y = - 2

        // Container
        this.otherInstructions.container = new THREE.Object3D()
        this.otherInstructions.container.position.x = this.otherInstructions.x
        this.otherInstructions.container.position.y = this.otherInstructions.y
        this.otherInstructions.container.matrixAutoUpdate = false
        this.otherInstructions.container.updateMatrix()
        this.container.add(this.otherInstructions.container)

        // Label
        this.otherInstructions.label = {}

        this.otherInstructions.label.geometry = new THREE.PlaneGeometry(6, 6, 1, 1)

        this.otherInstructions.label.texture = this.resources.items.introInstructionsOtherTexture
        this.otherInstructions.label.texture.magFilter = THREE.NearestFilter
        this.otherInstructions.label.texture.minFilter = THREE.LinearFilter

        this.otherInstructions.label.material = new THREE.MeshBasicMaterial({ transparent: true, alphaMap: this.otherInstructions.label.texture, color: 0xffffff, depthWrite: false, opacity: 0 })

        this.otherInstructions.label.mesh = new THREE.Mesh(this.otherInstructions.label.geometry, this.otherInstructions.label.material)
        this.otherInstructions.label.mesh.matrixAutoUpdate = false
        this.otherInstructions.container.add(this.otherInstructions.label.mesh)

        // Horn
        this.otherInstructions.horn = this.objects.add({
            base: this.resources.items.hornBase.scene,
            collision: this.resources.items.hornCollision.scene,
            offset: new THREE.Vector3(this.otherInstructions.x + 1.25, this.otherInstructions.y - 2.75, 0.2),
            rotation: new THREE.Euler(0, 0, 0.5),
            duplicated: true,
            shadow: { sizeX: 1.65, sizeY: 0.75, offsetZ: - 0.1, alpha: 0.4 },
            mass: 1.5,
            soundName: 'horn',
            sleep: false
        })
    }

    setFloorBanner()
    {
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 512
        const ctx = canvas.getContext('2d')

        // Transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Geometric boundary
        ctx.strokeStyle = 'rgba(185, 130, 90, 0.35)'
        ctx.lineWidth = 4
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

        // Accent corner markers
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 8
        const corner = 40
        // Top-left
        ctx.beginPath(); ctx.moveTo(30, 30 + corner); ctx.lineTo(30, 30); ctx.lineTo(30 + corner, 30); ctx.stroke()
        // Top-right
        ctx.beginPath(); ctx.moveTo(canvas.width - 30 - corner, 30); ctx.lineTo(canvas.width - 30, 30); ctx.lineTo(canvas.width - 30, 30 + corner); ctx.stroke()
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(30, canvas.height - 30 - corner); ctx.lineTo(30, canvas.height - 30); ctx.lineTo(30 + corner, canvas.height - 30); ctx.stroke()
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(canvas.width - 30 - corner, canvas.height - 30); ctx.lineTo(canvas.width - 30, canvas.height - 30); ctx.lineTo(canvas.width - 30, canvas.height - 30 - corner); ctx.stroke()

        // Name
        ctx.fillStyle = '#F4E8D8'
        ctx.textAlign = 'center'
        ctx.font = '900 80px Manrope, sans-serif'
        ctx.fillText('ANIMESH GUPTA', canvas.width * 0.5, 180)

        // Role badge
        ctx.fillStyle = '#D6A77A'
        ctx.font = '800 36px Manrope, sans-serif'
        ctx.fillText('PRODUCT DESIGNER', canvas.width * 0.5, 250)

        // Location & Experience
        ctx.fillStyle = 'rgba(244, 232, 216, 0.8)'
        ctx.font = '600 24px Manrope, sans-serif'
        ctx.fillText('LOCATED IN INDIA, AVAILABLE WORLDWIDE', canvas.width * 0.5, 320)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const geometry = new THREE.PlaneGeometry(10, 5)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            opacity: 0.85
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(this.x + 0.3, this.y + 1.2, 0.01)
        mesh.matrixAutoUpdate = false
        mesh.updateMatrix()
        this.container.add(mesh)
    }

    createPhysicsBlock(_options)
    {
        const width = _options.width || 2
        const height = _options.height || 1
        const depth = _options.depth || 1
        const mass = typeof _options.mass === 'undefined' ? 1.5 : _options.mass
        const position = _options.position || new THREE.Vector3(0, 0, depth * 0.5)
        const rotation = _options.rotation || new THREE.Euler(0, 0, 0)
        const text = _options.text || ''
        const subtitle = _options.subtitle || ''
        const badge = _options.badge || ''

        // Create canvas texture
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 512
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = _options.bgColor || '#2E1912'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Accent border
        ctx.strokeStyle = _options.borderColor || '#B9825A'
        ctx.lineWidth = 14
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

        // Inner frame
        ctx.strokeStyle = 'rgba(214, 167, 122, 0.35)'
        ctx.lineWidth = 4
        ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)

        // Badge if present
        if(badge)
        {
            ctx.fillStyle = '#B9825A'
            ctx.font = '800 34px Manrope, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(badge.toUpperCase(), canvas.width * 0.5, 90)
        }

        // Main text
        ctx.fillStyle = _options.textColor || '#F4E8D8'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const fontSize = _options.fontSize || (text.length > 25 ? 42 : (text.length > 15 ? 56 : (text.length > 8 ? 84 : 110)))
        ctx.font = `900 ${fontSize}px Manrope, sans-serif`
        const textY = badge ? (subtitle ? canvas.height * 0.52 : canvas.height * 0.58) : (subtitle ? canvas.height * 0.44 : canvas.height * 0.5)
        ctx.fillText(text, canvas.width * 0.5, textY)

        // Subtitle if present
        if(subtitle)
        {
            ctx.fillStyle = '#D6A77A'
            ctx.font = '700 32px Manrope, sans-serif'
            ctx.fillText(subtitle, canvas.width * 0.5, canvas.height * 0.8)
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.generateMipmaps = true

        const sideMat = this.materials && this.materials.shades && this.materials.shades.items.brown 
            ? this.materials.shades.items.brown 
            : new THREE.MeshBasicMaterial({ color: 0x3A2118 })
        const topMat = this.materials && this.materials.shades && this.materials.shades.items.beige 
            ? this.materials.shades.items.beige 
            : new THREE.MeshBasicMaterial({ color: 0x5A3426 })
        const faceMat = new THREE.MeshBasicMaterial({ map: texture })

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            [sideMat, sideMat, topMat, sideMat, faceMat, faceMat]
        )
        mesh.position.copy(position)
        mesh.rotation.copy(rotation)
        this.container.add(mesh)

        // Cannon body
        if(this.physics)
        {
            const body = new CANNON.Body({
                mass: mass,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                shape: new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)),
                material: this.physics.materials.items.dummy
            })
            const rotationQuaternion = new CANNON.Quaternion()
            rotationQuaternion.setFromEuler(rotation.x, rotation.y, rotation.z, rotation.order || 'XYZ')
            body.quaternion.copy(rotationQuaternion)
            body.allowSleep = true
            body.sleepSpeedLimit = 0.05

            this.physics.world.addBody(body)

            // Sound on collide
            body.addEventListener('collide', (_event) =>
            {
                if(this.sounds)
                {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('brick', relativeVelocity)
                }
            })

            // Sync with mesh
            this.time.on('tick', () =>
            {
                mesh.position.set(body.position.x, body.position.y, body.position.z)
                mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
            })
        }

        // Add shadow
        if(this.shadows)
        {
            this.shadows.add(mesh, { sizeX: width * 1.25, sizeY: height * 1.25, offsetZ: - depth * 0.5, alpha: 0.35 })
        }

        return mesh
    }

    setTitles()
    {
        // 3D Block 1: "ANIMESH"
        this.createPhysicsBlock({
            text: 'ANIMESH',
            width: 4.6,
            height: 1.4,
            depth: 1.2,
            mass: 2.0,
            position: new THREE.Vector3(this.x - 2.4, this.y + 3.6, 0.6),
            rotation: new THREE.Euler(0, 0, 0.05),
            borderColor: '#B9825A',
            textColor: '#F4E8D8'
        })

        // 3D Block 2: "GUPTA"
        this.createPhysicsBlock({
            text: 'GUPTA',
            width: 3.8,
            height: 1.4,
            depth: 1.2,
            mass: 2.0,
            position: new THREE.Vector3(this.x + 2.4, this.y + 3.6, 0.6),
            rotation: new THREE.Euler(0, 0, - 0.05),
            borderColor: '#B9825A',
            textColor: '#F4E8D8'
        })

        // 3D Block 3: "PRODUCT DESIGNER"
        this.createPhysicsBlock({
            text: 'PRODUCT DESIGNER',
            subtitle: 'MINIMALIST • INTUITIVE • MEANINGFUL',
            width: 6.8,
            height: 1.2,
            depth: 1.0,
            mass: 1.8,
            position: new THREE.Vector3(this.x + 0.1, this.y + 5.4, 0.5),
            rotation: new THREE.Euler(0, 0, 0),
            borderColor: '#D6A77A',
            textColor: '#F4E8D8'
        })

        // 3D Block 4: "3 YEARS EXP"
        this.createPhysicsBlock({
            text: '3 YEARS EXP',
            width: 3.2,
            height: 0.9,
            depth: 0.8,
            mass: 1.2,
            position: new THREE.Vector3(this.x - 4.2, this.y + 6.8, 0.4),
            rotation: new THREE.Euler(0, 0, 0.1),
            borderColor: '#B9825A',
            textColor: '#D6A77A'
        })

        // 3D Block 5: "INDIA • WORLDWIDE"
        this.createPhysicsBlock({
            text: 'INDIA • WORLDWIDE',
            width: 4.4,
            height: 0.9,
            depth: 0.8,
            mass: 1.2,
            position: new THREE.Vector3(this.x + 4.2, this.y + 6.8, 0.4),
            rotation: new THREE.Euler(0, 0, - 0.1),
            borderColor: '#B9825A',
            textColor: '#D6A77A'
        })

        // 3D Monolith Pedestal: Positioning statement
        this.createPhysicsBlock({
            text: 'PASSIONATE ABOUT INTUITIVE EXPERIENCES',
            subtitle: 'BUILDING ELEGANT INTERFACES FOR DIGITAL PRODUCTS & GAMES',
            width: 9.6,
            height: 1.3,
            depth: 0.9,
            mass: 3.0,
            position: new THREE.Vector3(this.x + 0.1, this.y + 8.4, 0.45),
            rotation: new THREE.Euler(0, 0, 0),
            borderColor: '#D6A77A',
            textColor: '#F4E8D8'
        })
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(0, - 4.5),
            delta: new THREE.Vector2(0, - 4.5)
        })
    }

    setDikes()
    {
        this.dikes = {}
        this.dikes.brickOptions = {
            base: this.resources.items.brickBase.scene,
            collision: this.resources.items.brickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            soundName: 'brick'
        }

        // this.walls.add({
        //     object:
        //     {
        //         ...this.dikes.brickOptions,
        //         rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
        //     },
        //     shape:
        //     {
        //         type: 'brick',
        //         equilibrateLastLine: true,
        //         widthCount: 3,
        //         heightCount: 2,
        //         position: new THREE.Vector3(this.x + 0, this.y - 4, 0),
        //         offsetWidth: new THREE.Vector3(1.05, 0, 0),
        //         offsetHeight: new THREE.Vector3(0, 0, 0.45),
        //         randomOffset: new THREE.Vector3(0, 0, 0),
        //         randomRotation: new THREE.Vector3(0, 0, 0.2)
        //     }
        // })

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 5,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 12, this.y - 13, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 3,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 8, this.y + 6, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: false,
                widthCount: 3,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 9.9, this.y + 4.7, 0),
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 3,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 14, this.y + 2, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: false,
                widthCount: 3,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 14.8, this.y + 0.7, 0),
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 3,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 14.8, this.y - 3.5, 0),
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        if(!this.config.touch)
        {
            this.walls.add({
                object:
                {
                    ...this.dikes.brickOptions,
                    rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
                },
                shape:
                {
                    type: 'brick',
                    equilibrateLastLine: true,
                    widthCount: 2,
                    heightCount: 2,
                    position: new THREE.Vector3(this.x + 18.5, this.y + 3, 0),
                    offsetWidth: new THREE.Vector3(1.05, 0, 0),
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),
                    randomOffset: new THREE.Vector3(0, 0, 0),
                    randomRotation: new THREE.Vector3(0, 0, 0.2)
                }
            })

            this.walls.add({
                object: this.dikes.brickOptions,
                shape:
                {
                    type: 'brick',
                    equilibrateLastLine: false,
                    widthCount: 2,
                    heightCount: 2,
                    position: new THREE.Vector3(this.x + 19.9, this.y + 2.2, 0),
                    offsetWidth: new THREE.Vector3(0, - 1.05, 0),
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),
                    randomOffset: new THREE.Vector3(0, 0, 0),
                    randomRotation: new THREE.Vector3(0, 0, 0.2)
                }
            })
        }
    }
}
