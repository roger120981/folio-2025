import * as THREE from 'three'
import { positionWorld, float, Fn, uniform, color, mix, vec3, vec4, normalWorld } from 'three'
import { Game } from './Game.js'

export class Materials
{
    constructor()
    {
        this.game = new Game()
        this.list = new Map()

        this.shadowMultiplier = uniform(color(0.14, 0.17, 0.45))
        this.lightEdgeLow = uniform(float(-0.25))
        this.lightEdgeHigh = uniform(float(1))

        this.colorBounce = uniform(color('#4c4700'))
        this.bounceEdgeLow = uniform(float(0))
        this.bounceEdgeHigh = uniform(float(1))

        this.lightOutputNode = Fn(([colorBase, totalShadows]) =>
        {
            const finalColor = vec3(colorBase).toVar()
            const bounceOrientation = normalWorld.dot(vec3(0, - 1, 0)).smoothstep(this.bounceEdgeLow, this.bounceEdgeHigh)
            const bounceDistance = float(1.5).sub(positionWorld.y)
            finalColor.addAssign(this.colorBounce.mul(bounceOrientation).mul(bounceDistance))

            const colorCoreShadow = colorBase.rgb.mul(this.shadowMultiplier).rgb
            const coreShadowMix = normalWorld.dot(this.game.lighting.directionUniform).smoothstep(this.lightEdgeLow, this.lightEdgeHigh)
            finalColor.assign(mix(colorCoreShadow, finalColor.mul(2), coreShadowMix))

            const castShadowMix = totalShadows.oneMinus()
            finalColor.assign(mix(finalColor, colorCoreShadow, castShadowMix))

            return vec4(finalColor, 1)
        })
        
        // Materials
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🎨 Materials',
                expanded: true,
            })

            debugPanel.addBinding(this.lightEdgeLow, 'value', { min: - 1, max: 1, step: 0.01 })
            debugPanel.addBinding(this.lightEdgeHigh, 'value', { min: - 1, max: 1, step: 0.01 })
            debugPanel.addBinding(this.shadowMultiplier, 'value', { color: { type: 'float' } })

            debugPanel.addBinding(this.bounceEdgeLow, 'value', { min: - 1, max: 1, step: 0.01 })
            debugPanel.addBinding(this.bounceEdgeHigh, 'value', { min: - 1, max: 1, step: 0.01 })
            // debugPanel.addBinding(this.colorBounce, 'value', { color: { type: 'float' } })
            debugPanel.addBinding({ color: this.colorBounce.value.getHex(THREE.SRGBColorSpace) }, 'color', { color: { type: 'float' } })
                .on('change', tweak => { this.colorBounce.value.set(tweak.value) })
        }
    }

    getFromName(name, baseMaterial)
    {
        // Return existing material
        if(this.list.has(name))
            return this.list.get(name)

        // Create new
        const material = this.createFromMaterial(baseMaterial)

        // Save
        this.list.set(name, material)
        return material
    }

    createFromMaterial(baseMaterial)
    {
        let material = null

        if(baseMaterial.isMeshBasicMaterial)
            material = new THREE.MeshBasicNodeMaterial()
        else
            material = new THREE.MeshLambertNodeMaterial()

        this.copy(baseMaterial, material)
        
        if(material.isMeshLambertNodeMaterial)
        {
            // Shadow
            material.shadowSide = THREE.BackSide

            // Shadow receive
            const totalShadows = float(1).toVar()
            material.receivedShadowNode = Fn(([ shadow ]) => 
            {
                totalShadows.mulAssign(shadow)

                return float(1)
            })

            // Output
            material.outputNode = this.lightOutputNode(baseMaterial.color, totalShadows)
        }

        material.name = baseMaterial.name
        return material
    }

    copy(baseMaterial, targetMaterial)
    {
        const properties = [ 'color' ]

        for(const property of properties)
        {
            if(typeof baseMaterial[property] !== 'undefined' && typeof targetMaterial[property] !== 'undefined')
                targetMaterial[property] = baseMaterial[property]
        }
    }

    updateObject(mesh)
    {
        mesh.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.material = this.getFromName(child.material.name, child.material)
            }
        })
    }
}