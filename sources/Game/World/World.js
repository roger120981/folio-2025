import * as THREE from 'three'
import { Game } from '../Game.js'
import { Bushes } from './Bushes.js'
import { Floor } from './Floor.js'
import { Grass } from './Grass.js'
import { Playground } from './Playground.js'
import { BricksWalls } from './BricksWalls.js'

export class World
{
    constructor()
    {
        this.game = new Game()

        this.floor = new Floor()
        this.grass = new Grass()
        this.bushes = new Bushes()
        this.playground = new Playground()
        this.bricksWalls = new BricksWalls()
        // this.setTestCube()
        // this.setAxesHelper()
    }

    setAxesHelper()
    {
        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 1.5
        this.game.scene.add(axesHelper)
    }

    setTestCube()
    {
        const visualCube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalNodeMaterial()
        )

        this.game.entities.add(
            {
                type: 'dynamic',
                position: { x: 0, y: 4, z: 0 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ] } ]
            },
            visualCube
        )
    }
}