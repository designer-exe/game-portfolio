import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.geometries = _options.geometries
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y
        this.imageSources = _options.imageSources
        this.floorTexture = _options.floorTexture
        this.floorData = _options.floorData
        this.link = _options.link
        this.distinctions = _options.distinctions
        this.section = _options.section

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        // this.container.updateMatrix()

        this.setBoards()
        this.setFloor()
    }

    setBoards()
    {
        // Set up
        this.boards = {}
        this.boards.items = []
        this.boards.xStart = - 5
        this.boards.xInter = 5
        this.boards.y = 5
        this.boards.color = '#5A3426'
        this.boards.threeColor = new THREE.Color(this.boards.color)

        if(this.debug)
        {
            this.debug.addColor(this.boards, 'color').name('boardColor').onChange(() =>
            {
                this.boards.threeColor.set(this.boards.color)
            })
        }

        // Create each board
        let i = 0

        for(const _imageSource of this.imageSources)
        {
            // Set up
            const board = {}
            board.x = this.x + this.boards.xStart + i * this.boards.xInter
            board.y = this.y + this.boards.y

            // Create structure with collision
            this.objects.add({
                base: this.resources.items.projectsBoardStructure.scene,
                collision: this.resources.items.projectsBoardCollision.scene,
                floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
                offset: new THREE.Vector3(board.x, board.y, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                mass: 0
            })

            // Image load
            const image = new Image()
            image.addEventListener('load', () =>
            {
                board.texture = new THREE.Texture(image)
                // board.texture.magFilter = THREE.NearestFilter
                // board.texture.minFilter = THREE.LinearFilter
                board.texture.anisotropy = 4
                // board.texture.colorSpace = THREE.SRGBColorSpace
                board.texture.needsUpdate = true

                board.planeMesh.material.uniforms.uTexture.value = board.texture

                gsap.to(board.planeMesh.material.uniforms.uTextureAlpha, { value: 1, duration: 1, ease: 'power4.inOut' })
            })

            image.src = _imageSource

            // Plane
            board.planeMesh = this.meshes.boardPlane.clone()
            board.planeMesh.position.x = board.x
            board.planeMesh.position.y = board.y
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new ProjectBoardMaterial()
            board.planeMesh.material.uniforms.uColor.value = this.boards.threeColor
            board.planeMesh.material.uniforms.uTextureAlpha.value = 0
            this.container.add(board.planeMesh)

            // Save
            this.boards.items.push(board)

            i++
        }
    }

    setFloor()
    {
        this.floor = {}

        this.floor.x = 0
        this.floor.y = - 2

        // Container
        this.floor.container = new THREE.Object3D()
        this.floor.container.position.x = this.x + this.floor.x
        this.floor.container.position.y = this.y + this.floor.y
        this.floor.container.matrixAutoUpdate = false
        this.floor.container.updateMatrix()
        this.container.add(this.floor.container)

        // Texture & Material
        if(this.floorData)
        {
            const canvas = document.createElement('canvas')
            canvas.width = 2048
            canvas.height = 1024
            const ctx = canvas.getContext('2d')

            // Clear transparent
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Outer frame
            ctx.strokeStyle = 'rgba(185, 130, 90, 0.4)'
            ctx.lineWidth = 6
            ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

            // Decorative corners
            ctx.strokeStyle = '#D6A77A'
            ctx.lineWidth = 14
            const cLen = 70
            ctx.beginPath(); ctx.moveTo(40, 40 + cLen); ctx.lineTo(40, 40); ctx.lineTo(40 + cLen, 40); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(canvas.width - 40 - cLen, 40); ctx.lineTo(canvas.width - 40, 40); ctx.lineTo(canvas.width - 40, 40 + cLen); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(40, canvas.height - 40 - cLen); ctx.lineTo(40, canvas.height - 40); ctx.lineTo(40 + cLen, canvas.height - 40); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(canvas.width - 40 - cLen, canvas.height - 40); ctx.lineTo(canvas.width - 40, canvas.height - 40); ctx.lineTo(canvas.width - 40, canvas.height - 40 - cLen); ctx.stroke()

            // Category badge
            ctx.fillStyle = '#B9825A'
            ctx.font = '800 44px Manrope, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText((this.floorData.category || 'CASE STUDY').toUpperCase(), 120, 200)

            // Project Title
            ctx.fillStyle = '#F4E8D8'
            ctx.font = '900 100px Manrope, sans-serif'
            ctx.fillText(this.floorData.title || this.name, 120, 330)

            // Subtitle / Tagline
            ctx.fillStyle = '#D6A77A'
            ctx.font = '600 46px Manrope, sans-serif'
            ctx.fillText(this.floorData.description || '', 120, 430)

            // Additional details / metrics if provided
            if(this.floorData.details)
            {
                ctx.fillStyle = 'rgba(244, 232, 216, 0.75)'
                ctx.font = '500 34px Manrope, sans-serif'
                ctx.fillText(this.floorData.details, 120, 520)
            }

            // Interactive drive button pill
            const pillX = 120
            const pillY = 590
            const pillWidth = 580
            const pillHeight = 88
            const pillCenterX = pillX + pillWidth * 0.5
            const pillCenterY = pillY + pillHeight * 0.5

            ctx.fillStyle = 'rgba(185, 130, 90, 0.22)'
            ctx.strokeStyle = '#B9825A'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight * 0.5)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#F4E8D8'
            ctx.font = '800 36px Manrope, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('DRIVE TO OPEN CASE STUDY →', pillCenterX, pillCenterY)

            this.floor.texture = new THREE.CanvasTexture(canvas)
            this.floor.texture.magFilter = THREE.LinearFilter
            this.floor.texture.minFilter = THREE.LinearMipmapLinearFilter

            this.floor.geometry = this.geometries.floor
            this.floor.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: this.floor.texture, opacity: 0.95 })
        }
        else
        {
            this.floor.texture = this.floorTexture
            this.floor.texture.magFilter = THREE.NearestFilter
            this.floor.texture.minFilter = THREE.LinearFilter

            this.floor.geometry = this.geometries.floor
            this.floor.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaMap: this.floor.texture })
        }

        // Mesh
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.matrixAutoUpdate = false
        this.floor.container.add(this.floor.mesh)

        // Distinctions
        if(this.distinctions)
        {
            for(const _distinction of this.distinctions)
            {
                let base = null
                let collision = null
                let shadowSizeX = null
                let shadowSizeY = null

                switch(_distinction.type)
                {
                    case 'awwwards':
                        base = this.resources.items.projectsDistinctionsAwwwardsBase.scene
                        collision = this.resources.items.projectsDistinctionsAwwwardsCollision.scene
                        shadowSizeX = 1.5
                        shadowSizeY = 1.5
                        break

                    case 'fwa':
                        base = this.resources.items.projectsDistinctionsFWABase.scene
                        collision = this.resources.items.projectsDistinctionsFWACollision.scene
                        shadowSizeX = 2
                        shadowSizeY = 1
                        break

                    case 'cssda':
                        base = this.resources.items.projectsDistinctionsCSSDABase.scene
                        collision = this.resources.items.projectsDistinctionsCSSDACollision.scene
                        shadowSizeX = 1.2
                        shadowSizeY = 1.2
                        break
                }

                this.objects.add({
                    base: base,
                    collision: collision,
                    offset: new THREE.Vector3(this.x + this.floor.x + _distinction.x, this.y + this.floor.y + _distinction.y, 0),
                    rotation: new THREE.Euler(0, 0, 0),
                    duplicated: true,
                    shadow: { sizeX: shadowSizeX, sizeY: shadowSizeY, offsetZ: - 0.1, alpha: 0.5 },
                    mass: 1.5,
                    soundName: 'woodHit'
                })
            }
        }

        // Save return state helper
        this.saveReturnState = () =>
        {
            try
            {
                const car = this.areas ? this.areas.car : null
                const carBody = car && car.physics && car.physics.car && car.physics.car.chassis ? car.physics.car.chassis.body : null

                const state = {
                    car: {
                        position: carBody ? {
                            x: carBody.position.x,
                            y: carBody.position.y,
                            z: carBody.position.z
                        } : {
                            x: this.x + this.link.x,
                            y: this.y + this.floor.y + this.link.y,
                            z: 0.6
                        },
                        quaternion: carBody ? {
                            x: carBody.quaternion.x,
                            y: carBody.quaternion.y,
                            z: carBody.quaternion.z,
                            w: carBody.quaternion.w
                        } : null
                    },
                    project: {
                        name: this.name,
                        x: this.x,
                        y: this.y
                    },
                    projects: (this.section && this.section.items) ? this.section.items.map(p => ({
                        name: p.name,
                        x: p.x,
                        y: p.y
                    })) : []
                }

                window.sessionStorage.setItem('portfolio_return_state', JSON.stringify(state))
                if(window.history && window.history.replaceState)
                {
                    window.history.replaceState({ portfolio_return_state: state }, '')
                }
            }
            catch(e)
            {
                console.warn('Could not save return state:', e)
            }
        }

        // Area
        this.floor.area = this.areas.add({
            position: new THREE.Vector2(this.x + this.link.x, this.y + this.floor.y + this.link.y),
            halfExtents: new THREE.Vector2(this.link.halfExtents.x, this.link.halfExtents.y)
        })
        let hasOpened = false
        const openCaseStudy = () =>
        {
            if(!hasOpened && this.link && this.link.href)
            {
                hasOpened = true
                this.saveReturnState()
                window.location.href = this.link.href
            }
        }

        // Project URL opens ONLY when user presses Enter key while in the OPEN area
        window.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'Enter' && this.floor.area && this.floor.area.isIn)
            {
                if(this.floor.area.interact)
                {
                    this.floor.area.interact()
                }
                openCaseStudy()
            }
        })

        // Mobile touch interaction
        this.floor.area.on('interact', () =>
        {
            if(this.areas && this.areas.config && this.areas.config.touch)
            {
                openCaseStudy()
            }
        })

        this.floor.area.on('out', () =>
        {
            hasOpened = false
        })

        window.addEventListener('pageshow', (_event) =>
        {
            if(_event.persisted)
            {
                hasOpened = false
            }
        })

        // Area label
        this.floor.areaLabel = this.meshes.areaLabel.clone()
        this.floor.areaLabel.position.x = this.link.x
        this.floor.areaLabel.position.y = this.link.y
        this.floor.areaLabel.position.z = 0.001
        this.floor.areaLabel.matrixAutoUpdate = false
        this.floor.areaLabel.updateMatrix()
        this.floor.container.add(this.floor.areaLabel)
    }
}
