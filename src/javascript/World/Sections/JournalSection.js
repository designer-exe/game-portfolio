import * as THREE from 'three'
import CANNON from 'cannon'

export default class JournalSection
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
        this.setArticles()
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
        ctx.fillText('DESIGN INSIGHTS & PERSPECTIVES', canvas.width * 0.5, 180)

        // Heading
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 96px Manrope, sans-serif'
        ctx.fillText('JOURNAL & ARTICLES', canvas.width * 0.5, 300)

        // Subtitle
        ctx.fillStyle = '#D6A77A'
        ctx.font = '600 42px Manrope, sans-serif'
        ctx.fillText('Thoughts on UX audits, Figma component systems, and design workflow', canvas.width * 0.5, 410)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const geometry = new THREE.PlaneGeometry(24, 6)
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

    setArticles()
    {
        this.articlesList = [
            {
                date: 'AUG 16, 2024',
                title: 'UX Audit: Uncovering Friction',
                desc: 'How a thorough UX audit pinpoints friction and reveals actionable paths to delight users and optimize conversion.',
                href: 'https://designeranimesh.framer.ai/blog/ux-audit'
            },
            {
                date: 'DEC 07, 2025',
                title: 'Latest Figma Plugins (2025)',
                desc: 'Essential modern plugins that streamline daily design operations, component hygiene, and multi-state animations.',
                href: 'https://designeranimesh.framer.ai/blog/latest-figma-plugin'
            },
            {
                date: 'DEC 11, 2025',
                title: 'Mastering Figma Components',
                desc: 'Building robust, scalable component architectures with variants, slots, and design token integration.',
                href: 'https://designeranimesh.framer.ai/blog/figma-components'
            },
            {
                date: 'DEC 18, 2025',
                title: 'Auto Layout in Figma',
                desc: 'Mastering flexbox-like responsive layouts, constraints, and padding to build smarter, flexible interfaces.',
                href: 'https://designeranimesh.framer.ai/blog/auto-layout-in-figma-for-beginners'
            }
        ]

        const spacingX = 8.5
        const startX = this.x - 1.5 * spacingX

        let i = 0
        for(const item of this.articlesList)
        {
            const posX = startX + i * spacingX
            const posY = this.y + 1.5

            this.createArticleStand({
                ...item,
                x: posX,
                y: posY
            })

            i++
        }
    }

    createArticleStand(_options)
    {
        const posX = _options.x
        const posY = _options.y

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
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

        // Date pill
        ctx.fillStyle = 'rgba(185, 130, 90, 0.25)'
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(60, 60, 300, 56, 28)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#D6A77A'
        ctx.font = '800 28px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(_options.date, 210, 98)

        // Title
        ctx.fillStyle = '#F4E8D8'
        ctx.font = '900 58px Manrope, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(_options.title, 60, 210)

        // Divider
        ctx.strokeStyle = '#D6A77A'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(60, 250)
        ctx.lineTo(canvas.width - 60, 250)
        ctx.stroke()

        // Excerpt
        ctx.fillStyle = 'rgba(244, 232, 216, 0.85)'
        ctx.font = '500 36px Manrope, sans-serif'
        
        const words = _options.desc.split(' ')
        let line = ''
        let y = 320
        const maxWidth = canvas.width - 120
        const lineHeight = 52

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

        // Read Article button
        ctx.fillStyle = 'rgba(185, 130, 90, 0.28)'
        ctx.strokeStyle = '#B9825A'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.roundRect(60, 600, 480, 84, 42)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#F4E8D8'
        ctx.font = '800 34px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('READ ARTICLE ↗', 300, 654)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const width = 6.8
        const height = 5.0
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

        // Interactive drive-over zone with Enter-to-open and state preservation
        if(this.areas)
        {
            const area = this.areas.add({
                position: new THREE.Vector2(posX, posY - 2.8),
                halfExtents: new THREE.Vector2(2.5, 1.8),
                hasKey: true
            })

            const saveReturnState = () =>
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
                                x: posX,
                                y: posY - 2.8,
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
                            name: _options.title,
                            x: posX,
                            y: posY
                        }
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

            let hasOpened = false
            const openArticle = () =>
            {
                if(!hasOpened && _options.href)
                {
                    hasOpened = true
                    saveReturnState()
                    const win = window.open(_options.href, '_blank')
                    if(!win || win.closed || typeof win.closed === 'undefined')
                    {
                        window.location.href = _options.href
                    }
                }
            }

            // Article URL opens ONLY when user presses Enter key while in the OPEN area
            window.addEventListener('keydown', (_event) =>
            {
                if(_event.key === 'Enter' && area && area.isIn)
                {
                    if(area.interact)
                    {
                        area.interact()
                    }
                    openArticle()
                }
            })

            // Mobile / click interaction
            area.on('interact', () =>
            {
                openArticle()
            })

            area.on('out', () =>
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
        }
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x + 14, this.y - 1),
            delta: new THREE.Vector2(- 28, 0)
        })
    }
}
