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
    loadStadiums,
    stadiums,
    getStadiumById,
    getStadiumSvgPath,
    getStadiumSvg,
} from './stadium/stadiums.js';
