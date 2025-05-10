import * as THREE from 'three/webgpu'
import { Fn, normalWorld, texture } from 'three/tsl'
import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'

export class Projects
{
    constructor(carpet, interactiveAreaPosition)
    {
        this.game = Game.getInstance()
        this.carpet = carpet
        this.interactiveAreaPosition = interactiveAreaPosition
        this.opened = false

        this.setInteractiveArea()

        this.game.inputs.events.on('backward', () =>
        {
            this.close()
        })

        this.game.inputs.events.on('left', () =>
        {
            this.previous()
        })

        this.game.inputs.events.on('right', () =>
        {
            this.next()
        })
    }

    setInteractiveArea()
    {
        this.game.interactiveAreas.create(
            this.interactiveAreaPosition,
            'Discover projects',
            InteractiveAreas.ALIGN_RIGHT,
            () =>
            {
                this.open()
            }
        )
    }

    open()
    {
        if(this.opened)
            return

        this.opened = true

        this.game.inputs.updateFilters(['focus'])
        
        console.log('open')
    }

    close()
    {
        if(!this.opened)
            return
            
        this.opened = false

        this.game.inputs.updateFilters([])

        console.log('close')
    }

    previous()
    {
        if(!this.opened)
            return
            
        console.log('previous')
    }

    next()
    {
        if(!this.opened)
            return
            
        console.log('next')
    }
}