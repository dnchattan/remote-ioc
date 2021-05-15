"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiDefinition = exports.ApiDefinition = void 0;
require("reflect-metadata");
const State_1 = require("./State");
const ApiDefinition = (name) => (target) => {
    if (State_1.definitions.has(name)) {
        throw new Error(`Api definition already exists for the name '${name}'.`);
    }
    if (Reflect.hasMetadata(State_1.MetadataKeys.definition, target)) {
        throw new Error(`Target already decorated with an @ApiDefintion`);
    }
    State_1.definitions.add(name);
    Reflect.metadata(State_1.MetadataKeys.definition, name)(target);
    return target;
};
exports.ApiDefinition = ApiDefinition;
function getApiDefinition(target) {
    return Reflect.getMetadata(State_1.MetadataKeys.definition, target);
}
exports.getApiDefinition = getApiDefinition;
//# sourceMappingURL=ApiDefinition.js.map