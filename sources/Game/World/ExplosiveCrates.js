import gsap from 'gsap'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class ExplosiveCrates
{
    constructor()
    {
        this.game = Game.getInstance()

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.explosiveCratesModel.scene.children)
        this.references = references
        
        // Setup base
        for(const child of base.children)
        {
            child.castShadow = true
            child.receiveShadow = true
        }

        // Update materials 
        this.game.materials.updateObject(base)

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base, true)

        this.list = []
        
        let i = 0
        for(const reference of this.references)
        {
            const crate = {}
            crate.id = i
            crate.isSleeping = true
            crate.position = reference.clone()
            crate.object = this.game.objects.add(
                {
                    model: reference,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: 0.02,
                    sleeping: true,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.list.push(crate)

            i++
        }

        this.setSounds()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 3)
    }

    setSounds()
    {
        this.sounds = {}

        // Click sound
        this.sounds.click = this.game.audio.register(
            'click',
            {
                path: 'sounds/clicks/Source Metal Clicks Delicate Light Sharp Clip Mid 07.mp3',
                autoplay: false,
                loop: false,
                volume: 0.4,
                antiSpam: 0.1,
                playBinding: (item) =>
                {
                    item.volume = 0.4 + Math.random() * 0.2
                    item.rate = 0.7 + Math.random() * 1.3
                }
            }
        )

        this.sounds.explosion = this.game.audio.register(
            'explosion',
            {
                path: 'sounds/explosions/Explosion with Debris 01.mp3',
                autoplay: false,
                loop: false,
                volume: 0.4,
                antiSpam: 0.2,
                playBinding: (item) =>
                {
                    item.volume = 0.35 + Math.random() * 0.4
                    item.rate = 0.6 + Math.random() * 4
                }
            }
        )
    }

    update()
    {
        for(const crate of this.list)
        {
            // Sleeping state changed
            const isSleeping = crate.object.physical.body.isSleeping() || !crate.object.physical.body.isEnabled()
            if(crate.isSleeping !== isSleeping)
            {
                if(!isSleeping)
                {
                    this.sounds.click.play()

                    gsap.delayedCall(0.4, () =>
                    {
                        // Sound
                        this.sounds.explosion.play()

                        // Explode
                        this.game.world.fireballs.create(crate.object.physical.body.translation())

                        // Disable
                        this.game.objects.disable(crate.object)
                        crate.object.visual.object3D.position.y += 100 // Hide the instance reference

                        // Achievements
                        this.game.achievements.setProgress('explosiveCrates', crate.id)
                    })
                }
                crate.isSleeping = isSleeping
            }
        }
    }

    reset()
    {
        for(const crate of this.list)
            this.game.objects.resetObject(crate.object)
    }
}