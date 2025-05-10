import { Game } from './Game.js'

export class CloseHandler
{
    constructor()
    {
        this.game = Game.getInstance()

        this.game.inputs.addMap([
            { name: 'close', categories: [ 'modal', 'focus', 'playing' ], keys: [ 'Escape' ] },
        ])
        this.game.inputs.events.on('close', (event) =>
        {
            if(event.down)
            {
                this.close()
            }
        })
    }

    close()
    {
        // Whispers flag select => Close
        if(this.game.world.whispers?.modal.flagsSelectOpen)
            this.game.world.whispers.modal.closeFlagSelect()

        // Projects => Close
        else if(this.game.world.scenery.projects?.opened)
            this.game.world.scenery.projects.close()

        // Modals => Toggle
        else
            this.game.modals.toggle()
    }
}