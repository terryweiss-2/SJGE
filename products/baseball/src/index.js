export const name = '@sjge/baseball';

export {BaseballStadiumGenerator, validateAgainstSchema} from './stadium/baseballStadiumGenerator.js';
export {
    DEFAULT_NUM_STADIUMS,
    DEFAULT_STADIUMS_DIR,
    STADIUMS_FILE,
    resolveCount,
    loadStadiums,
    syncStadiums,
} from './stadium/stadiumStore.js';
