import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'

export class Toilet
{
    constructor(references)
    {
        this.game = Game.getInstance()

        this.references = references

        this.setCandleFlames()
    }

    setCandleFlames()
    {
        const mesh = this.references.get('moon')[0]
        mesh.visible = this.game.dayCycles.intervalEvents.get('lights').inInverval

        this.game.dayCycles.events.on('lights', (inInverval) =>
        {
            mesh.visible = inInverval
        })
    }
}