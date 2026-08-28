import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    /**
     * Constructor
     */
    constructor()
    {
        super()

        // Viewport size
        this.viewport = {}
        this.$sizeViewport = document.createElement('div')
        this.$sizeViewport.style.width = '100vw'
        this.$sizeViewport.style.height = '100vh'
        this.$sizeViewport.style.position = 'absolute'
        this.$sizeViewport.style.top = 0
        this.$sizeViewport.style.left = 0
        this.$sizeViewport.style.pointerEvents = 'none'

        // Resize event
        this.resize = this.resize.bind(this)
        window.addEventListener('resize', this.resize)

        this.resize()
    }

    /**
     * Resize
     */
    resize()
    {
        this.viewport.width = window.innerWidth
        this.viewport.height = window.innerHeight

        this.width = window.innerWidth
        this.height = window.innerHeight

        this.trigger('resize')
    }
}
