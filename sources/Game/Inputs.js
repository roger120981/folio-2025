import normalizeWheel from 'normalize-wheel'
import * as THREE from 'three/webgpu'

import { Events } from './Events.js'
import { Game } from './Game.js'

export class Inputs
{
    constructor(_map = [], filters = [])
    {
        this.game = Game.getInstance()
        this.events = new Events()

        this.map = []
        this.filters = []

        this.setKeys()
        this.setPointer()
        this.setWheel()
        this.addMap(_map)
        this.setFilters(filters)
    }

    addMap(_map)
    {
        this.map.push(..._map)
    }

    setWheel()
    {
        addEventListener('wheel', (_event) =>
        {
            const maps = this.map.filter((_map) => _map.keys.indexOf('wheel') !== - 1 )
            
            for(const map of maps)
            {
                if(this.checkCategory(map))
                {
                    const normalized = normalizeWheel(_event)
                    this.events.trigger(map.name, [ normalized.spinY ])
                }
            }
        }, { passive: true })
    }

    setPointer()
    {
        this.pointer = {}
        this.pointer.current = new THREE.Vector2()
        this.pointer.delta = new THREE.Vector2()
        this.pointer.upcoming = new THREE.Vector2()
        this.pointer.isDown = false
        this.pointer.upcomingDown = false
        this.pointer.hasMoved = false
        this.pointer.hasClicked = false
        this.pointer.hasReleased = false

        this.game.domElement.addEventListener('pointermove', (_event) =>
        {
            this.pointer.upcoming.set(_event.clientX, _event.clientY)
        })

        this.game.domElement.addEventListener('pointerdown', (_event) =>
        {
            this.pointer.upcomingDown = true
        })

        addEventListener('pointerup', (_event) =>
        {
            this.pointer.upcomingDown = false
        })

        this.game.ticker.events.on('tick', () =>
        {
            this.pointer.delta.copy(this.pointer.upcoming).sub(this.pointer.current)
            this.pointer.current.copy(this.pointer.upcoming)

            this.pointer.hasMoved = this.pointer.delta.x !== 0 || this.pointer.delta.y !== 0

            this.pointer.hasClicked = false
            this.pointer.hasReleased = false
            
            if(this.pointer.upcomingDown !== this.pointer.isDown)
            {
                this.pointer.isDown = this.pointer.upcomingDown

                if(this.pointer.isDown)
                    this.pointer.hasClicked = true
                else
                    this.pointer.hasReleased = true
            }
        }, 0)
    }

    setKeys()
    {
        this.keys = {}

        for(const _map of this.map)
            this.keys[_map.name] = false

        document.addEventListener('visibilitychange', () =>
        {
            // Tab opened
            if(!document.hidden)
            {
                // Each current key => Find map and simulate key up
                for(const keyName in this.keys)
                {
                    const map = this.map.find((_map) => _map.name === keyName)

                    delete this.keys[keyName]
                    this.events.trigger('keyUp', [ { down: false, name: map.name } ])
                    this.events.trigger(map.name, [ { down: false, name: map.name } ])
                }
            }
        })

        addEventListener('keydown', (_event) =>
        {
            this.down(_event.code)
        })

        addEventListener('keyup', (_event) =>
        {
            this.up(_event.code)
        })
    }

    checkCategory(map)
    {
        // No filter => Allow all
        if(this.filters.length === 0)
            return true

        // Has filter but no category on map => Forbid
        if(map.categories.length === 0)
            return true

        // Has matching category and filter => All
        for(const category of map.categories)
        {
            if(this.filters.indexOf(category) !== -1)
                return true
        }

        // Otherwise => Forbid
        return false
    }

    down(key)
    {
        const maps = this.map.filter((_map) => _map.keys.indexOf(key) !== - 1 )
        
        for(const map of maps)
        {
            if(map && !this.keys[map.name] && this.checkCategory(map))
            {
                this.keys[map.name] = true
                this.events.trigger('keyDown', [ { down: true, name: map.name } ])
                this.events.trigger(map.name, [ { down: true, name: map.name } ])
            }
        }
    }

    up(key)
    {
        const map = this.map.find((_map) => _map.keys.indexOf(key) !== - 1 )

        if(map && this.keys[map.name])
        {
            delete this.keys[map.name]
            this.events.trigger('keyUp', [ { down: false, name: map.name } ])
            this.events.trigger(map.name, [ { down: false, name: map.name } ])
        }
    }

    setFilters(filters = [])
    {
        this.filters = filters
    }
}