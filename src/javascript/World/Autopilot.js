import * as THREE from 'three'
import CANNON from 'cannon'
import EventEmitter from '../Utils/EventEmitter'
import { PORTFOLIO_KNOWLEDGE } from '../AI/PortfolioKnowledge'

export default class Autopilot extends EventEmitter
{
    constructor(_options)
    {
        super()

        this.time = _options.time
        this.car = _options.car
        this.physics = _options.physics
        this.camera = _options.camera
        this.sounds = _options.sounds
        this.controls = _options.controls
        this.world = _options.world

        this.isNavigating = false
        this.currentTarget = null
        this.waypoints = []
        this.currentWaypointIndex = 0
        this.cruiseSpeed = 10.0
        this.arrivalThreshold = 1.0
        this.navigationStartTime = 0

        this.setManualOverrideWatcher()
        this.setTick()
    }

    setManualOverrideWatcher()
    {
        // Cancel navigation immediately if user presses any drive controls
        const cancelOnUserAction = () =>
        {
            if(!this.isNavigating) return

            // Grace period right after clicking navigation button
            if(Date.now() - this.navigationStartTime < 500) return

            const actions = this.controls ? this.controls.actions : null
            if(actions && (actions.up || actions.down || actions.left || actions.right || actions.brake || actions.boost))
            {
                this.cancel('Manual driving control taken by user')
            }
        }

        this.time.on('tick', cancelOnUserAction)
    }

