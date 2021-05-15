"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetState = exports.definitions = exports.providers = exports.MetadataKeys = void 0;
exports.MetadataKeys = {
    provider: Symbol('api:provider'),
    definition: Symbol('api:definition'),
};
exports.providers = new Map();
exports.definitions = new Set();
function resetState() {
    exports.providers.clear();
}
exports.resetState = resetState;
//# sourceMappingURL=State.js.map