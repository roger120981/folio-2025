import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { clamp, color, float, Fn, luminance, max, mix, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'

export class Altar
{
    constructor(position)
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💀 Altar',
                expanded: true,
            })
        }

        this.position = position.clone()

        this.setBeam()
    }

    setBeam()
    {
        const radius = 2.5
        const height = 4

        const colorBottom = uniform(color('#ff544d'))
        const colorTop = uniform(color('#ff1141'))
        const emissiveBottom = uniform(8)
        const emissiveTop = uniform(2.7)

        // Cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true)
        cylinderGeometry.translate(0, height * 0.5, 0)
        
        const cylinderMaterial = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, transparent: true })

        cylinderMaterial.outputNode = Fn(() =>
        {
            const baseUv = uv().toVar()

            // Emissive
            const emissiveUv = vec2(baseUv.x.mul(6).add(baseUv.y.mul(-2)), baseUv.y.mul(1).sub(this.game.ticker.elapsedScaledUniform.mul(0.2)))
            const emissiveNoise = texture(this.game.noises.others, emissiveUv).r
            emissiveNoise.addAssign(baseUv.y)
            const emissiveMask = step(1, emissiveNoise)
            const emissiveColor = mix(colorBottom.mul(emissiveBottom), colorTop.mul(emissiveTop), baseUv.y)

            // Goo
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog

            // Mix
            // const gooMask = step(emissiveNoise, 0.95)
            const gooMask = step(0.65, emissiveNoise)
            const finalColor = mix(emissiveColor, gooColor, gooMask)

            // Discard
            emissiveMask.greaterThan(0.5).discard()
            
            return vec4(finalColor, 1)
        })()

        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
        cylinder.position.copy(this.position)
        this.game.scene.add(cylinder)

        // Bottom
        const bottomGeometry = new THREE.CircleGeometry(radius, 32)
        
        const bottomMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })
        bottomMaterial.outputNode = vec4(this.game.fog.strength.mix(vec3(0), this.game.fog.color), 1)

        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial)
        bottom.position.copy(this.position)
        bottom.rotation.x = - Math.PI * 0.5
        this.game.scene.add(bottom)

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, colorBottom.value, 'colorBottom')
            this.debugPanel.addBinding(emissiveBottom, 'value', { label: 'emissiveBottom', min: 0, max: 10, step: 0.1 })
            this.game.debug.addThreeColorBinding(this.debugPanel, colorTop.value, 'colorTop')
            this.debugPanel.addBinding(emissiveTop, 'value', { label: 'emissiveTop', min: 0, max: 10, step: 0.1 })
        }
    }
}