    setTick()
    {
        this.time.on('tick', () =>
        {
            if(!this.isNavigating) return

            const chassis = this.physics && this.physics.car && this.physics.car.chassis ? this.physics.car.chassis.body : null
            if(!chassis) return

            // Convert milliseconds to seconds (Time.delta is in ms, e.g. 16.6ms)
            const dt = Math.min(this.time.delta * 0.001, 0.05)
            const currentPos = new THREE.Vector2(chassis.position.x, chassis.position.y)
            const targetWaypoint = this.waypoints[this.currentWaypointIndex]

            if(!targetWaypoint)
            {
                this.finishArrival()
                return
            }

            const wp = new THREE.Vector2(targetWaypoint.x, targetWaypoint.y)
            const diff = wp.clone().sub(currentPos)
            const distance = diff.length()

            // Waypoint progression check
            if(distance < 2.0 && this.currentWaypointIndex < this.waypoints.length - 1)
            {
                this.currentWaypointIndex++
                return
            }

            // Final arrival check
            if(this.currentWaypointIndex >= this.waypoints.length - 1 && distance <= this.arrivalThreshold)
            {
                this.finishArrival()
                return
            }

            // Calculate drive direction
            const moveDir = diff.clone().normalize()
            const targetAngle = Math.atan2(moveDir.y, moveDir.x)

            // Speed calculation with smooth acceleration & arrival deceleration
            let targetSpeed = this.cruiseSpeed
            const finalWaypoint = this.waypoints[this.waypoints.length - 1]
            const distToFinal = finalWaypoint ? new THREE.Vector2(finalWaypoint.x, finalWaypoint.y).distanceTo(currentPos) : distance

            if(distToFinal < 5.0)
            {
                targetSpeed = Math.max(2.0, distToFinal * 2.2)
            }

            // Unbrake wheels so car rolls freely
            if(this.physics.car && this.physics.car.unbrake)
            {
                this.physics.car.unbrake()
            }

            // Advance chassis position directly & smoothly
            const step = targetSpeed * dt
            chassis.wakeUp()
            chassis.position.x += moveDir.x * step
            chassis.position.y += moveDir.y * step

            // Maintain stable ground elevation
            if(chassis.position.z < 0.2 || chassis.position.z > 2.0)
            {
                chassis.position.z = 0.5
            }
            chassis.velocity.x = moveDir.x * targetSpeed
            chassis.velocity.y = moveDir.y * targetSpeed
            chassis.velocity.z = 0

            // Smoothly align car orientation
            const currentAngle = Math.atan2(this.physics.car.worldForward.y, this.physics.car.worldForward.x)
            let angleDiff = targetAngle - currentAngle
            while(angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while(angleDiff < -Math.PI) angleDiff += Math.PI * 2
            const newAngle = currentAngle + angleDiff * Math.min(1.0, 7.0 * dt)
            chassis.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), newAngle)
            chassis.angularVelocity.set(0, 0, 0)

            // Sounds & wheel spin feedback
            if(this.sounds && this.sounds.engine)
            {
                this.sounds.engine.speed = targetSpeed
                this.sounds.engine.acceleration = 0.6
            }

            // Keep camera smoothly engaged
            if(this.camera && this.camera.pan)
            {
                this.camera.pan.reset()
            }
        })
    }

    /**
     * Plan safe waypoint path using the playground's road network
     */
    planRoute(startPos, endPos)
    {
        const route = []

        // If start and end are already very close, direct line
        const directDist = new THREE.Vector2(startPos.x, startPos.y).distanceTo(new THREE.Vector2(endPos.x, endPos.y))
        if(directDist < 8.0)
        {
            route.push({ x: endPos.x, y: endPos.y })
            return route
        }

        // 1. If car is currently parked inside a project area (Y < -32, X > 15),
        // pull back out to the Projects highway at Y = -30 first
        if(startPos.x > 15 && startPos.y < -32)
        {
            route.push({ x: startPos.x, y: -30 })
        }

        // 2. If target is in the Projects zone (X > 15, Y near -34.6)
        if(endPos.x > 15 && endPos.y > -50)
        {
            // If we are far from the Y = -30 highway, route via crossroads
            if(Math.abs(startPos.y - (-30)) > 6 && startPos.x < 15)
            {
                route.push({ x: 0, y: -30 })
            }
            route.push({ x: endPos.x, y: -30 })
            route.push({ x: endPos.x, y: endPos.y })
            return route
        }

        // 3. If target is south-east (Toolkit or Superpowers at Y = -65)
        if(endPos.y < -50 && endPos.x > 20)
        {
            if(startPos.y > -45)
            {
                route.push({ x: 0, y: -30 })
                route.push({ x: 0, y: -65 })
            }
            route.push({ x: endPos.x, y: -65 })
            route.push({ x: endPos.x, y: endPos.y })
            return route
        }

        // 4. If target is Journal / Articles (X = -45, Y = -30)
        if(endPos.x < -20)
        {
            if(Math.abs(startPos.y - (-30)) > 6)
            {
                route.push({ x: 0, y: -30 })
            }
            route.push({ x: -45, y: -30 })
            route.push({ x: endPos.x, y: endPos.y })
            return route
        }

        // 5. If target is Experience (0, -60) or Information / Contact (0, -115)
        if(Math.abs(endPos.x) < 15 && endPos.y < -40)
        {
            route.push({ x: 0, y: -30 })
            route.push({ x: 0, y: -60 })
            if(endPos.y < -80)
            {
                route.push({ x: 0, y: -95 })
            }
            route.push({ x: endPos.x, y: endPos.y })
            return route
        }

        // Default fallback through Crossroads
        route.push({ x: 0, y: -30 })
        route.push({ x: endPos.x, y: endPos.y })
        return route
    }

    navigateToProject(projectId)
    {
        const project = PORTFOLIO_KNOWLEDGE.projects.find(p => p.id === projectId)
        if(!project)
        {
            this.trigger('error', [`Project '${projectId}' not found in registry.`])
            return false
        }

        return this.startNavigation({
            id: project.id,
            name: project.title,
            type: 'project',
            target: project.targetLocation,
            data: project
        })
    }

    navigateToSection(sectionId)
    {
        const section = PORTFOLIO_KNOWLEDGE.sections[sectionId]
        if(!section)
        {
            this.trigger('error', [`Section '${sectionId}' not found in registry.`])
            return false
        }

        return this.startNavigation({
            id: sectionId,
            name: section.name,
            type: 'section',
            target: section.location,
            data: section
        })
    }

    startNavigation(targetInfo)
    {
        // Ensure world is started if user is still on the intro start screen
        if(this.world && this.world.ensureStarted)
        {
            this.world.ensureStarted()
        }

        const chassis = this.physics && this.physics.car && this.physics.car.chassis ? this.physics.car.chassis.body : null
        if(!chassis)
        {
            this.trigger('error', ['Car physics not initialized.'])
            return false
        }

        // Reset manual controls
        if(this.controls && this.controls.actions)
        {
            this.controls.actions.up = false
            this.controls.actions.down = false
            this.controls.actions.left = false
            this.controls.actions.right = false
            this.controls.actions.brake = false
            this.controls.actions.boost = false
        }

        const startPos = { x: chassis.position.x, y: chassis.position.y }
        this.currentTarget = targetInfo
        this.waypoints = this.planRoute(startPos, targetInfo.target)
        this.currentWaypointIndex = 0
        this.isNavigating = true
        this.navigationStartTime = Date.now()

        this.trigger('start', [targetInfo])
        this.trigger('status', [`Taking you to ${targetInfo.name}...`])
        return true
    }

    finishArrival()
    {
        const chassis = this.physics && this.physics.car && this.physics.car.chassis ? this.physics.car.chassis.body : null
        if(chassis)
        {
            chassis.velocity.set(0, 0, 0)
            chassis.angularVelocity.set(0, 0, 0)
        }

        if(this.sounds && this.sounds.engine)
        {
            this.sounds.engine.speed = 0
            this.sounds.engine.acceleration = 0
        }

        const arrivedTarget = this.currentTarget
        this.isNavigating = false
        this.currentTarget = null
        this.waypoints = []
        this.currentWaypointIndex = 0

        this.trigger('arrived', [arrivedTarget])
        this.trigger('status', [`Arrived at ${arrivedTarget ? arrivedTarget.name : 'destination'}.`])
    }

    cancel(reason = 'Navigation cancelled')
    {
        if(!this.isNavigating) return

        this.isNavigating = false
        const target = this.currentTarget
        this.currentTarget = null
        this.waypoints = []
        this.currentWaypointIndex = 0

        if(this.sounds && this.sounds.engine)
        {
            this.sounds.engine.acceleration = 0
        }

        this.trigger('cancelled', [{ target, reason }])
        this.trigger('status', [reason])
    }
}
