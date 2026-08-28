import './style/main.css'
import Application from './javascript/Application.js'
import ContactManager from './javascript/UI/ContactManager.js'

window.application = new Application({
    $canvas: document.querySelector('.js-canvas'),
    useComposer: true
})

window.contactManager = new ContactManager()
