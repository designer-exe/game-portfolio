import * as THREE from 'three'

export default class CrossroadsSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setStatic()
        this.setTiles()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.crossroadsStaticBase.scene,
            collision: this.resources.items.crossroadsStaticCollision.scene,
            floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setTiles()
    {
        // To intro
        this.tiles.add({
            start: new THREE.Vector2(this.x, - 10),
            delta: new THREE.Vector2(0, this.y + 14)
        })

        // To projects
        this.tiles.add({
            start: new THREE.Vector2(this.x + 12.5, this.y),
            delta: new THREE.Vector2(7.5, 0)
        })

        // To west (Journal)
        this.tiles.add({
            start: new THREE.Vector2(this.x - 13, this.y),
            delta: new THREE.Vector2(- 13, 0)
        })

        // To south (Experience & Studio)
        this.tiles.add({
            start: new THREE.Vector2(this.x, this.y - 12.5),
            delta: new THREE.Vector2(0, - 12)
        })

        // Directional guide floor plaque
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = 'rgba(185, 130, 90, 0.4)'
        ctx.lineWidth = 6
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

        // Center compass rose / crossroads
        ctx.fillStyle = '#F4E8D8'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '900 64px Manrope, sans-serif'
        ctx.fillText('CROSSROADS', canvas.width * 0.5, canvas.height * 0.5)

        // North
        ctx.fillStyle = '#D6A77A'
        ctx.font = '800 36px Manrope, sans-serif'
        ctx.fillText('▲ INTRO', canvas.width * 0.5, 120)

        // East
        ctx.fillStyle = '#D6A77A'
        ctx.fillText('PROJECTS ▶', canvas.width - 160, canvas.height * 0.5)

        // West
        ctx.fillStyle = '#D6A77A'
        ctx.fillText('◀ JOURNAL', 160, canvas.height * 0.5)

        // South
        ctx.fillStyle = '#D6A77A'
        ctx.fillText('▼ EXPERIENCE & STUDIO', canvas.width * 0.5, canvas.height - 120)

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const geometry = new THREE.PlaneGeometry(8, 8)
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.9 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(this.x, this.y, 0.01)
        mesh.matrixAutoUpdate = false
        mesh.updateMatrix()
        this.container.add(mesh)
    }
}
