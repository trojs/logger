import DefaultMutator from '@trojs/mutator'
import LevelEnum from '../enums/level.js'

/**
 * Logger mutator
 * @augments DefaultMutator
 */
class Logger extends DefaultMutator {
    setLevelAttribute(level) {
        return LevelEnum.fromKey(level)
    }
}

export default Logger
