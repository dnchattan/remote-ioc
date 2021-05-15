"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiProviderNames = exports.getApiProviders = exports.ApiProvider = void 0;
require("reflect-metadata");
const ApiDefinition_1 = require("./ApiDefinition");
const State_1 = require("./State");
const ApiProvider = (definition) => (target) => {
    const name = ApiDefinition_1.getApiDefinition(definition);
    if (!name) {
        throw new Error(`Type '${definition.name}' does not have an @ApiDefinition decorator`);
    }
    if (State_1.providers.has(definition)) {
        throw new Error(`Api provider already exists for the defintion '${name}'.`);
    }
    State_1.providers.set(definition, target);
    const definitions = Reflect.getMetadata(State_1.MetadataKeys.provider, target) || [];
    Reflect.metadata(State_1.MetadataKeys.provider, [...definitions, definition])(target);
    return target;
};
exports.ApiProvider = ApiProvider;
function getApiProviders(target) {
    var _a;
    return (_a = Reflect.getMetadata(State_1.MetadataKeys.provider, target)) !== null && _a !== void 0 ? _a : [];
}
exports.getApiProviders = getApiProviders;
function getApiProviderNames(target) {
    const definitions = getApiProviders(target);
    return definitions.map((definition) => ApiDefinition_1.getApiDefinition(definition));
}
exports.getApiProviderNames = getApiProviderNames;
//# sourceMappingURL=ApiProvider.js.map