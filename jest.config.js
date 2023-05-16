const config = {
    moduleNameMapper: {
        "^(\\.{1,2}/.+)\\.js$": "$1",
    },
    transform: {
        "^.+\\.ts$": "@swc/jest",
    },
};

export default config;
