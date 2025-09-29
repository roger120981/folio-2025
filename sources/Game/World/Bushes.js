import * as THREE from 'three/webgpu'
import { color, uniform } from 'three/tsl'
import { Foliage } from './Foliage.js'
import { Game } from '../Game.js'

export class Bushes
{
    constructor()
    {
        this.game = Game.getInstance()

        this.colorNode = uniform(color('#8eaf58'))
        this.foliage = new Foliage(this.game.resources.bushesReferences.scene.children, this.colorNode)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌳 Bushes',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, this.colorNode.value, 'color')
            debugPanel.addBinding(this.foliage.material.shadowOffset, 'value', { label: 'shadowOffset', min: 0, max: 2, step: 0.001 })
        }
    }
}