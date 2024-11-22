import { Game } from './Game.js'

export class Entities
{
    constructor()
    {
        this.game = new Game()
        this.list = new Map()
        this.key = 0

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 3)
    }

    add(_physicalDescription = null, _visual = null)
    {
        const entity = {
            physical: _physicalDescription ? this.game.physics.getPhysical(_physicalDescription) : null,
            visual: _visual
        }
        this.key++
        this.list.set(this.key, entity)

        if(_visual)
            this.game.scene.add(_visual)

        return entity
    }

    addFromModels(_physical, _visual)
    {
        const colliders = []

        // Visual
        this.game.materials.updateObject(_visual)

        // Colliders
        for(const physical of _physical.children)
        {
            colliders.push({
                shape: 'trimesh',
                parameters: [ physical.geometry.attributes.position.array, physical.geometry.index.array ],
                position: physical.position,
                quaternion: physical.quaternion,
            })
        }

        // Add
        this.add(
            {
                type: 'fixed',
                position: { x: 0, y: 0, z: 0 },
                colliders: colliders
            },
            _visual
        )
    }

    update()
    {
        this.list.forEach((_entity) =>
        {
            if(_entity.visual)
            {
                _entity.visual.position.copy(_entity.physical.body.translation())
                _entity.visual.quaternion.copy(_entity.physical.body.rotation())
            }
        })
    }
}