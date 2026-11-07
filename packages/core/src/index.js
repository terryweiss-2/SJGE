export const name = '@sjge/core';

export {
    SPORTS,
    CLIMATE_TYPES,
    commonProperties,
    commonRequired,
    buildStadiumSchema,
} from './stadium/commonSchema.js';

export {
    COLLECTION as baseballStadiumCollection,
    baseballDimensions as baseballStadiumDimensions,
    baseballStadiumSchema,
    baseballStadiumValidator,
    baseballStadiumIndexes,
    ensureBaseballStadiums,
} from './stadium/baseballStadiumSchema.js';

export {
    BaseStadiumGenerator,
    DEFAULT_GAME_VERSION,
    NAME_PREFIXES,
    NAME_SUFFIXES,
    LOCATIONS,
    createRng,
    slugify,
} from './stadium/baseStadiumGenerator.js';
